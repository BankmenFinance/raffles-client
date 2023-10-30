import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { RafflesProgramClient } from '../client';
import { PrizeState } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import { RaffleAccount } from './raffle';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { createClaimPrizeInstruction } from '../instructions';

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
   * Loads multiple existing Prizes.
   * @param client The Raffles Client instance.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an array of Prizes.
   */
  static async loadMultiple(
    client: RafflesProgramClient,
    addresses: PublicKey[],
    onStateUpdateHandler?: StateUpdateHandler<PrizeState>
  ): Promise<PrizeAccount[]> {
    const prizeAccounts = await client.accounts.prize.fetchMultiple(addresses);
    const prizes = [];

    for (const i in prizeAccounts) {
      prizes.push(
        new PrizeAccount(
          client,
          addresses[i],
          prizeAccounts[i] as PrizeState,
          onStateUpdateHandler
        )
      );
    }

    return prizes;
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
    metadataAccount?: Metadata
  ): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    return await createClaimPrizeInstruction(
      this.client,
      raffle.address,
      this.address,
      raffle.entrants,
      raffle.creator,
      this.client.walletPubkey,
      this.client.walletPubkey,
      this.state.prizeIndex,
      ticketIndex,
      metadataAccount
    );
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
    metadataAccount?: Metadata
  ): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    return await createClaimPrizeInstruction(
      this.client,
      raffle.address,
      this.address,
      raffle.entrants,
      raffle.creator,
      winner,
      this.client.walletPubkey,
      this.state.prizeIndex,
      ticketIndex,
      metadataAccount
    );
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
