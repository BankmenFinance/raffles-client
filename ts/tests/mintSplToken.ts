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
  createAssociatedTokenAccountIdempotent,
  TOKEN_PROGRAM_ID,
  mintTo
} from '@solana/spl-token';
import {
  PercentAmount,
  amountToNumber,
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

const SPL_TOKEN_MINT = new PublicKey(process.env.SPL_TOKEN_MINT);

export const main = async () => {
  console.log(`Running mintSplToken. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  try {
    const tokenAccount = await createAssociatedTokenAccountIdempotent(
      rafflesClient.connection,
      wallet,
      SPL_TOKEN_MINT,
      wallet.publicKey,
      {},
      TOKEN_PROGRAM_ID
    );

    const mintSig = await mintTo(
      rafflesClient.connection,
      wallet,
      SPL_TOKEN_MINT,
      tokenAccount,
      wallet.publicKey,
      1_000_000 * 10 ** 9,
      [],
      undefined,
      TOKEN_PROGRAM_ID
    );
    console.log(`       Success!🎉`);
    console.log(`       ✅ - Minted Tokens: ${SPL_TOKEN_MINT.toString()}`);
    console.log(
      `       ✅ SPL Token -https://explorer.solana.com/address/${SPL_TOKEN_MINT.toString()}?cluster=${CLUSTER}`
    );
    console.log(
      `       ✅ Transaction - https://explorer.solana.com/tx/${mintSig}?cluster=${CLUSTER}`
    );
  } catch (err) {
    console.log(err);
  }
};

main();
