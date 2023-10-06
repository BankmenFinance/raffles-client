import { RafflesApiClient } from './api';
import { RafflesProgramClient } from './program';
import { AnchorProvider, Provider } from '@coral-xyz/anchor';
import { Connection, PublicKey as Web3JsPublicKey } from '@solana/web3.js';
import { Wallet, Cluster } from '../types/index';
import {
  Signer as UmiSigner,
  PublicKey as UmiPublicKey,
  Umi
} from '@metaplex-foundation/umi';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';

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
    this.apiClient = new RafflesApiClient(cluster, apiEndpoint);
  }

  get api(): RafflesApiClient {
    return this.apiClient;
  }

  get program(): RafflesProgramClient {
    return this.programClient;
  }

  get umi(): Umi {
    return this.program.umi;
  }

  get connection(): Connection {
    return this.program.connection;
  }

  get provider(): Provider {
    return this.program.anchorProvider;
  }

  get web3JsPublicKey(): Web3JsPublicKey {
    return this.program.walletPubkey;
  }

  get umiPublicKey(): UmiPublicKey {
    return fromWeb3JsPublicKey(this.program.walletPubkey);
  }

  get umiSigner(): UmiSigner {
    return this.umi.identity;
  }
}
