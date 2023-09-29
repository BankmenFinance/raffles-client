import { PublicKey } from '@solana/web3.js';
import type { Cluster, Config } from '../types';

export const B_CONFIG = 'config';
export const B_RAFFLE = 'raffle';
export const B_PROCEEDS = 'proceeds';
export const B_PRIZE = 'prize';

export const CONFIGS: { [key in Cluster]: Config } = {
  localnet: {
    RPC_ENDPOINT: 'http://127.0.0.1:8899',
    PROGRAM_ID: new PublicKey('C51NyFn3yu3zfTwswacr1XZsxHoeFW3vDM7Jg9T9em2N'),
    HISTORY_API_GRAPHQL: 'http://localhost:8081/v1/graphql'
  },
  devnet: {
    RPC_ENDPOINT:
      'https://cypher-develope-1013.devnet.rpcpool.com/1a4c1f68-bf8e-4b64-9d41-8e5b4032ef21',
    PROGRAM_ID: new PublicKey('C51NyFn3yu3zfTwswacr1XZsxHoeFW3vDM7Jg9T9em2N'),
    HISTORY_API_GRAPHQL: 'https://gbg-lending-prod.hasura.app/v1/graphql'
  },
  'mainnet-beta': {
    RPC_ENDPOINT:
      'https://bankmen-main71f-f62a.mainnet.rpcpool.com/f6f0b0ad-6b0f-4a33-95eb-8944a9474e6f',
    PROGRAM_ID: new PublicKey('BMfi6hbCSpTS962EZjwaa6bRvy2izUCmZrpBMuhJ1BUW'),
    HISTORY_API_GRAPHQL: 'https://gbg-lending.hasura.app/v1/graphql'
  }
};
