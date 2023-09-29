import { PublicKey } from '@solana/web3.js';
import { B_RAFFLE, B_PRIZE, B_CONFIG } from '../constants/shared';
import { utils } from '@coral-xyz/anchor';

export const deriveConfigAddress = (programId: PublicKey) => {
  const seed = utils.bytes.utf8.encode(B_CONFIG);

  return PublicKey.findProgramAddressSync([seed], programId);
};

export const deriveRaffleAddress = (
  entrants: PublicKey,
  programId: PublicKey
) => {
  const seed = utils.bytes.utf8.encode(B_RAFFLE);

  return PublicKey.findProgramAddressSync(
    [seed, entrants.toBuffer()],
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

  return PublicKey.findProgramAddressSync(
    [raffle.toBuffer(), seed, buffer],
    programId
  );
};
