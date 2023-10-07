/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { createNftMetadata, delay, loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { PublicKey } from '@solana/web3.js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { Creator, createNft } from '@metaplex-foundation/mpl-token-metadata';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  PercentAmount,
  OptionOrNullable,
  generateSigner
} from '@metaplex-foundation/umi';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const KP_PATH = process.env.KEYPAIR_PATH;
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;

const COLLECTION = new PublicKey(process.env.COLLECTION);

async function mintLegacyNft(
  rafflesClient: RafflesClient,
  metadataUri: string,
  name: string,
  sellerFeeBasisPoints: PercentAmount<2>,
  symbol: string,
  creators: OptionOrNullable<Creator[]>
): Promise<void> {
  try {
    console.log(
      `       Minting Legacy NFT for Collection ${COLLECTION.toString()}`
    );
    const mint = generateSigner(rafflesClient.umi);
    const { result, signature } = await createNft(rafflesClient.umi, {
      mint,
      uri: metadataUri,
      name,
      symbol,
      sellerFeeBasisPoints,
      creators,
      isCollection: true,
      updateAuthority: rafflesClient.umiPublicKey
    }).sendAndConfirm(rafflesClient.umi);
    if (result.value.err) {
      console.log(
        `       Error submitting transaction: ${JSON.stringify(
          result.value.err
        )}`
      );
    } else {
      console.log(`       Success!🎉`);
      console.log(
        `       ✅ - Minted Legacy NFT: ${mint.publicKey.toString()}`
      );
      console.log(
        `       ✅ Legacy NFT - https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=${CLUSTER}`
      );
      const [txSignature] = base58.deserialize(signature);
      console.log(
        `       ✅ Transaction - https://explorer.solana.com/tx/${txSignature.toString()}?cluster=${CLUSTER}`
      );
    }
  } catch (err) {
    console.log(err);
  }
}

export const main = async () => {
  console.log(`Running mintLegacyNft. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );
  const CONFIG = createNftMetadata(rafflesClient);

  await mintLegacyNft(
    rafflesClient,
    CONFIG.metadata,
    CONFIG.imgName,
    CONFIG.sellerFeeBasisPoints,
    CONFIG.symbol,
    CONFIG.creators
  );
};

main();
