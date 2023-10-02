import { AccountInfo, PublicKey } from '@solana/web3.js';
import { RafflesProgramClient } from '../client';
import { EntrantsState } from '../types/on-chain';
import { StateUpdateHandler } from '../types';

/**
 * Represents an Entrants account, this account stores information about entrants of a Raffle.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class EntrantsAccount {
  constructor(
    readonly client: RafflesProgramClient,
    readonly address: PublicKey,
    public state: EntrantsState,
    private data: AccountInfo<Buffer>,
    private _onStateUpdate?: StateUpdateHandler<EntrantsState>
  ) {
    this.subscribe();
  }

  /**
   * Loads all existing Loans, if a Collection Lending Profile is specified, only Loans associated to it will be loaded.
   * @param client The Lending Client instance.
   * @param address The address of the Loan to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve a Loan.
   */
  static async load(
    client: RafflesProgramClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<EntrantsState>
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
      onStateUpdateHandler
    );
  }

  /**
   * Gets the entrant at the given index.
   * @param index The index of the entry.
   * @returns The Public Key of the entrant.
   */
  getEntrant(index: number): PublicKey {
    const startIndex = 8 + 4 + 4 + 32 * index;
    return PublicKey.decode(
      this.data.data.subarray(startIndex, startIndex + 32)
    );
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe() {
    this.client.accounts.entrants
      .subscribe(this.address)
      .on('change', (state: EntrantsState) => {
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
    await this.client.accounts.entrants.unsubscribe(this.address);
  }
}
