import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export type Cluster = 'localnet' | 'devnet' | 'mainnet-beta';

export interface Config {
  RPC_ENDPOINT: string;
  PROGRAM_ID: PublicKey;
  HISTORY_API_GRAPHQL: string;
}

export type StateUpdateHandler<T> = (state: T) => void;
export type ParsedOrderbook = [number, number][];
export type OrderbookListenerCB = (bidsOrAsks: ParsedOrderbook) => void;
export type Fills = { price: number; amount: number }[];

export interface Wallet {
  signTransaction<T extends Transaction | VersionedTransaction>(
    tx: T
  ): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(
    txs: T[]
  ): Promise<T[]>;
  publicKey: PublicKey;
}

export * from './on-chain';
