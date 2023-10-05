/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { ReadApiError } from '@metaplex-foundation/mpl-bubblegum';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { findMetadataPda, fetchMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { isSome, some } from '@metaplex-foundation/umi';

// Load Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;
const KP_PATH = process.env.KEYPAIR_PATH;


export const main = async () => {
  console.log(`Running listNfts. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  try {
    const assets = await rafflesClient.connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_PROGRAM_ID, }
    );

    assets.value.forEach(e => console.log(e.account.data.parsed.info.tokenAmount.decimals)); 
    console.log(assets.value.length);
    const filteredValues = assets.value.filter((value) => {
      return value.account.data.parsed.info.tokenAmount.decimals == 0;
    });


    if (filteredValues.length > 0) {
      console.log("Filtered values:");
      filteredValues.forEach(e => console.table(e.account.data.parsed.info));
    } else {
      console.log(`No NFTs found for owner ${rafflesClient.web3JsPublicKey}.`);
      return;
    }

    const metadataList = filteredValues.map(
      (value) => findMetadataPda(rafflesClient.umi, {
        mint: value.account.data.parsed.info.mint
      })
    ).map(pda => fetchMetadata(rafflesClient.umi, pda));
    
    metadataList.forEach(e => e.then( e=> {
      if (isSome(e.tokenStandard)){
        console.log("Found NFT with name:");
        console.log(e.name);
        if (isSome(e.creators)){
          console.log("The creators are:");
          console.log(e.creators.value.forEach(e => console.log(e.address)));
        }
      }
    } 
    ));

  } catch (err) {
    if (err instanceof ReadApiError) {
      console.log(`ReadApiError: ${err.message}`);
    }
    console.log(`err: ${err.message}`);
  }
};

main();
