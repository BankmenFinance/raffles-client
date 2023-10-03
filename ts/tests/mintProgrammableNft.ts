/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { delay, loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  Metaplex,
  bundlrStorage,
  keypairIdentity
} from '@metaplex-foundation/js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants
const KP_PATH = process.env.KEYPAIR_PATH;
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;

const COLLECTION = new PublicKey(
  '7CdaMhWfcR57uFzGUMKyuiqeAqdzdEdF4Y4ghti12p7J'
);

async function mintProgrammableNft(
  metaplex: Metaplex,
  metadataUri: string,
  name: string,
  sellerFee: number,
  symbol: string,
  creators: { address: PublicKey; share: number }[],
  collection: PublicKey
) {
  try {
    console.log(`       Minting pNFT for Collection ${collection.toString()}`);
    const nftTxBuilder = await metaplex.nfts().builders().create({
      uri: metadataUri,
      name: name,
      sellerFeeBasisPoints: sellerFee,
      symbol: symbol,
      creators: creators,
      isMutable: true,
      isCollection: false,
      collection,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
      ruleSet: null
    });

    const { signature, confirmResponse } = await metaplex
      .rpc()
      .sendAndConfirmTransaction(nftTxBuilder);
    if (confirmResponse.value.err) {
      throw new Error('failed to confirm transaction');
    }
    const { mintAddress } = nftTxBuilder.getContext();
    console.log(`       Success!🎉`);
    console.log(
      `       Minted NFT: https://explorer.solana.com/address/${mintAddress.toString()}?cluster=devnet`
    );
    console.log(
      `       Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );

    await delay(15000);

    console.log(`       Verifying NFT for Collection `);
    const { response } = await metaplex.nfts().verifyCollection({
      mintAddress: mintAddress,
      collectionMintAddress: collection,
      collectionAuthority: metaplex.identity()
    });
    console.log(`       Success!🎉`);
    console.log(`       ✅ - Verified Collection NFT.`);
    console.log(
      `       https://explorer.solana.com/address/${response.signature}?cluster=devnet`
    );
  } catch (err) {
    console.log(err);
  }
}

export const main = async () => {
  console.log(`Running mintProgrammableNft. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const metaplex = rafflesClient.metaplex.use(keypairIdentity(wallet)).use(
    bundlrStorage({
      address: 'https://devnet.bundlr.network',
      providerUrl: RPC_ENDPOINT,
      timeout: 60000
    })
  );
  const CONFIG = {
    imgName: 'Bankmen Finance Test',
    symbol: 'BFT',
    sellerFeeBasisPoints: 100, // 100 bp = 5%
    creators: [{ address: wallet.publicKey, share: 100 }],
    metadata: 'https://arweave.net/yIgHNXiELgQqW8QIbFM9ibVV37jhvfyW3mFcZGRX-PA'
  };

  await mintProgrammableNft(
    metaplex,
    CONFIG.metadata,
    CONFIG.imgName,
    CONFIG.sellerFeeBasisPoints,
    CONFIG.symbol,
    CONFIG.creators,
    COLLECTION
  );
};

main();
