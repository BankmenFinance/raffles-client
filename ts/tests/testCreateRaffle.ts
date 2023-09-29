/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '../src/client/raffles';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@raffles/types';
import { loadWallet } from 'utils';
import { Raffle } from '@raffles/accounts';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import BN from 'bn.js';
import { getEntrantsSize } from '../src/utils/shared';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = process.env.CLUSTER as Cluster;
const KP_PATH = process.env.KEYPAIR_PATH;

const MAX_ENTRANTS = 5_000;
const RAFFLE_DURATION = 1 * 3600;
const TICKET_PRICE = new BN(100_000);
const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

export const main = async () => {
  console.log('Running testCreateRaffle.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(CLUSTER, new NodeWallet(wallet));

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const endTimestamp = currentTimestamp + RAFFLE_DURATION;

  const { ixs, signers } = await Raffle.create(
    rafflesClient,
    WSOL_MINT,
    new BN(endTimestamp),
    TICKET_PRICE,
    MAX_ENTRANTS
  );

  const entrantsSize = getEntrantsSize(MAX_ENTRANTS);
  const rentExemption =
    await rafflesClient.connection.getMinimumBalanceForRentExemption(
      entrantsSize
    );

  const preIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: signers[0].publicKey,
    lamports: rentExemption,
    space: entrantsSize,
    programId: rafflesClient.programId
  });

  const tx = new Transaction();
  tx.add(preIx);
  for (const ix of ixs) {
    tx.add(ix);
  }

  const allSigners = [wallet];
  signers.forEach((s) => allSigners.push(s));

  const signature = await rafflesClient.sendAndConfirm(tx, allSigners);
  console.log('Transaction signature: ' + signature);
};

main();
