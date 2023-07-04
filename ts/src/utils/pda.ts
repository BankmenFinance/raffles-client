import { PublicKey } from '@solana/web3.js';
import { B_RAFFLE, B_PROCEEDS, B_PRIZE, B_CONFIG } from '../constants/shared';
import { utils } from '@project-serum/anchor';
import BN from 'bn.js';

export const deriveConfigAddress = (programId: PublicKey) => {
  const seed = utils.bytes.utf8.encode(B_CONFIG);

  return utils.publicKey.findProgramAddressSync([seed], programId);
};

export const deriveRaffleAddress = (
  entrants: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_RAFFLE);

  return utils.publicKey.findProgramAddressSync(
    [seed, entrants.toBuffer()],
    programId
  );
};

export const deriveProceedsAddress = (
  raffle: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_PROCEEDS);

  return utils.publicKey.findProgramAddressSync(
    [raffle.toBuffer(), seed],
    programId
  );
};

export const derivePrizeAddress = (
  raffle: PublicKey,
  prizeIndex: number,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_PRIZE);

  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(prizeIndex, 0);

  return utils.publicKey.findProgramAddressSync(
    [raffle.toBuffer(), seed, buffer],
    programId
  );
};
