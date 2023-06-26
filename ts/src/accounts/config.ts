/* eslint-disable @typescript-eslint/no-unused-vars */
import { PublicKey } from '@solana/web3.js';
import { RafflesClient } from '../client';
import { ConfigState } from '../types/on-chain';
import { StateUpdateHandler } from '../types';

/**
 * Represents the global Config.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class ConfigAccount {
  constructor(
    readonly client: RafflesClient,
    readonly address: PublicKey,
    public state: ConfigState,
    private _onStateUpdate?: StateUpdateHandler<ConfigState>
  ) {
    this.subscribe();
  }

  /**
   * Loads the given Config.
   * @param client The Raffles Client instance.
   * @param address The address of the Config to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve a Config.
   */
  static async load(
    client: RafflesClient,
    address: PublicKey,
    onStateUpdateHandler?: StateUpdateHandler<ConfigState>
  ): Promise<ConfigAccount> {
    const state = await client.accounts.config.fetchNullable(address);

    if (state === null) return null;

    return new ConfigAccount(
      client,
      address,
      state as ConfigState,
      onStateUpdateHandler
    );
  }

  /**
   * Subscribes to state changes of this account.
   */
  subscribe() {
    this.client.accounts.config
      .subscribe(this.address)
      .on('change', (state: ConfigState) => {
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
    await this.client.accounts.config.unsubscribe(this.address);
  }
}
