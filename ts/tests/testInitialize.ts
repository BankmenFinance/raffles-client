/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '../src/client/raffles';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@raffles/types';
import { loadWallet } from 'utils';
import { ConfigAccount } from '@raffles/accounts';
import { Transaction } from '@solana/web3.js';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = process.env.CLUSTER as Cluster;
const KP_PATH = process.env.KEYPAIR_PATH;

export const main = async () => {
  console.log('Running testInitialize.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(CLUSTER, new NodeWallet(wallet));

  const { ixs } = await ConfigAccount.initialize(rafflesClient, {
    protocolFee: 10
  });

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await rafflesClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
