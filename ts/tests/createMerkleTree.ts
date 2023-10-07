/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID
} from '@solana/spl-account-compression';
import { createTree } from '@metaplex-foundation/mpl-bubblegum';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { generateSigner } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';

// Load Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const KP_PATH = process.env.KEYPAIR_PATH;
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;

export const main = async () => {
  console.log(`Running createMerkleTree. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  // define the depth and buffer size of our tree to be created
  // max=16,384 nodes (for a `maxDepth` of 14)
  const maxDepth = 14;
  const maxBufferSize = 64;
  // define the canopy depth of our tree to be created
  const canopyDepth = 10;

  const treeKeypair = generateSigner(rafflesClient.umi);
  console.log(`Merkle Tree: ${treeKeypair.publicKey}`);

  const txBuilder = await createTree(rafflesClient.umi, {
    payer: rafflesClient.umiSigner,
    treeCreator: rafflesClient.umiSigner,
    merkleTree: treeKeypair,
    compressionProgram: fromWeb3JsPublicKey(SPL_ACCOUNT_COMPRESSION_PROGRAM_ID),
    logWrapper: fromWeb3JsPublicKey(SPL_NOOP_PROGRAM_ID),
    maxBufferSize,
    maxDepth,
    canopyDepth,
    public: false
  });

  const { result, signature } = await txBuilder.sendAndConfirm(
    rafflesClient.umi
  );
  if (result.value.err) {
    console.log(
      `       Error submitting transaction: ${JSON.stringify(result.value.err)}`
    );
    return null;
  } else {
    console.log(`       Success!🎉`);
    console.log(
      `       ✅ - Created Merkle Tree at ${treeKeypair.publicKey.toString()}.`
    );
    console.log(
      `       https://explorer.solana.com/address/${treeKeypair.publicKey.toString()}?cluster=devnet`
    );
    const [txSignature] = base58.deserialize(signature);
    console.log(
      `       https://explorer.solana.com/tx/${txSignature.toString()}?cluster=devnet`
    );
  }
};

main();
