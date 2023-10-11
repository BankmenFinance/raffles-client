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
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
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
import { ConfigAccount } from './config';
import { createAddPrizeInstruction } from '../instructions';
import { getAssociatedTokenAddress } from '@solana/spl-token';

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
    if (_onStateUpdate) {
      this.subscribe();
    }
  }

  /**
   * Derives program addresses and generates necessary intructions to create a Raffle.
   * @param client The Raffles Client.
   * @param endTimestamp The ending timestamp of the raffle.
   * @param ticketPrice The price of a ticket, denominated in native units.
   * @param maxEntrants The maximum number of entrants in this raffle.
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
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
    const proceeds = await getAssociatedTokenAddress(
      proceedsMint,
      raffle,
      true
    );

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
   * Loads multiple existing Raffles.
   * @param client The Raffles Client instance.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Raffles.
   */
  static async loadMultiple(
    client: RafflesProgramClient,
    addresses: PublicKey[],
    onStateUpdateHandler?: StateUpdateHandler<RaffleState>
  ): Promise<RaffleAccount[]> {
    const raffleAccounts = await client.accounts.raffle.fetchMultiple(
      addresses
    );
    const raffles = [];

    for (const i in raffleAccounts) {
      raffles.push(
        new RaffleAccount(
          client,
          addresses[i],
          raffleAccounts[i] as RaffleState,
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
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
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
    return await createAddPrizeInstruction(
      this.client,
      this.address,
      this.prizes,
      amount,
      prizeType,
      metadataAccount,
      asset,
      merkleTree,
      assetProof
    );
  }

  /**
   * Buys tickets for this raffle. .
   * @param client The amount of tickets to buy.
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
   */
  async buyTickets(amount: number): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    const [config] = deriveConfigAddress(this.client.programId);
    const proceeds = await getAssociatedTokenAddress(
      this.proceedsMint,
      this.address,
      true
    );
    const buyerTokenAccount = await getAssociatedTokenAddress(
      this.state.proceedsMint,
      this.client.walletPubkey
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

  /**
   * Reveals the winner for this raffle.
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
   */
  async revealWinner(): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    const ix = await this.client.methods
      .revealWinners()
      .accountsStrict({
        raffle: this.address,
        slotHashes: SYSVAR_SLOT_HASHES_PUBKEY
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Collects the proceeds of the raffle.
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
   */
  async collectProceeds(configAccount: ConfigAccount): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    const [config] = deriveConfigAddress(this.client.programId);
    const proceeds = await getAssociatedTokenAddress(
      this.proceedsMint,
      this.address,
      true
    );
    const creatorProceeds = await getAssociatedTokenAddress(
      this.state.proceedsMint,
      this.creator
    );
    const protocolProceeds = await getAssociatedTokenAddress(
      this.state.proceedsMint,
      configAccount.authority,
      true
    );

    const createProtocolProceedsIx =
      await createAssociatedTokenAccountIdempotentInstruction(
        this.client.walletPubkey,
        protocolProceeds,
        configAccount.authority,
        this.proceedsMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
    const ix = await this.client.methods
      .collectProceeds()
      .accountsStrict({
        config,
        raffle: this.address,
        creator: this.creator,
        proceedsMint: this.proceedsMint,
        proceeds,
        creatorProceeds,
        protocolProceeds,
        tokenProgram: TOKEN_PROGRAM_ID
      })
      .instruction();

    return {
      accounts: [],
      ixs: [createProtocolProceedsIx, ix],
      signers: []
    };
  }

  /**
   * Closes the Raffle and Entrants account, collecting the rent.
   * @returns A promise which may resolve the new accounts and necessary instructions and signers to submit a transaction.
   */
  async close(): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    const closeEntrantsIx = await this.client.methods
      .closeEntrants()
      .accountsStrict({
        raffle: this.address,
        entrants: this.entrants,
        creator: this.creator
      })
      .instruction();

    const proceeds = await getAssociatedTokenAddress(
      this.proceedsMint,
      this.address
    );
    const closeRaffleIx = await this.client.methods
      .closeRaffle()
      .accountsStrict({
        raffle: this.address,
        proceeds,
        creator: this.creator
      })
      .instruction();

    return {
      accounts: [],
      ixs: [closeEntrantsIx, closeRaffleIx],
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

  /** Gets the randomness used to derive the winner ticket indices for this Raffle. */
  get randomness(): number[] {
    return this.state.randomness;
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
