/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  createCollectionNftMetadata,
  createCollectionNft,
  loadWallet
} from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

// Load Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});
// Constants
const KP_PATH = process.env.KEYPAIR_PATH;
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;

export const main = async () => {
  console.log(`Running createCollection. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const config = createCollectionNftMetadata(rafflesClient);

  await createCollectionNft(
    rafflesClient,
    config.metadata,
    config.imgName,
    config.sellerFeeBasisPoints,
    config.symbol,
    config.creators
  );
};

main();
