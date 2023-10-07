import {
  AccountMeta,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction
} from '@solana/web3.js';
import { RafflesProgramClient } from '../client';
import { PrizeState } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';
import { RaffleAccount } from './raffle';
import {
  ConcurrentMerkleTreeAccount,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID
} from '@solana/spl-account-compression';
import { BN } from '@coral-xyz/anchor';
import {
  findMasterEditionPda,
  findMetadataPda,
  findTokenRecordPda,
  Metadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  TokenStandard
} from '@metaplex-foundation/mpl-token-metadata';
import { MPL_TOKEN_AUTH_RULES_PROGRAM_ID } from '@metaplex-foundation/mpl-token-auth-rules';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey
} from '@metaplex-foundation/umi-web3js-adapters';
import {
  GetAssetProofRpcResponse,
  ReadApiAsset
} from '@metaplex-foundation/mpl-bubblegum';
import { defaultPublicKey, isSome } from '@metaplex-foundation/umi';

/**
 * Represents a Prize.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class PrizeAccount {
  constructor(
    readonly client: RafflesProgramClient,
    readonly address: PublicKey,
    public state: PrizeState,
    private _onStateUpdate?: StateUpdateHandler<PrizeState>
  ) {
    if (_onStateUpdate) {
      this.subscribe();
    }
  }

  /**
   * Loads all existing Prizes.
   * @param client The Raffles Client instance.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Prizes.
   */
  static async loadAll(
    client: RafflesProgramClient,
    onStateUpdateHandler?: StateUpdateHandler<PrizeState>
  ): Promise<PrizeAccount[]> {
    const raffleAccounts = await client.accounts.prize.all();
    const raffles = [];

    for (const raffleAccount of raffleAccounts) {
      raffles.push(
        new PrizeAccount(
          client,
          raffleAccount.publicKey,
          raffleAccount.account as PrizeState,
          onStateUpdateHandler
        )
      );
    }

    return raffles;
  }

  /**
   * Loads the given Prize.
   * @param client The Raffles Client instance.
   * @param address The address of the Raffle to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve a Prize.
   */
  static async load(
    client: RafflesProgramClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<PrizeState>
  ): Promise<PrizeAccount> {
    const state = await client.accounts.prize.fetchNullable(address);

    if (state === null) return null;

    return new PrizeAccount(
      client,
      address,
      state as PrizeState,
      onStateUpdateHandler
    );
  }

  /**
   * Claims this Prize.
   * @param client The amount of tickets to buy.
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
   */
  async claimPrize(
    raffle: RaffleAccount,
    ticketIndex: number,
    asset?: ReadApiAsset,
    metadataAccount?: Metadata,
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

    const accounts = {
      raffle: raffle.address,
      prize: this.address,
      entrants: raffle.entrants,
      creator: raffle.creator,
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
      winnerTokenAccount: null,
      winnerTokenRecord: null,
      winner: this.client.walletPubkey,
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

    // if we get in here we know for sure that this is a token | legacy nft | programmable nft
    if (metadataAccount && isSome(metadataAccount.tokenStandard)) {
      const tokenStandard = metadataAccount.tokenStandard.value;
      const prizeTokenAccount = await getAssociatedTokenAddress(
        this.address,
        toWeb3JsPublicKey(metadataAccount.mint)
      );
      const winnerTokenAccount = await getAssociatedTokenAddress(
        this.client.walletPubkey,
        toWeb3JsPublicKey(metadataAccount.mint)
      );
      accounts.prizeMint = metadataAccount.mint;
      accounts.prizeTokenAccount = prizeTokenAccount;
      accounts.winnerTokenAccount = winnerTokenAccount;

      // check if it is legacy nft | programmable nft
      if (
        tokenStandard === TokenStandard.NonFungible ||
        tokenStandard === TokenStandard.FungibleAsset ||
        tokenStandard === TokenStandard.NonFungibleEdition ||
        tokenStandard === TokenStandard.ProgrammableNonFungible ||
        tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
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
      if (
        tokenStandard === TokenStandard.ProgrammableNonFungible ||
        tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
      ) {
        const [prizeTokenRecord] = findTokenRecordPda(this.client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(prizeTokenAccount)
        });
        const [winnerTokenRecord] = findTokenRecordPda(this.client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(winnerTokenAccount)
        });
        accounts.prizeTokenRecord = prizeTokenRecord;
        accounts.winnerTokenRecord = winnerTokenRecord;
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
      accounts.prizeMerkleTree = merkleTree;
      accounts.prizeMerkleTreeAuthority = merkleTree.getAuthority();
      accounts.prizeLeafDelegate = this.address;
      accounts.prizeLeafOwner = this.address;
      accounts.noOpProgram = SPL_NOOP_PROGRAM_ID;
      accounts.accountCompressionProgram = SPL_ACCOUNT_COMPRESSION_PROGRAM_ID;
    }

    const compressedArgs =
      merkleTree && assetProof
        ? {
            root: [...new PublicKey(assetProof.root.trim()).toBytes()],
            dataHash: [
              ...new PublicKey(asset.compression.data_hash.trim()).toBytes()
            ],
            creatorHash: [
              ...new PublicKey(asset.compression.creator_hash.trim()).toBytes()
            ],
            nonce: new BN(asset.compression.leaf_id),
            index: asset.compression.leaf_id
          }
        : null;

    //console.log(accounts);

    const ix = await this.client.methods
      .claimPrize(this.state.prizeIndex, ticketIndex, compressedArgs)
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
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Claims this Prize for it's winner.
   * This instruction is permissionless so we can claim on behalf of winners.
   * @param client The amount of tickets to buy.
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
   */
  async claimForWinner(
    raffle: RaffleAccount,
    winner: PublicKey,
    ticketIndex: number,
    asset?: ReadApiAsset,
    metadataAccount?: Metadata,
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

    const accounts = {
      raffle: raffle.address,
      prize: this.address,
      entrants: raffle.entrants,
      creator: raffle.creator,
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
      winnerTokenAccount: null,
      winnerTokenRecord: null,
      winner,
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

    // if we get in here we know for sure that this is a token | legacy nft | programmable nft
    if (metadataAccount && isSome(metadataAccount.tokenStandard)) {
      const tokenStandard = metadataAccount.tokenStandard.value;
      const prizeTokenAccount = await getAssociatedTokenAddress(
        this.address,
        toWeb3JsPublicKey(metadataAccount.mint)
      );
      const winnerTokenAccount = await getAssociatedTokenAddress(
        winner,
        toWeb3JsPublicKey(metadataAccount.mint)
      );
      accounts.prizeMint = metadataAccount.mint;
      accounts.prizeTokenAccount = prizeTokenAccount;
      accounts.winnerTokenAccount = winnerTokenAccount;

      // check if it is legacy nft | programmable nft
      if (
        tokenStandard === TokenStandard.NonFungible ||
        tokenStandard === TokenStandard.FungibleAsset ||
        tokenStandard === TokenStandard.NonFungibleEdition ||
        tokenStandard === TokenStandard.ProgrammableNonFungible ||
        tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
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
      if (
        tokenStandard === TokenStandard.ProgrammableNonFungible ||
        tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
      ) {
        const [prizeTokenRecord] = findTokenRecordPda(this.client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(prizeTokenAccount)
        });
        const [winnerTokenRecord] = findTokenRecordPda(this.client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(winnerTokenAccount)
        });
        accounts.prizeTokenRecord = prizeTokenRecord;
        accounts.winnerTokenRecord = winnerTokenRecord;
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
      accounts.prizeMerkleTree = merkleTree;
      accounts.prizeMerkleTreeAuthority = merkleTree.getAuthority();
      accounts.prizeLeafDelegate = this.address;
      accounts.prizeLeafOwner = this.address;
      accounts.noOpProgram = SPL_NOOP_PROGRAM_ID;
      accounts.accountCompressionProgram = SPL_ACCOUNT_COMPRESSION_PROGRAM_ID;
    }

    const compressedArgs =
      merkleTree && assetProof
        ? {
            root: [...new PublicKey(assetProof.root.trim()).toBytes()],
            dataHash: [
              ...new PublicKey(asset.compression.data_hash.trim()).toBytes()
            ],
            creatorHash: [
              ...new PublicKey(asset.compression.creator_hash.trim()).toBytes()
            ],
            nonce: new BN(asset.compression.leaf_id),
            index: asset.compression.leaf_id
          }
        : null;

    //console.log(accounts);
    const ix = await this.client.methods
      .claimPrize(this.state.prizeIndex, ticketIndex, compressedArgs)
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
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe() {
    this.client.accounts.prize
      .subscribe(this.address)
      .on('change', (state: PrizeState) => {
        this.state = state;
        if (this._onStateUpdate) {
          this._onStateUpdate(this.state);
        }
      });
  }

  /**
   * Unsubscribes to state changes of this account.
   */
  async unsubscribe() {
    await this.client.accounts.prize.unsubscribe(this.address);
  }
}
