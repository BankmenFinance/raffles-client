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

export const main = async () => {
  console.log(`Running testClaimPrize. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const raffle = await RaffleAccount.load(
    rafflesClient.program,
    new PublicKey('EdqSJS283BGtFeKmufrLBhMMDL32nbFJuwUQLhAsopHE')
  );

  const tx = new Transaction();

  const tickets = await rafflesClient.api.getTicketsForUserAndRaffle(
    rafflesClient.web3JsPublicKey,
    raffle.address
  );

  for (const ticket of tickets.ticket) {
    console.log(ticket);
  }

  // const signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);
  // console.log(`       Success!🎉`);
  // console.log(`       ✅ - Claimed Prize from Raffle ${raffle.address}.`);
  // console.log(
  //   `       https://explorer.solana.com/address/${signature}?cluster=devnet`
  // );
};

main();
