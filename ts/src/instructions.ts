import {
  AccountMeta,
  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  TransactionInstruction
} from '@solana/web3.js';
import { RafflesProgramClient } from './client';
import { derivePrizeAddress } from './utils/pda';
import { Accounts, BN } from '@coral-xyz/anchor';
import { PrizeType } from './types';
import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  Metadata,
  TokenStandard,
  findMasterEditionPda,
  findMetadataPda,
  findTokenRecordPda
} from '@metaplex-foundation/mpl-token-metadata';
import {
  ReadApiAsset,
  GetAssetProofRpcResponse,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID
} from '@metaplex-foundation/mpl-bubblegum';
import { ConcurrentMerkleTreeAccount } from '@solana/spl-account-compression';
import { defaultPublicKey, isSome } from '@metaplex-foundation/umi';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress
} from '@solana/spl-token';
import {
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey
} from '@metaplex-foundation/umi-web3js-adapters';
import { MPL_TOKEN_AUTH_RULES_PROGRAM_ID } from '@metaplex-foundation/mpl-token-auth-rules';

const processInstructionAccounts = async (
  client: RafflesProgramClient,
  accounts: Accounts,
  sourceOwner: PublicKey,
  destinationOwner: PublicKey,
  metadataAccount?: Metadata,
  asset?: ReadApiAsset,
  merkleTree?: ConcurrentMerkleTreeAccount,
  assetProof?: GetAssetProofRpcResponse,
  isClaim?: boolean
) => {
  if (metadataAccount && (assetProof || merkleTree)) {
    throw new Error(
      'Invalid arguments. `metadataAccount` cannot be passed for compressed NFTs.'
    );
  }
  // checks for metadata account existence
  if (metadataAccount && isSome(metadataAccount.tokenStandard)) {
    const tokenStandard = metadataAccount.tokenStandard.value;
    const sourceTokenAccount = await getAssociatedTokenAddress(
      toWeb3JsPublicKey(metadataAccount.mint),
      sourceOwner,
      true
    );
    const destinationTokenAccount = await getAssociatedTokenAddress(
      toWeb3JsPublicKey(metadataAccount.mint),
      destinationOwner,
      true
    );

    accounts.prizeMint = metadataAccount.mint;
    if (isClaim) {
      accounts.winnerTokenAccount = destinationTokenAccount;
      accounts.sourceTokenAccount = sourceTokenAccount;
    } else {
      accounts.prizeTokenAccount = destinationTokenAccount;
      accounts.sourceTokenAccount = sourceTokenAccount;
    }

    // check if it is legacy nft | programmable nft
    if (
      tokenStandard === TokenStandard.NonFungible ||
      tokenStandard === TokenStandard.NonFungibleEdition ||
      tokenStandard === TokenStandard.ProgrammableNonFungible ||
      tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
    ) {
      const [metadata] = findMetadataPda(client.umi, {
        mint: metadataAccount.mint
      });

      const [edition] = findMasterEditionPda(client.umi, {
        mint: metadataAccount.mint
      });

      accounts.prizeEdition = edition;
      accounts.prizeMetadata = metadata;

      accounts.metadataProgram = MPL_TOKEN_METADATA_PROGRAM_ID;
      accounts.instructions = SYSVAR_INSTRUCTIONS_PUBKEY;
    }

    // check if it is programmable nft
    if (
      tokenStandard === TokenStandard.ProgrammableNonFungible ||
      tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
    ) {
      if (isClaim) {
        const [winnerTokenRecord] = findTokenRecordPda(client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(destinationTokenAccount)
        });
        const [prizeTokenRecord] = findTokenRecordPda(client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(sourceTokenAccount)
        });
        accounts.prizeTokenRecord = prizeTokenRecord;
        accounts.winnerTokenRecord = winnerTokenRecord;
      } else {
        const [sourceTokenRecord] = findTokenRecordPda(client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(sourceTokenAccount)
        });
        const [prizeTokenRecord] = findTokenRecordPda(client.umi, {
          mint: metadataAccount.mint,
          token: fromWeb3JsPublicKey(destinationTokenAccount)
        });
        accounts.sourceTokenRecord = sourceTokenRecord;
        accounts.prizeTokenRecord = prizeTokenRecord;
      }
    }
    let authorizationRules = null;

    // check if the programmable nft has a rule set
    if (
      isSome(metadataAccount.programmableConfig) &&
      isSome(metadataAccount.programmableConfig.value.ruleSet) &&
      defaultPublicKey().toString() !==
        metadataAccount.programmableConfig.value.ruleSet.value.toString()
    ) {
      authorizationRules =
        metadataAccount.programmableConfig.value.ruleSet.value;
    }
    // set the authorization rules account we tried to fetch before
    // if it is null, no problem, means it shouldn't be there anyway
    accounts.authorizationRules = authorizationRules;
    if (authorizationRules) {
      accounts.authRulesProgram = MPL_TOKEN_AUTH_RULES_PROGRAM_ID;
    }

    accounts.tokenProgram = TOKEN_PROGRAM_ID;
    accounts.associatedTokenProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
  }

  // if we get in here we know for sure that this is a compressed nft
  if (merkleTree && assetProof) {
    accounts.prizeMerkleTree = asset.compression.tree;
    accounts.prizeMerkleTreeAuthority = merkleTree.getAuthority();
    accounts.prizeLeafDelegate = destinationOwner;
    accounts.prizeLeafOwner = destinationOwner;
    accounts.noOpProgram = SPL_NOOP_PROGRAM_ID;
    accounts.accountCompressionProgram = SPL_ACCOUNT_COMPRESSION_PROGRAM_ID;
  }
  return accounts;
};

