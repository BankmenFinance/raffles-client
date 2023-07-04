/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';
import { RafflesClient } from '../client';
import { RaffleState } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import {
  deriveRaffleAddress,
  derivePrizeAddress,
  deriveProceedsAddress
} from '../utils/pda';
import BN from 'bn.js';
import { deriveConfigAddress } from '../utils/pda';
import { getAssociatedTokenAddress } from '@project-serum/associated-token';

/**
 * Represents a Raffle.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class Raffle {
  constructor(
    readonly client: RafflesClient,
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
    client: RafflesClient,
    proceedsMint: PublicKey,
    endTimestamp: BN,
    ticketPrice: BN,
    maxEntrants: number
  ) {
    const entrants = new Keypair();
    const [raffle, raffleBump] = deriveRaffleAddress(
      entrants.publicKey,
      client.programId
    );
    const [proceeds, proceedsBump] = deriveProceedsAddress(
      raffle,
      client.programId
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
        rent: SYSVAR_RENT_PUBKEY
      })
      .instruction();

    return {
      accounts: [raffle, entrants, proceeds],
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
    client: RafflesClient,
    onStateUpdateHandler?: StateUpdateHandler<RaffleState>
  ): Promise<Raffle[]> {
    const raffleAccounts = await client.accounts.raffle.all();
    const raffles = [];

    for (const raffleAccount of raffleAccounts) {
      raffles.push(
        new Raffle(
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
    client: RafflesClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<RaffleState>
  ): Promise<Raffle> {
    const state = await client.accounts.raffle.fetchNullable(address);

    if (state === null) return null;

    return new Raffle(
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
  async addPrize(prizeMint: PublicKey, prizeIndex: number, amount: BN) {
    const from = await getAssociatedTokenAddress(
      this.client.walletPubkey,
      prizeMint
    );
    const [prize] = derivePrizeAddress(
      this.address,
      prizeIndex,
      this.client.programId
    );
    const ix = await this.client.methods
      .addPrize(prizeIndex, amount)
      .accountsStrict({
        raffle: this.address,
        from,
        prize,
        prizeMint,
        creator: this.client.walletPubkey,
        payer: this.client.walletPubkey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY
      })
      .instruction();

    return {
      accounts: [],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Buys tickets for this raffle. .
   * @param client The amount of tickets to buy.
   * @returns A promise which may resolve a Raffle.
   */
  async buyTickets(amount: number, buyerTokenAccount?: PublicKey) {
    const [config] = deriveConfigAddress(this.client.programId);
    const [proceeds, proceedsBump] = deriveProceedsAddress(
      this.address,
      this.client.programId
    );
    if (buyerTokenAccount) {
      const ix = await this.client.methods
        .buyTickets(amount)
        .accountsStrict({
          raffle: this.address,
          entrants: this.state.entrants,
          proceeds,
          tokenProgram: TOKEN_PROGRAM_ID,
          config,
          buyerTokenAccount,
          buyerTransferAuthority: this.client.walletPubkey
        })
        .instruction();

      return {
        accounts: [],
        ixs: [ix],
        signers: []
      };
    } else {
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
          buyerTransferAuthority: this.client.walletPubkey
        })
        .instruction();

      return {
        accounts: [],
        ixs: [ix],
        signers: []
      };
    }
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
