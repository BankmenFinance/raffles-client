import { RafflesApiClient } from './api';
import { RafflesProgramClient } from './program';
import { AnchorProvider } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Wallet, Cluster } from '../types/index';

export * from './program';
export * from './api';

export class RafflesClient {
  private apiClient: RafflesApiClient;
  private programClient: RafflesProgramClient;

  constructor(
    cluster: Cluster,
    rpcEndpoint?: string,
    apiEndpoint?: string,
    wallet?: Wallet,
    programId?: PublicKey,
    confirmOpts = AnchorProvider.defaultOptions()
  ) {
    this.programClient = new RafflesProgramClient(
      cluster,
      rpcEndpoint,
      wallet,
      programId,
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
}
