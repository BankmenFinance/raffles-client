import {
  Transaction,
  TransactionInstruction,
  Signer,
  ConfirmOptions,
  Connection,
  PublicKey
} from '@solana/web3.js';
import {
  AccountNamespace,
  AnchorProvider,
  MethodsNamespace,
  Program,
  Provider
} from '@coral-xyz/anchor';
import { CONFIGS } from '../constants';
import rafflesIdl from '../generated/idl/raffles.json';
import type { Raffles } from '../generated/types/raffles';
import type { Cluster, Wallet } from '../types';
import { Metaplex } from '@metaplex-foundation/js';

/**
 * This Raffles Client exposes utility methods to facilitate transaction submission.
 */
export class RafflesProgramClient {
  private _program: Program<Raffles>;
  public readonly metaplex: Metaplex;

  constructor(
    readonly cluster: Cluster,
    rpcEndpoint?: string,
    wallet?: Wallet,
    programId?: PublicKey,
    confirmOpts = AnchorProvider.defaultOptions()
  ) {
    if (wallet) {
      this.connectWallet(wallet, confirmOpts);
    } else {
      const provider = {
        connection: new Connection(
          rpcEndpoint ? rpcEndpoint : CONFIGS[cluster].RPC_ENDPOINT,
          confirmOpts.commitment
        )
      };
      this._program = new Program<Raffles>(
        rafflesIdl as Raffles,
        programId ? programId : CONFIGS[this.cluster].PROGRAM_ID,
        provider
      );
    }

    this.metaplex = Metaplex.make(this.connection);
  }

  connectWallet(wallet: Wallet, confirmOpts = AnchorProvider.defaultOptions()) {
    const provider = new AnchorProvider(this.connection, wallet, confirmOpts);
    this._program = new Program<Raffles>(
      rafflesIdl as Raffles,
      CONFIGS[this.cluster].PROGRAM_ID,
      provider
    );
  }

  private get _provider(): Provider {
    return this._program.provider;
  }

  get anchorProvider(): AnchorProvider {
    const provider = this._program.provider as AnchorProvider;
    if (provider.wallet) {
      return provider;
    }
  }

  get connection(): Connection {
    return this._provider.connection;
  }

  get methods(): MethodsNamespace<Raffles> {
    return this._program.methods;
  }

  get accounts(): AccountNamespace<Raffles> {
    return this._program.account;
  }

  get isWalletConnected(): boolean {
    return !!this.anchorProvider;
  }

  get walletPubkey(): PublicKey {
    return this.anchorProvider?.wallet.publicKey;
  }

  get programId(): PublicKey {
    return CONFIGS[this.cluster].PROGRAM_ID;
  }

  addEventListener(
    eventName: string,
    // eslint-disable-next-line
    callback: (event: any, slot: number) => void
  ): number {
    return this._program.addEventListener(eventName, callback);
  }

  async removeEventListener(listener: number): Promise<void> {
    return await this._program.removeEventListener(listener);
  }

  async sendAndConfirm(
    tx: Transaction,
    signers?: Signer[],
    opts?: ConfirmOptions
  ): Promise<string> {
    return this.anchorProvider?.sendAndConfirm(tx, signers, opts);
  }

  async sendAndConfirmIxs(
    ixs: TransactionInstruction[],
    signers?: Signer[],
    opts?: ConfirmOptions
  ): Promise<string> {
    const tx = new Transaction();
    tx.add(...ixs);
    return this.sendAndConfirm(tx, signers, opts);
  }
}
