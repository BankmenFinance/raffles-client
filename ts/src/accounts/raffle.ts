/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AccountMeta,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY
} from '@solana/web3.js';
import { RafflesProgramClient } from '../client';
import { PrizeType, RaffleState } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import { deriveRaffleAddress, derivePrizeAddress } from '../utils/pda';
import BN from 'bn.js';
import { deriveConfigAddress } from '../utils/pda';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Mint,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { MPL_TOKEN_AUTH_RULES_PROGRAM_ID } from '@metaplex-foundation/mpl-token-auth-rules';
import { TransactionInstruction } from '@solana/web3.js';
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey
} from '@metaplex-foundation/umi-web3js-adapters';
import { defaultPublicKey, isSome, some } from '@metaplex-foundation/umi';
import {
  findMasterEditionPda,
  findMetadataPda,
  findTokenRecordPda,
  Metadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  TokenStandard
} from '@metaplex-foundation/mpl-token-metadata';
import {
  ConcurrentMerkleTreeAccount,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID
} from '@solana/spl-account-compression';
import {
  ReadApiAsset,
  GetAssetProofRpcResponse
} from '@metaplex-foundation/mpl-bubblegum';

/**
 * Represents a Raffle.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class RaffleAccount {
  constructor(
    readonly client: RafflesProgramClient,
    readonly address: PublicKey,
    public state: RaffleState,
    private _onStateUpdate?: StateUpdateHandler<RaffleState>
  ) {
    this.subscribe();
  }

  /**
   * Derives program addresses and generates necessary intructions to create a Raffle.
   * @param client The Raffles Client.
   * @param endTimestamp The ending timestamp of the raffle.
   * @param ticketPrice The price of a ticket, denominated in native units.
   * @param maxEntrants The maximum number of entrants in this raffle.
   * @returns The accounts, instructions and signers, if necessary.
   */
  static async create(
    client: RafflesProgramClient,
    proceedsMint: PublicKey,
    endTimestamp: BN,
    ticketPrice: BN,
    maxEntrants: number
  ): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    const entrants = new Keypair();
    const [raffle, raffleBump] = deriveRaffleAddress(
      entrants.publicKey,
      client.programId
    );
    const proceeds = await getAssociatedTokenAddress(raffle, proceedsMint);

    const ix = await client.methods
      .createRaffle(endTimestamp, ticketPrice, maxEntrants)
      .accountsStrict({
        raffle,
        entrants: entrants.publicKey,
        proceeds,
        proceedsMint,
        creator: client.walletPubkey,
        payer: client.walletPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
      })
      .instruction();

    return {
      accounts: [raffle, entrants.publicKey, proceeds],
      ixs: [ix],
      signers: [entrants]
    };
  }

  /**
   * Loads all existing Raffles.
   * @param client The Raffles Client instance.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Raffles.
   */
  static async loadAll(
    client: RafflesProgramClient,
    onStateUpdateHandler?: StateUpdateHandler<RaffleState>
  ): Promise<RaffleAccount[]> {
    const raffleAccounts = await client.accounts.raffle.all();
    const raffles = [];

    for (const raffleAccount of raffleAccounts) {
      raffles.push(
        new RaffleAccount(
          client,
          raffleAccount.publicKey,
          raffleAccount.account as RaffleState,
          onStateUpdateHandler
        )
      );
    }

    return raffles;
  }

  /**
   * Loads the given Raffle.
   * @param client The Raffles Client instance.
   * @param address The address of the Raffle to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve a Raffle.
   */
  static async load(
    client: RafflesProgramClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<RaffleState>
  ): Promise<RaffleAccount> {
    const state = await client.accounts.raffle.fetchNullable(address);

    if (state === null) return null;

    return new RaffleAccount(
      client,
      address,
      state as RaffleState,
      onStateUpdateHandler
    );
  }

  /**
   * Buys tickets for this raffle. .
   * @param client The amount of tickets to buy.
   * @returns A promise which may resolve a Raffle.
   */
  async addPrize(
    amount: BN,
    prizeType: PrizeType,
    metadataAccount?: Metadata,
    asset?: ReadApiAsset,
    merkleTree?: ConcurrentMerkleTreeAccount,
    assetProof?: GetAssetProofRpcResponse
  ): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    if (metadataAccount && (assetProof || merkleTree)) {
      throw new Error(
        'Invalid arguments. `metadataAccount` cannot be passed for compressed NFTs.'
      );
    }

    const [prize] = derivePrizeAddress(
      this.address,
      this.prizes,
      this.client.programId
    );

    const accounts = {
      raffle: this.address,
      prize,
      creator: this.client.walletPubkey,
      instructions: null,
      prizeMint: null,
      prizeTokenAccount: null,
      prizeEdition: null,
      prizeMetadata: null,
      prizeTokenRecord: null,
      prizeMerkleTree: null,
      prizeMerkleTreeAuthority: null,
      prizeLeafOwner: null,
      prizeLeafDelegate: null,
      sourceTokenAccount: null,
      sourceTokenRecord: null,
      authorizationRules: null,
      payer: this.client.walletPubkey,
      systemProgram: SystemProgram.programId,
      tokenProgram: null,
      associatedTokenProgram: null,
      metadataProgram: null,
      authRulesProgram: null,
      bubblegumProgram: null,
      accountCompressionProgram: null,
      noOpProgram: null,
      rent: SYSVAR_RENT_PUBKEY
    };

    // checks for metadata account existence
    if (
      metadataAccount && isSome(metadataAccount.tokenStandard)
    ) {
      const tokenStandard = metadataAccount.tokenStandard.value;
      const sourceTokenAccount = await getAssociatedTokenAddress(
        this.client.walletPubkey,
        toWeb3JsPublicKey(metadataAccount.mint)
      );
      const prizeTokenAccount = await getAssociatedTokenAddress(
        prize,
        toWeb3JsPublicKey(metadataAccount.mint)
      );


      accounts.sourceTokenAccount = sourceTokenAccount;
      accounts.prizeTokenAccount = prizeTokenAccount;
      accounts.prizeMint = metadataAccount.mint;

      // check if it is legacy nft | programmable nft
      if (
        tokenStandard === 0 ||
        tokenStandard === 1 ||
        tokenStandard === 3 ||
        tokenStandard === 4 ||
        tokenStandard === 5
      ) {

        const [metadata] = findMetadataPda(this.client.umi, {
          mint: metadataAccount.mint
        });

        const [edition] = findMasterEditionPda(this.client.umi, {
          mint: metadataAccount.mint
        });

        accounts.prizeEdition = edition;
        accounts.prizeMetadata = metadata;

        accounts.metadataProgram = MPL_TOKEN_METADATA_PROGRAM_ID;
        accounts.instructions = SYSVAR_INSTRUCTIONS_PUBKEY;
      }

      // check if it is programmable nft
      if (tokenStandard === 4 ||
        tokenStandard === 5) {
        const [prizeTokenRecord] = findTokenRecordPda(this.client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(prizeTokenAccount)
        });
        const [sourceTokenRecord] = findTokenRecordPda(this.client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(sourceTokenAccount)
        });
        accounts.sourceTokenRecord = sourceTokenRecord;
        accounts.prizeTokenRecord = prizeTokenRecord;
      }
      let authorizationRules = null;

      // check if the programmable nft has a rule set
      if (
        isSome(metadataAccount.programmableConfig) &&
        isSome(metadataAccount.programmableConfig.value.ruleSet) &&
        defaultPublicKey().toString() !==
        metadataAccount.programmableConfig.value.ruleSet.value.toString()
      ) {
        authorizationRules =
          metadataAccount.programmableConfig.value.ruleSet.value;
      }
      // set the authorization rules account we tried to fetch before
      // if it is null, no problem, means it shouldn't be there anyway
      accounts.authorizationRules = authorizationRules;
      if (authorizationRules) {
        accounts.authRulesProgram = MPL_TOKEN_AUTH_RULES_PROGRAM_ID;
      }

      accounts.tokenProgram = TOKEN_PROGRAM_ID;
      accounts.associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
    }

    // if we get in here we know for sure that this is a compressed nft
    if (merkleTree && assetProof) {
      accounts.prizeMerkleTree = asset.compression.tree;
      accounts.prizeMerkleTreeAuthority = merkleTree.getAuthority();
      accounts.prizeLeafDelegate = prize;
      accounts.prizeLeafOwner = prize;
      accounts.noOpProgram = SPL_NOOP_PROGRAM_ID;
      accounts.accountCompressionProgram = SPL_ACCOUNT_COMPRESSION_PROGRAM_ID;
    }

    const prizeTypeArgs = assetProof
      ? {
        prizeType: {
          compressed: {
            root: [...new PublicKey(assetProof.root.trim()).toBytes()],
            dataHash: [
              ...new PublicKey(asset.compression.data_hash.trim()).toBytes()
            ],
            creatorHash: [
              ...new PublicKey(
                asset.compression.creator_hash.trim()
              ).toBytes()
            ],
            nonce: asset.compression.leaf_id,
            index: asset.compression.leaf_id
          }
        }
      }
      : prizeType;

    const ix = await this.client.methods
      .addPrize({
        prizeIndex: this.prizes,
        amount,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prizeType: prizeTypeArgs as any
      })
      .accountsStrict(accounts)
      .instruction();

    if (merkleTree) {
      // parse the list of proof addresses into a valid AccountMeta[]
      const canopyDepth = merkleTree.getCanopyDepth();
      const proof: AccountMeta[] = assetProof.proof
        // eslint-disable-next-line no-extra-boolean-cast
        .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0))
        .map((node: string) => ({
          pubkey: new PublicKey(node),
          isSigner: false,
          isWritable: false
        }));
      ix.keys.push(...proof);
    }

    return {
      accounts: [prize],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Buys tickets for this raffle. .
   * @param client The amount of tickets to buy.
   * @returns A promise which may resolve a Raffle.
   */
  async buyTickets(amount: number): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    const [config] = deriveConfigAddress(this.client.programId);
    const proceeds = await getAssociatedTokenAddress(
      this.address,
      this.proceedsMint
    );
    const buyerTokenAccount = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      this.state.proceedsMint
    );

    const ix = await this.client.methods
      .buyTickets(amount)
      .accountsStrict({
        raffle: this.address,
        entrants: this.state.entrants,
        proceeds,
        tokenProgram: TOKEN_PROGRAM_ID,
        config,
        buyerTokenAccount,
        buyerTransferAuthority: this.client.walletPubkey,
        slotHashes: SYSVAR_SLOT_HASHES_PUBKEY
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /** Gets the creator of the Raffle. */
  get creator(): PublicKey {
    return this.state.creator;
  }

  /** Gets the Entrants account of the Raffle. */
  get entrants(): PublicKey {
    return this.state.entrants;
  }

  /** Gets the proceeds Token Mint of the Raffle. */
  get proceedsMint(): PublicKey {
    return this.state.proceedsMint;
  }

  /** Gets the total amount of prizes registered for this Raffle. */
  get prizes(): number {
    return this.state.totalPrizes;
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe() {
    this.client.accounts.raffle
      .subscribe(this.address)
      .on('change', (state: RaffleState) => {
        this.state = state;
        // todo: check if dexMarkets need to be reloaded.(market listing/delisting)
        if (this._onStateUpdate) {
          this._onStateUpdate(this.state);
        }
      });
  }

  /**
   * Unsubscribes to state changes of this account.
   */
  async unsubscribe() {
    await this.client.accounts.raffle.unsubscribe(this.address);
  }
}
