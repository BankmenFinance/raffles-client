/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import { PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log(`Running listNfts. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(CLUSTER, RPC_ENDPOINT);

  const metadatas = await rafflesClient.metaplex
    .nfts()
    .findAllByOwner({ owner: rafflesClient.program.walletPubkey });

  if (metadatas.length == 0) {
    console.log(
      `No NFTs found for owner ${rafflesClient.program.walletPubkey}`
    );
    return;
  }

  for (const metadata of metadatas) {
    const nft = await rafflesClient.program.metaplex
      .nfts()
      .findByMetadata({ metadata: metadata.address });
    const tokenAccount = await getAssociatedTokenAddress(
      nft.address,
      rafflesClient.program.walletPubkey
    );
    console.log(
      'Metadata: ' +
        metadata.address +
        '\n\tModel: ' +
        nft.model +
        '\n\tToken Mint: ' +
        nft.address +
        '\n\tToken Account: ' +
        tokenAccount +
        '\n\tToken Standard: ' +
        metadata.tokenStandard
    );
  }
};

main();
