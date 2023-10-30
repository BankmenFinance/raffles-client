import { AccountInfo, PUBLIC_KEY_LENGTH, PublicKey } from '@solana/web3.js';
import { RafflesProgramClient } from '../client';
import { EntrantsState } from '../types/on-chain';
import { ErrorHandler, StateUpdateHandler } from '../types';

/**
 * Represents an Entrants account, this account stores information about entrants of a Raffle.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class EntrantsAccount {
  private _listener: number;
  public lastSlotUpdate: number;
  constructor(
    readonly client: RafflesProgramClient,
    readonly address: PublicKey,
    public state: EntrantsState,
    private data: AccountInfo<Buffer>,
    private _onStateUpdateHandler?: StateUpdateHandler<EntrantsState>,
    private _errorHandler?: ErrorHandler
  ) {
    if (_onStateUpdateHandler) {
      this.subscribe();
    }
  }

  /**
   * Loads the given Entrants account.
   * @param client The Raffles Client instance.
   * @param address The address of the Entrants account to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve an EntrantsAccount.
   */
  static async load(
    client: RafflesProgramClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<EntrantsState>,
    errorHandler?: ErrorHandler
  ): Promise<EntrantsAccount> {
    const accountInfo = await client.accounts.entrants.getAccountInfo(address);

    const state = client.accounts.entrants.coder.accounts.decode(
      'Entrants',
      accountInfo.data
    );

    if (state === null) return null;

    return new EntrantsAccount(
      client,
      address,
      state as EntrantsState,
      accountInfo,
      onStateUpdateHandler,
      errorHandler
    );
  }

  /**
   * The maximum number of entrants for the associated Raffle.
   */
  get max(): number {
    return this.state.max;
  }

  /**
   * The total number of entrants so far for the associated Raffle.
   */
  get total(): number {
    return this.state.total;
  }

  /**
   * Gets the entrant at the given index.
   * @param index The index of the entry.
   * @returns The Public Key of the entrant.
   */
  getEntrant(index: number): PublicKey {
    const startIndex = 8 + 4 + 4 + PUBLIC_KEY_LENGTH * index;
    return new PublicKey(
      this.data.data.subarray(startIndex, startIndex + PUBLIC_KEY_LENGTH)
    );
  }

  /**
   * Subscribes to state changes of this account.
   */
  async subscribe() {
    await this.removeListener();
    try {
      this.addListener();
    } catch (error: unknown) {
      if (this._errorHandler) {
        this._errorHandler(error);
      }
    }
  }

  private addListener() {
    this.client.connection.onAccountChange(this.address, (accountInfo, ctx) => {
      this.data = accountInfo;
      this.lastSlotUpdate = ctx.slot;
      const state = this.client.accounts.entrants.coder.accounts.decode(
        'Entrants',
        accountInfo.data
      );
      this.state = state;
      if (this._onStateUpdateHandler) {
        this._onStateUpdateHandler(this.state);
      }
    });
  }

  private async removeListener() {
    if (this._listener) {
      await this.client.connection.removeAccountChangeListener(this._listener);
      this._listener = null;
    }
  }

  /**
   * Unsubscribes to state changes of this account.
   */
  async unsubscribe() {
    await this.removeListener();
  }
}
