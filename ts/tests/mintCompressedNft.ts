/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
import { createNftMetadata, delay, loadWallet } from 'utils';
import { Cluster } from '@bankmenfi/raffles-client/types';
import { PublicKey, Transaction } from '@solana/web3.js';
import { CONFIGS } from '@bankmenfi/raffles-client/constants';
import {
  MPL_BUBBLEGUM_PROGRAM_ID,
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
  mintToCollectionV1
} from '@metaplex-foundation/mpl-bubblegum';
import { RafflesClient } from '@bankmenfi/raffles-client/client/';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import {
  Creator,
  findMasterEditionPda,
  findMetadataPda
} from '@metaplex-foundation/mpl-token-metadata';
import {
  string,
  publicKey,
  base58
} from '@metaplex-foundation/umi/serializers';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import {
  OptionOrNullable,
  PercentAmount,
  amountToNumber,
  some
} from '@metaplex-foundation/umi';

// Load Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

// Constants
const KP_PATH = process.env.KEYPAIR_PATH;
const CLUSTER = (process.env.CLUSTER as Cluster) || 'devnet';
const RPC_ENDPOINT = process.env.RPC_ENDPOINT || CONFIGS[CLUSTER].RPC_ENDPOINT;

const COLLECTION = new PublicKey(process.env.COLLECTION);
const MERKLE_TREE = new PublicKey(process.env.MERKLE_TREE);

async function mintCompressedNft(
  rafflesClient: RafflesClient,
  metadataUri: string,
  name: string,
  sellerFeeBasisPoints: number,
  symbol: string,
  creators: Creator[]
) {
  try {
    console.log(`       Minting cNFT for Collection ${MERKLE_TREE.toString()}`);
    const [treeAuthority] = rafflesClient.umi.eddsa.findPda(
      MPL_BUBBLEGUM_PROGRAM_ID,
      [publicKey().serialize(MERKLE_TREE)]
    );
    const [bubblegumSigner] = rafflesClient.umi.eddsa.findPda(
      MPL_BUBBLEGUM_PROGRAM_ID,
      [string({ size: 'variable' }).serialize('collection_cpi')]
    );

    const metadata = findMetadataPda(rafflesClient.umi, {
      mint: fromWeb3JsPublicKey(COLLECTION)
    });
    const editionAccount = findMasterEditionPda(rafflesClient.umi, {
      mint: fromWeb3JsPublicKey(COLLECTION)
    });

    const metadataArgs: MetadataArgs = {
      name,
      symbol,
      uri: metadataUri,
      creators,
      uses: null,
      editionNonce: some(0),
      collection: some({
        verified: false,
        key: fromWeb3JsPublicKey(COLLECTION)
      }),
      sellerFeeBasisPoints,
      primarySaleHappened: false,
      isMutable: false,
      // these values are taken from the Bubblegum package
      tokenProgramVersion: TokenProgramVersion.Original,
      tokenStandard: some(TokenStandard.NonFungible)
    };

    const { result, signature } = await mintToCollectionV1(rafflesClient.umi, {
      merkleTree: fromWeb3JsPublicKey(MERKLE_TREE),
      leafOwner: rafflesClient.umiPublicKey,
      collectionMint: fromWeb3JsPublicKey(COLLECTION),
      metadata: metadataArgs
    }).sendAndConfirm(rafflesClient.umi);

    if (result.value.err) {
      console.log(
        `       Error submitting transaction: ${JSON.stringify(
          result.value.err
        )}`
      );
      return null;
    } else {
      console.log(`       Success!🎉`);
      console.log(`       ✅ - Minted and Verified NFT.`);
      const [txSignature] = base58.deserialize(signature);
      console.log(
        `       https://explorer.solana.com/tx/${txSignature.toString()}?cluster=${CLUSTER}`
      );
    }
  } catch (err) {
    console.log(err);
  }
}

export const main = async () => {
  console.log(`Running mintCompressedNft. Cluster: ${CLUSTER}`);
  console.log('Using RPC URL: ' + RPC_ENDPOINT);

  const wallet = loadWallet(KP_PATH);
  console.log('Wallet Public Key: ' + wallet.publicKey.toString());

  const rafflesClient = new RafflesClient(
    CLUSTER,
    RPC_ENDPOINT,
    new NodeWallet(wallet)
  );

  const CONFIG = createNftMetadata(rafflesClient);

  await mintCompressedNft(
    rafflesClient,
    CONFIG.metadata,
    CONFIG.imgName,
    amountToNumber(CONFIG.sellerFeeBasisPoints),
    CONFIG.symbol,
    CONFIG.creators
  );
};

main();
