/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  OptionOrNullable,
  PercentAmount,
  Umi,
  generateSigner,
  percentAmount
} from '@metaplex-foundation/umi';
import { RafflesClient } from '@bankmenfi/raffles-client/client';
import { Creator, createNft } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey } from '@metaplex-foundation/umi';
import { base58 } from '@metaplex-foundation/umi/serializers';

export const createNftMetadata = (rafflesClient: RafflesClient) => {
  return {
    imgName: 'Bankmen Finance Test',
    symbol: 'BFT',
    sellerFeeBasisPoints: percentAmount(1, 2),
    creators: [
      { address: rafflesClient.umiPublicKey, share: 100, verified: false }
    ],
    metadata: 'https://arweave.net/yIgHNXiELgQqW8QIbFM9ibVV37jhvfyW3mFcZGRX-PA'
  };
};

export const createCollectionNftMetadata = (rafflesClient: RafflesClient) => {
  return {
    imgName: 'Bankmen Finance Test Collection',
    symbol: 'BFTC',
    sellerFeeBasisPoints: percentAmount(1, 2),
    creators: [
      { address: rafflesClient.umiPublicKey, share: 100, verified: false }
    ],
    metadata: 'https://arweave.net/yIgHNXiELgQqW8QIbFM9ibVV37jhvfyW3mFcZGRX-PA'
  };
};

export async function createCollectionNft(
  rafflesClient: RafflesClient,
  metadataUri: string,
  name: string,
  sellerFeeBasisPoints: PercentAmount<2>,
  symbol: string,
  creators: OptionOrNullable<Creator[]>
): Promise<PublicKey | null> {
  try {
    console.log(`       Creating Collection Mint`);
    const mint = generateSigner(rafflesClient.umi);
    const { result, signature } = await createNft(rafflesClient.umi, {
      mint,
      uri: metadataUri,
      name,
      symbol,
      sellerFeeBasisPoints,
      creators,
      isCollection: true,
      updateAuthority: rafflesClient.umiPublicKey
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
      console.log(
        `       ✅ - Minted Collection NFT: ${mint.publicKey.toString()}`
      );
      console.log(
        `       https://explorer.solana.com/address/${mint.publicKey.toString()}?cluster=devnet`
      );
      const [txSignature] = base58.deserialize(signature);
      console.log(
        `       https://explorer.solana.com/tx/${txSignature.toString()}?cluster=devnet`
      );
      return mint.publicKey;
    }
  } catch (err) {
    console.log(err);
  }
}
