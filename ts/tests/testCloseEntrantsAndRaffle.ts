/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import { RaffleAccount } from '@bankmenfi/raffles-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;
const RAFFLE = new PublicKey(process.env.RAFFLE);

export const main = async () => {
  console.log(`Running testCollectProceeds. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  try {
    const raffle = await RaffleAccount.load(rafflesClient.program, RAFFLE);

    const { ixs } = await raffle.close();

    const tx = new Transaction();

    for (const ix of ixs) {
      tx.add(ix);
    }

    const signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);

    console.log(`       Success!🎉`);
    console.log(`       ✅ - Closed Entrants and Raffle Accounts.`);

    console.log(
      `       ✅ Transaction - https://explorer.solana.com/tx/${signature.toString()}?cluster=${CLUSTER}`
    );
  } catch (err) {
    console.log(err);
  }
};

main();
