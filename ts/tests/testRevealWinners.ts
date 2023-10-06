/* eslint-disable @typescript-eslint/no-var-requires */
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { loadWallet } from 'utils';
import { PrizeAccount, RaffleAccount } from '@bankmenfi/raffles-client/accounts';
import { PublicKey, Transaction } from '@solana/web3.js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { fetchMetadata, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { isSome } from '@metaplex-foundation/umi';

// Load  Env Variables
require('dotenv').config({
    path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;
const RAFFLE = new PublicKey('H8teQj2Ghm8pqVxFrkFDjmLhWrUJSiKdh5HZ19XLiN9x');
const PRIZE_MINT = new PublicKey(
    '7LhmbQYqbXAsmEGe9inDpYGuAuxyDKgG7WykLF37z2wE'
);

export const main = async () => {
    try {
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

        const tx = new Transaction();
        const { ixs } = await raffle.revealWinner();

        for (const ix of ixs) {
            tx.add(ix);
        }

        const signature = await rafflesClient.program.sendAndConfirm(tx, [wallet]);
        console.log(`       Success!🎉`);
        console.log(`       ✅ - Revealed Winner for Raffle ${raffle.address}.`);
        console.log(
            `       https://explorer.solana.com/address/${signature}?cluster=devnet`
        );
    }
    catch (err) {
        console.log(err);
    }
};

main();
