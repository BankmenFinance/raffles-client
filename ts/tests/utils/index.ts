import { Keypair } from '@solana/web3.js';
import fs from 'fs';

export const loadWallet = (KP_PATH: string): Keypair => {
  try {
    const keypair = JSON.parse(fs.readFileSync(KP_PATH, 'utf8'));
    return Keypair.fromSecretKey(Uint8Array.from(keypair));
  } catch (e) {
    console.error('Failed to load wallet', e);
    throw e;
  }
};

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