export const createAddPrizeInstruction = async (
  client: RafflesProgramClient,
  raffle: PublicKey,
  prizeIndex: number,
  amount: BN,
  prizeType: PrizeType,
  metadataAccount?: Metadata,
  asset?: ReadApiAsset,
  merkleTree?: ConcurrentMerkleTreeAccount,
  assetProof?: GetAssetProofRpcResponse
): Promise<{
  accounts: PublicKey[];
  ixs: TransactionInstruction[];
  signers: Keypair[];
}> => {
  const [prize] = derivePrizeAddress(raffle, prizeIndex, client.programId);

  const accounts = await processInstructionAccounts(
    client,
    {
      raffle,
      prize,
      creator: client.walletPubkey,
      instructions: null,
      prizeMint: null,
      prizeTokenAccount: null,
      prizeEdition: null,
      prizeMetadata: null,
      prizeTokenRecord: null,
      prizeMerkleTree: null,
      prizeMerkleTreeAuthority: null,
      prizeLeafOwner: null,
      prizeLeafDelegate: null,
      sourceTokenAccount: null,
      sourceTokenRecord: null,
      authorizationRules: null,
      payer: client.walletPubkey,
      systemProgram: SystemProgram.programId,
      tokenProgram: null,
      associatedTokenProgram: null,
      metadataProgram: null,
      authRulesProgram: null,
      bubblegumProgram: null,
      accountCompressionProgram: null,
      noOpProgram: null,
      rent: SYSVAR_RENT_PUBKEY
    },
    client.walletPubkey,
    prize,
    metadataAccount,
    asset,
    merkleTree,
    assetProof,
    false
  );

  const prizeTypeArgs = assetProof
    ? {
        prizeType: {
          compressed: {
            root: [...new PublicKey(assetProof.root.trim()).toBytes()],
            dataHash: [
              ...new PublicKey(asset.compression.data_hash.trim()).toBytes()
            ],
            creatorHash: [
              ...new PublicKey(asset.compression.creator_hash.trim()).toBytes()
            ],
            nonce: asset.compression.leaf_id,
            index: asset.compression.leaf_id
          }
        }
      }
    : prizeType;

  const ix = await client.methods
    .addPrize({
      prizeIndex,
      amount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prizeType: prizeTypeArgs as any
    })
    .accountsStrict(accounts)
    .instruction();

  if (merkleTree) {
    // parse the list of proof addresses into a valid AccountMeta[]
    const canopyDepth = merkleTree.getCanopyDepth();
    const proof: AccountMeta[] = assetProof.proof
      // eslint-disable-next-line no-extra-boolean-cast
      .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0))
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false
      }));
    ix.keys.push(...proof);
  }

  return {
    accounts: [prize],
    ixs: [ix],
    signers: []
  };
};

export const createClaimPrizeInstruction = async (
  client: RafflesProgramClient,
  raffle: PublicKey,
  prize: PublicKey,
  entrants: PublicKey,
  creator: PublicKey,
  winner: PublicKey,
  payer: PublicKey,
  prizeIndex: number,
  ticketIndex: number,
  asset?: ReadApiAsset,
  metadataAccount?: Metadata,
  merkleTree?: ConcurrentMerkleTreeAccount,
  assetProof?: GetAssetProofRpcResponse
): Promise<{
  accounts: PublicKey[];
  ixs: TransactionInstruction[];
  signers: Keypair[];
}> => {
  const accounts = await processInstructionAccounts(
    client,
    {
      raffle,
      prize,
      entrants,
      creator,
      instructions: null,
      prizeMint: null,
      prizeTokenAccount: null,
      prizeEdition: null,
      prizeMetadata: null,
      prizeTokenRecord: null,
      prizeMerkleTree: null,
      prizeMerkleTreeAuthority: null,
      prizeLeafOwner: null,
      prizeLeafDelegate: null,
      winnerTokenAccount: null,
      winnerTokenRecord: null,
      winner,
      authorizationRules: null,
      payer,
      systemProgram: SystemProgram.programId,
      tokenProgram: null,
      associatedTokenProgram: null,
      metadataProgram: null,
      authRulesProgram: null,
      bubblegumProgram: null,
      accountCompressionProgram: null,
      noOpProgram: null,
      rent: SYSVAR_RENT_PUBKEY
    },
    prize,
    winner,
    metadataAccount,
    asset,
    merkleTree,
    assetProof,
    true
  );

  const compressedArgs =
    merkleTree && assetProof
      ? {
          root: [...new PublicKey(assetProof.root.trim()).toBytes()],
          dataHash: [
            ...new PublicKey(asset.compression.data_hash.trim()).toBytes()
          ],
          creatorHash: [
            ...new PublicKey(asset.compression.creator_hash.trim()).toBytes()
          ],
          nonce: new BN(asset.compression.leaf_id),
          index: asset.compression.leaf_id
        }
      : null;

  const ix = await client.methods
    .claimPrize(prizeIndex, ticketIndex, compressedArgs)
    .accountsStrict(accounts)
    .instruction();

  if (merkleTree) {
    // parse the list of proof addresses into a valid AccountMeta[]
    const canopyDepth = merkleTree.getCanopyDepth();
    const proof: AccountMeta[] = assetProof.proof
      // eslint-disable-next-line no-extra-boolean-cast
      .slice(0, assetProof.proof.length - (!!canopyDepth ? canopyDepth : 0))
      .map((node: string) => ({
        pubkey: new PublicKey(node),
        isSigner: false,
        isWritable: false
      }));
    ix.keys.push(...proof);
  }

  return {
    accounts: [],
    ixs: [ix],
    signers: []
  };
};
