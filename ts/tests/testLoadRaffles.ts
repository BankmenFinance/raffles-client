/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { RaffleAccount } from '@bankmenfi/raffles-client/accounts';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;

export const main = async () => {
  console.log(`Running testLoadRaffles. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const rafflesClient = new RafflesClient(CLUSTER, RPC_ENDPOINT);

  const raffles = await RaffleAccount.loadAll(rafflesClient.program);

  const currentTimestamp = Math.floor(Date.now() / 1000);

  console.log('Found ' + raffles.length + ' raffles.');

  for (const raffle of raffles) {
    console.log(
      'Raffle: ' +
        raffle.address +
        '\n\tCreator: ' +
        raffle.state.creator +
        '\n\tProceeds Mint: ' +
        raffle.state.proceedsMint +
        '\n\tBump: ' +
        raffle.state.bump +
        '\n\tPrizes: ' +
        raffle.state.totalPrizes +
        '\n\tEnd Timestamp: ' +
        raffle.state.endTimestamp +
        '\n\tCurrent Timestamp: ' +
        currentTimestamp +
        '\n\tTime Until: ' +
        (raffle.state.endTimestamp.toNumber() - currentTimestamp)
    );
  }
};

main();
