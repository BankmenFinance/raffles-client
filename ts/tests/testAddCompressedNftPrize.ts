/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import { RaffleAccount } from '@bankmenfi/raffles-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import BN from 'bn.js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import {
  fetchMetadata,
  findMetadataPda
} from '@metaplex-foundation/mpl-token-metadata';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;

const PRIZE_MINT = new PublicKey(
  'AJ56XTB5TRy8JmzCHszaAZUmWXoyMmwCYVMJV9SEYx8i'
);

const RAFFLE = new PublicKey('HkRTrh2KbiRMbgC5aGajUkymWsqKLAkiaaUncwv7hrRh');

export const main = async () => {
  console.log(`Running testAddCompressedNftPrize. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const raffle = await RaffleAccount.load(rafflesClient.program, RAFFLE);

  // adds programmable nft to raffle
  const asset = await rafflesClient.umi.rpc.getAsset(
    fromWeb3JsPublicKey(PRIZE_MINT)
  );

  const assetProof = await rafflesClient.umi.rpc.getAssetProof(
    fromWeb3JsPublicKey(PRIZE_MINT)
  );

  const { ixs } = await await raffle.addPrize(
    new BN(1),
    { legacy: {} },
    null,
    asset,
    null,
    assetProof
  );

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);

  console.log(`       Success!🎉`);
  console.log(`       ✅ - Added Prize to Raffle ${raffle.address}.`);
  console.log(
    `       ✅ Transaction - https://explorer.solana.com/address/${signature}?cluster=${CLUSTER}`
  );
};

main();
