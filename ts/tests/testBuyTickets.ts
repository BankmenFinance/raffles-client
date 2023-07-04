/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '../src/client/raffles';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { Cluster } from '@raffles/types';
import { loadWallet } from 'utils';
import { Raffle } from '@raffles/accounts';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@project-serum/anchor/dist/cjs/utils/token';
import {
  createInitializeAccountInstruction,
  createCloseAccountInstruction
} from '@solana/spl-token';

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

const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

const TICKETS = 2;

export const main = async () => {
  console.log('Running testbuyTickets.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(CLUSTER, new NodeWallet(wallet));

  const raffle = await Raffle.load(
    rafflesClient,
    new PublicKey('BXM6qXcemJyPRzMGMtgGgbJUEfVP5wANAJqe7VWsbGoU')
  );

  const tx = new Transaction();
  const extraSigners = [];
  const wrappedSolTokenAccount = new Keypair();

  if (raffle.state.proceedsMint.equals(WSOL_MINT)) {
    extraSigners.push(wrappedSolTokenAccount);
    const rentExemption =
      await rafflesClient.connection.getMinimumBalanceForRentExemption(165);
    const lamports =
      rentExemption + TICKETS * raffle.state.ticketPrice.toNumber();
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: wrappedSolTokenAccount.publicKey,
        lamports,
        space: 165,
        programId: TOKEN_PROGRAM_ID
      })
    );
    tx.add(
      createInitializeAccountInstruction(
        wrappedSolTokenAccount.publicKey,
        raffle.state.proceedsMint,
        wallet.publicKey
      )
    );
  }

  const { ixs } = await raffle.buyTickets(
    TICKETS,
    raffle.state.proceedsMint.equals(WSOL_MINT)
      ? wrappedSolTokenAccount.publicKey
      : null
  );

  for (const ix of ixs) {
    tx.add(ix);
  }

  if (raffle.state.proceedsMint.equals(WSOL_MINT)) {
    tx.add(
      tx.add(
        createCloseAccountInstruction(
          wrappedSolTokenAccount.publicKey,
          wallet.publicKey,
          wallet.publicKey
        )
      )
    );
  }

  const allSigners = [wallet];
  for (const signer of extraSigners) {
    allSigners.push(signer);
  }

  const signature = await rafflesClient.sendAndConfirm(tx, allSigners);
  console.log('Transaction signature: ' + signature);
};

main();
