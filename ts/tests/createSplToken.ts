/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet, createNftMetadata } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { PublicKey } from '@solana/web3.js';
import { generateSigner } from '@metaplex-foundation/umi';
import { createFungible } from '@metaplex-foundation/mpl-token-metadata';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotent,
  mintTo
} from '@solana/spl-token';

// Load Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});
// Constants
const KP_PATH = process.env.KEYPAIR_PATH;
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const COLLECTION = new PublicKey(process.env.COLLECTION);
const ADDRESS = 'Exwp9YczsDe63QXUzEP3MJ2jDPBFAGRTLnUKMRS62eu9';
export const main = async () => {
  console.log(`Running createSplToken. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );
  const CONFIG = createNftMetadata(rafflesClient);

  // mint spl token here into our token accounts
  // so that we can use them as prizes on raffles
  try {
    console.log(
      `       Minting Fungible Tokens for Collection ${COLLECTION.toString()}`
    );
    const mint = generateSigner(rafflesClient.umi);
    const { result, signature } = await createFungible(rafflesClient.umi, {
      mint,
      name: CONFIG.imgName,
      uri: CONFIG.metadata,
      sellerFeeBasisPoints: CONFIG.sellerFeeBasisPoints,
      symbol: CONFIG.symbol,
      creators: CONFIG.creators
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
        `       ✅ - Minted Fungible Token: ${mint.publicKey.toString()}`
      );
      console.log(
        `       https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=devnet`
      );
      const [txSignature] = base58.deserialize(signature);
      console.log(
        `       https://explorer.solana.com/tx/${txSignature.toString()}?cluster=devnet`
      );
    }
  } catch (err) {
    console.log(err);
  }
};

main();
