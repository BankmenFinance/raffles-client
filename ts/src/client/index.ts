import { RafflesApiClient } from './api';
import { RafflesProgramClient } from './program';
import { AnchorProvider, Provider } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Wallet, Cluster } from '../types/index';
import { Metaplex } from '@metaplex-foundation/js';

export * from './program';
export * from './api';

export class RafflesClient {
  private apiClient: RafflesApiClient;
  private programClient: RafflesProgramClient;

  constructor(
    cluster: Cluster,
    rpcEndpoint?: string,
    wallet?: Wallet,
    apiEndpoint?: string,
    confirmOpts = AnchorProvider.defaultOptions()
  ) {
    this.programClient = new RafflesProgramClient(
      cluster,
      rpcEndpoint,
      wallet,
      confirmOpts
    );
    if (apiEndpoint) {
      this.apiClient = new RafflesApiClient(apiEndpoint);
    }
  }

  get api(): RafflesApiClient {
    return this.apiClient;
  }

  get program(): RafflesProgramClient {
    return this.programClient;
  }

  get metaplex(): Metaplex {
    return this.program.metaplex;
  }

  get connection(): Connection {
    return this.program.connection;
  }

  get provider(): Provider {
    return this.program.anchorProvider;
  }

  get walletPubkey(): PublicKey {
    return this.program.walletPubkey;
  }
}
