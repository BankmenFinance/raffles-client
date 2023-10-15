/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import {
  PrizeAccount,
  RaffleAccount
} from '@bankmenfi/raffles-client/accounts';
import {
  PublicKey,
  SendTransactionError,
  SolanaJSONRPCError,
  Transaction
} from '@solana/web3.js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import {
  fetchMetadata,
  findMetadataPda
} from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { derivePrizeAddress } from '@bankmenfi/raffles-client/utils/pda';
import { EntrantsAccount } from '../src/accounts/entrants';
import { expand } from '@bankmenfi/raffles-client/utils/randomness';

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
  console.log(`Running testClaimPrize. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());
  console.log('Raffle: ' + RAFFLE);

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const raffle = await RaffleAccount.load(rafflesClient.program, RAFFLE);

  const entrants = await EntrantsAccount.load(
    rafflesClient.program,
    raffle.entrants
  );

  for (let prizeIndex = 0; prizeIndex < raffle.prizes; prizeIndex++) {
    // derive the prize address for the raffle and prize index
    const [prizeAddress] = derivePrizeAddress(
      RAFFLE,
      prizeIndex,
      rafflesClient.program.programId
    );
    console.log(`Prize: ${prizeAddress}`);

    // load the prize account
    const prize = await PrizeAccount.load(rafflesClient.program, prizeAddress);

    const tx = new Transaction();
    let signature = null;

    let asset = null;
    let metadataAccount = null;
    let merkleTree = null;
    let assetProof = null;

    // check if the prize has an SPL token mint
    // if so all we need to pass from the outside is the metadata account
    if (!prize.state.mint.equals(PublicKey.default)) {
      const metadata = findMetadataPda(rafflesClient.umi, {
        mint: fromWeb3JsPublicKey(prize.state.mint)
      });

      metadataAccount = await fetchMetadata(rafflesClient.umi, metadata);
    } else {
      // if not then we need to fetch the compressed NFT and merkle tree data etc
      // TODO: do it
      asset = null;
      merkleTree = null;
      assetProof = null;
    }

    // check if there are any entrants to the raffle
    // if so then we can
    if (entrants.total != 0) {
      // because there are entrants to the raffle
      // we need to expand the on-chain randomness for this specific prize index
      // so we have the index of the winner's ticket and we can get the winner's pubkey!
      const winnerTicketIndex =
        expand(Buffer.from(raffle.state.randomness), prizeIndex) %
        entrants.total;
      const winner = entrants.getEntrant(winnerTicketIndex);

      // the client exposes two methods to claim the prizes
      // one of them can be used by the client user
      // the other is used to claim on behalf of prize winners.
      if (winner.equals(rafflesClient.web3JsPublicKey)) {
        console.log(
          `🎉🎉🎉 Congratulations!` +
            `\nYour ticket #${winnerTicketIndex} won prize #${prizeIndex}.` +
            `\nAttempting to claim prize..`
        );
        const { ixs } = await prize.claimPrize(
          raffle,
          winnerTicketIndex,
          asset,
          metadataAccount,
          merkleTree,
          assetProof
        );

        for (const ix of ixs) {
          tx.add(ix);
        }
      } else {
        console.log(
          `😭😭😭 Looks like you're shit outta luck today!` +
            `\nPrize #${prizeIndex} was won by ticket #${winnerTicketIndex}, purchased by ${winner}.` +
            `\nAttempting to claim on behalf of the winner..`
        );
        const { ixs } = await prize.claimForWinner(
          raffle,
          winner,
          winnerTicketIndex,
          asset,
          metadataAccount,
          merkleTree,
          assetProof
        );

        for (const ix of ixs) {
          tx.add(ix);
        }
      }

      try {
        signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);
        if (signature) {
          console.log(`       Success!🎉`);
          console.log(
            `       ✅ - Claimed Prize #${prizeIndex} from Raffle ${raffle.address}.`
          );
          console.log(
            `       ✅ Transaction - https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`
          );
        }
      } catch (e: unknown) {
        if (e instanceof SolanaJSONRPCError) {
          console.log(`JSON RPC Error: ${JSON.stringify(e)}`);
        }
        if (e instanceof SendTransactionError) {
          console.log(`Send Transaction Error: ${JSON.stringify(e)}`);
        }
      }
    } else {
      console.log(
        `😭😭😭 Raffle with no entrants...` +
          `\nAttempting to claim on behalf of the creator..`
      );

      const { ixs } = await prize.claimForWinner(
        raffle,
        raffle.creator,
        0,
        asset,
        metadataAccount,
        merkleTree,
        assetProof
      );

      for (const acc in ixs[0].keys) {
        console.log(acc + ' ' + ixs[0].keys[acc].pubkey);
      }

      for (const ix of ixs) {
        tx.add(ix);
      }

      try {
        signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);
        if (signature) {
          console.log(`       Success!🎉`);
          console.log(
            `       ✅ - Claimed Prize #${prizeIndex} from Raffle ${raffle.address}.`
          );
          console.log(
            `       ✅ Transaction - https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`
          );
        }
      } catch (e: unknown) {
        if (e instanceof SolanaJSONRPCError) {
          console.log(`JSON RPC Error: ${JSON.stringify(e)}`);
        }
        if (e instanceof SendTransactionError) {
          console.log(`Send Transaction Error: ${JSON.stringify(e)}`);
        }
      }
    }
  }
};

main();
