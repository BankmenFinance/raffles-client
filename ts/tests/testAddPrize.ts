/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '../src/client/raffles';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@raffles/types';
import { loadWallet } from 'utils';
import { Raffle } from '@raffles/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import BN from 'bn.js';
import {
  GetAssetProofRpcResponse,
  Nft,
  NftWithToken,
  Sft,
  SftWithToken
} from '@metaplex-foundation/js';
import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = process.env.CLUSTER as Cluster;
const KP_PATH = process.env.KEYPAIR_PATH;

const PRIZE_MINT = new PublicKey(
  'CxzNWKbA8u3wyV8NqJf2ZpGU1bztgBQmuWup4Z7Ldx79'
);

const createAddProgrammableNftPrizeTx = async (
  raffle: Raffle,
  asset: Sft | SftWithToken | Nft | NftWithToken
) => {
  return await raffle.addPrize(new BN(1), { programmable: {} }, asset);
};

const createAddTokenPrizeTx = async (
  raffle: Raffle,
  asset: Sft | SftWithToken | Nft | NftWithToken
) => {
  return await raffle.addPrize(new BN(1), { token: {} }, asset);
};

const createAddLegacyNftPrizeTx = async (
  raffle: Raffle,
  asset: Sft | SftWithToken | Nft | NftWithToken
) => {
  return await raffle.addPrize(new BN(1), { legacy: {} }, asset);
};

const createAddCompressedNftPrizeTx = async (
  raffle: Raffle,
  asset: Sft | SftWithToken | Nft | NftWithToken,
  merkleTree: ConcurrentMerkleTreeAccount,
  assetProof: GetAssetProofRpcResponse
) => {
  return await raffle.addPrize(
    new BN(1),
    { compressed: { 0: {} } },
    asset,
    merkleTree,
    assetProof
  );
};

export const main = async () => {
  console.log('Running testCreateRaffle.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(CLUSTER, new NodeWallet(wallet));

  const raffle = await Raffle.load(
    rafflesClient,
    new PublicKey('BXM6qXcemJyPRzMGMtgGgbJUEfVP5wANAJqe7VWsbGoU')
  );

  // adds programmable nft to raffle
  const metadata = await rafflesClient.metaplex
    .nfts()
    .findByMint({ mintAddress: PRIZE_MINT });

  const { ixs } = await createAddProgrammableNftPrizeTx(raffle, metadata);

  const tx = new Transaction();

  for (const ix of ixs) {
    tx.add(ix);
  }

  const signature = await rafflesClient.sendAndConfirm(tx, [wallet]);
  console.log('Transaction signature: ' + signature);
};

main();
