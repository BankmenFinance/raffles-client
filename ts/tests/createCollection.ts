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

async function createCollectionNft(metaplex: Metaplex) {
  try {
    console.log(`       Creating Collection Mint`);
    const { nft: collectionNft } = await metaplex.nfts().create({
      name: 'Bankmen Finance Test Collection',
      symbol: 'BFTC',
      uri: 'https://blockmountain.io',
      sellerFeeBasisPoints: 100, // 100 bp = 1%
      creators: [{ address: metaplex.identity().publicKey, share: 100 }],
      isCollection: true,
      updateAuthority: metaplex.identity()
    });
    console.log(`       Success!🎉`);
    console.log(
      `       ✅ - Minted Collection NFT: ${collectionNft.address.toString()}`
    );
    console.log(
      `       https://explorer.solana.com/address/${collectionNft.address.toString()}?cluster=devnet`
    );
    return collectionNft;
  } catch (err) {
    console.log(err);
  }
}

export const main = async () => {
  console.log('Running testCreateLendingProfile.');

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());
  const connection = new Connection(RPC_ENDPOINT);

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(
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

  await createCollectionNft(metaplex);
};

main();
