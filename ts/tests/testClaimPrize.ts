/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import {
  PrizeAccount,
  RaffleAccount
} from '@bankmenfi/raffles-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
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
const RAFFLE = new PublicKey('EdqSJS283BGtFeKmufrLBhMMDL32nbFJuwUQLhAsopHE');

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
    const winnerTicketIndex =
      expand(Buffer.from(raffle.state.randomness), prizeIndex) % entrants.total;
    const winner = entrants.getEntrant(winnerTicketIndex);

    if (winner.equals(rafflesClient.web3JsPublicKey)) {
      console.log(
        `🎉🎉🎉 Congratulations! Your ticket #${winnerTicketIndex} 
        won prize #${prizeIndex}. Attempting to claim prize..`
      );
      const [prizeAddress] = derivePrizeAddress(
        RAFFLE,
        prizeIndex,
        rafflesClient.program.programId
      );
      console.log(prizeAddress);

      const prize = await PrizeAccount.load(
        rafflesClient.program,
        prizeAddress
      );

      const tx = new Transaction();
      console.log(prize.state.metadata.toString());

      if (
        prize.state.metadata.toString() !== '11111111111111111111111111111111'
      ) {
        const metadata = findMetadataPda(rafflesClient.umi, {
          mint: fromWeb3JsPublicKey(prizeAddress)
        });

        const metadataAccount = await fetchMetadata(
          rafflesClient.umi,
          metadata
        );
        const tx = new Transaction();

        // adds programmable nft to raffle
        const asset = await rafflesClient.umi.rpc.getAsset(
          fromWeb3JsPublicKey(prizeAddress)
        );

        const { ixs } = await prize.claimPrize(
          raffle,
          prizeIndex,
          asset,
          metadataAccount,
          null,
          null
        );

        for (const ix of ixs) {
          tx.add(ix);
        }
      } else {
        const { ixs } = await prize.claimPrize(
          raffle,
          prizeIndex,
          null,
          null,
          null,
          null
        );

        for (const ix of ixs) {
          tx.add(ix);
        }
      }

      const signature = await rafflesClient.program.sendAndConfirm(tx, [
        wallet
      ]);
      console.log(`       Success!🎉`);
      console.log(
        `       ✅ - Claimed Prize #${prizeIndex} from Raffle ${raffle.address}.`
      );
      console.log(
        `       https://explorer.solana.com/address/${signature}?cluster=devnet`
      );
    } else {
      console.log(
        `😭😭😭 Looks like you're shit outta luck today! Prize #${prizeIndex} was 
        won by ticket #${winnerTicketIndex}, purchased by ${winner}`
      );
    }
  }
};

main();
