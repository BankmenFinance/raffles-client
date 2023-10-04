/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { ReadApiError } from '@metaplex-foundation/mpl-bubblegum';

// Load Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log(`Running listCompressedNfts. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  try {
    const assets = await rafflesClient.umi.rpc.getAssetsByOwner({
      owner: rafflesClient.umiPublicKey
    });

    if (assets.items.length == 0) {
      console.log(`No NFTs found for owner ${rafflesClient.web3JsPublicKey}`);
      return;
    }
    console.log(`Fetched ${assets.items.length} NFTs.`);

    const filteredAssets = assets.items.filter((m) => m.compression.compressed);

    if (filteredAssets.length == 0) {
      console.log(`No cNFTs found for owner ${rafflesClient.web3JsPublicKey}`);
      return;
    }

    console.table(filteredAssets);
  } catch (err) {
    if (err instanceof ReadApiError) {
      console.log(`ReadApiError: ${err.message}`);
    }
  }
};

main();
