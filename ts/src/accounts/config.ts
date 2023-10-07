import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import { RafflesProgramClient } from '../client';
import { ConfigState, InitializeArgs } from '../types/on-chain';
import { StateUpdateHandler } from '../types';
import { deriveConfigAddress } from '../utils/pda';

/**
 * Represents the global Config.
 *
 * This class exposes utility methods related to this on-chain account.
 */
export class ConfigAccount {
  constructor(
    readonly client: RafflesProgramClient,
    readonly address: PublicKey,
    public state: ConfigState,
    private _onStateUpdate?: StateUpdateHandler<ConfigState>
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
   * @returns The accounts, instructions and signers, if necessary.
   */
  static async initialize(
    client: RafflesProgramClient,
    args: InitializeArgs
  ): Promise<{
    accounts: PublicKey[];
    ixs: TransactionInstruction[];
    signers: Keypair[];
  }> {
    const [config] = deriveConfigAddress(client.programId);
    const [rafflesProgramData] = PublicKey.findProgramAddressSync(
      [client.programId.toBuffer()],
      new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
    );

    const ix = await client.methods
      .initialize(args)
      .accountsStrict({
        config,
        rafflesProgram: client.programId,
        rafflesProgramData,
        payer: client.walletPubkey,
        upgradeAuthority: client.walletPubkey,
        systemProgram: SystemProgram.programId
      })
      .instruction();

    return {
      accounts: [config],
      ixs: [ix],
      signers: []
    };
  }

  /**
   * Loads the given Config.
   * @param client The Raffles Client instance.
   * @param address The address of the Config to load.
   * @param onStateUpdateHandler A state update handler.
   * @returns A promise which may resolve a Config.
   */
  static async load(
    client: RafflesProgramClient,
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
   * Gets the authority.
   */
  get authority(): PublicKey {
    return this.state.authority;
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
