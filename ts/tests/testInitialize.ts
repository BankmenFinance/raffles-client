/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import { ConfigAccount } from '@bankmenfi/raffles-client/accounts';
import { Transaction } from '@solana/web3.js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log(`Running testInitialize. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const { accounts, ixs } = await ConfigAccount.initialize(
    rafflesClient.program,
    {
      protocolFee: 10
    }
  );

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);
  console.log(`       Success!🎉`);
  console.log(`       ✅ - Initialized global Config at ${accounts[0]}.`);
  console.log(
    `       ✅ Transaction - https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`
  );
};

main();
