/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@raffles/client/raffles';
import { Cluster } from '@raffles/types';
import { Raffle } from '@raffles/accounts';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = process.env.CLUSTER as Cluster;

export const main = async () => {
  console.log('Running testLoadRaffles. ' + CLUSTER);

  const rafflesClient = new RafflesClient(CLUSTER);

  const raffles = await Raffle.loadAll(rafflesClient);

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
