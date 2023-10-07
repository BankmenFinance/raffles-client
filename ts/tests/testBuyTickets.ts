/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import { RaffleAccount } from '@bankmenfi/raffles-client/accounts';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/utils/token';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import {
  createCloseAccountInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;
const RAFFLE = new PublicKey(process.env.RAFFLE);

const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112');

const TICKETS = 10;

export const main = async () => {
  try {
    console.log(`Running testBuyTickets. Cluster: ${CLUSTER}`);
    console.log('Using RPC URL: ' + RPC_ENDPOINT);

    const wallet = loadWallet(KP_PATH);
    console.log('Wallet Public Key: ' + wallet.publicKey.toString());

    const rafflesClient = new RafflesClient(
      CLUSTER,
      RPC_ENDPOINT,
      new NodeWallet(wallet)
    );

    const raffle = await RaffleAccount.load(rafflesClient.program, RAFFLE);

    const tx = new Transaction();
    const ata = await getAssociatedTokenAddress(
      raffle.proceedsMint, // mint
      wallet.publicKey, // owner
      false // allow owner off curve
    );

    if (raffle.state.proceedsMint.equals(WSOL_MINT)) {
      const rentExemption =
        await rafflesClient.connection.getMinimumBalanceForRentExemption(165);
      const lamports =
        rentExemption + TICKETS * raffle.state.ticketPrice.toNumber();
      tx.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: ata,
          lamports: lamports
        })
      );
      tx.add(
        await createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey,
          ata,
          wallet.publicKey,
          raffle.proceedsMint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
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
          createCloseAccountInstruction(ata, wallet.publicKey, wallet.publicKey)
        )
      );
    }

    const signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);

    console.log(`       Success!🎉`);
    console.log(`       ✅ - Bought ${TICKETS} tickets.`);

    console.log(
      `       ✅ Transaction - https://explorer.solana.com/tx/${signature.toString()}?cluster=${CLUSTER}`
    );
  } catch (err) {
    console.log(err);
  }
};

main();
