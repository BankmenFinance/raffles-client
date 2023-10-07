/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import { RaffleAccount } from '@bankmenfi/raffles-client/accounts';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { getEntrantsSize } from '../src/utils/shared';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const HISTORY_API_GRAPHQL =
  process.env.HISTORY_API_GRAPHQL || CONFIGS[CLUSTER].HISTORY_API_GRAPHQL;
const KP_PATH = process.env.KEYPAIR_PATH;

const MAX_ENTRANTS = 100;
const RAFFLE_DURATION = 10 * 60; // 10 minutes
const TICKET_PRICE = new BN(100_000);
const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const main = async () => {
  console.log(`Running testCreateRaffle. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet),
    HISTORY_API_GRAPHQL
  );

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const endTimestamp = currentTimestamp + RAFFLE_DURATION;

  console.log(`Creating Raffle ending at ${endTimestamp}`);

  const { accounts, ixs, signers } = await RaffleAccount.create(
    rafflesClient.program,
    WSOL_MINT,
    new BN(endTimestamp),
    TICKET_PRICE,
    MAX_ENTRANTS
  );

  console.log(
    `Raffle: ${accounts[0]}\nEntrants: ${accounts[1]}\nProceeds: ${accounts[2]}`
  );

  const entrantsSize = getEntrantsSize(MAX_ENTRANTS);
  const rentExemption =
    await rafflesClient.connection.getMinimumBalanceForRentExemption(
      entrantsSize
    );

  console.log(
    `Max Entrants: ${MAX_ENTRANTS}\nEntrants Account Size: ${entrantsSize}`
  );

  const preIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: signers[0].publicKey,
    lamports: rentExemption,
    space: entrantsSize,
    programId: rafflesClient.program.programId
  });

  const tx = new Transaction();
  tx.add(preIx);
  for (const ix of ixs) {
    tx.add(ix);
  }

  const allSigners = [wallet];
  signers.forEach((s) => allSigners.push(s));

  const signature = await rafflesClient.program.sendAndConfirm(tx, allSigners);

  console.log(`       Success!🎉`);
  console.log(`       ✅ - Created Raffle.`);
  console.log(
    `       https://explorer.solana.com/address/${signature}?cluster=${CLUSTER}`
  );
};

main();
