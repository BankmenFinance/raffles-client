/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '../src/client/raffles';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { Cluster } from '@raffles/types';
import { loadWallet } from 'utils';
import { Raffle } from '@raffles/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import BN from 'bn.js';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const CLUSTER = process.env.CLUSTER as Cluster;
const KP_PATH = process.env.KEYPAIR_PATH;

const PRIZE_MINT = new PublicKey(
  'CxzNWKbA8u3wyV8NqJf2ZpGU1bztgBQmuWup4Z7Ldx79'
);

export const main = async () => {
  console.log('Running testCreateRaffle.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(CLUSTER, new NodeWallet(wallet));

  const raffle = await Raffle.load(
    rafflesClient,
    new PublicKey('BXM6qXcemJyPRzMGMtgGgbJUEfVP5wANAJqe7VWsbGoU')
  );

  const { ixs } = await raffle.addPrize(PRIZE_MINT, 0, new BN(1));

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await rafflesClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
