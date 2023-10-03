/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import { RaffleAccount } from '@bankmenfi/raffles-client/accounts';
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import {
  createInitializeAccountInstruction,
  createCloseAccountInstruction
} from '@solana/spl-token';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

const TICKETS = 10;

export const main = async () => {
  console.log(`Running testBuyTickets. Cluster: ${CLUSTER}`);
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

  const { ixs } = await raffle.buyTickets(TICKETS);

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

  const signature = await rafflesClient.program.sendAndConfirm(tx, allSigners);
  console.log('Transaction signature: ' + signature);
};

main();
