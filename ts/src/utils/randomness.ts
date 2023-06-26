import createKeccakHash from 'keccak';

export const expand = (randomness: Buffer, n: number) => {
  const hasher = createKeccakHash('keccak256');
  hasher.update(randomness);

  const numberBuffer = Buffer.alloc(4, 0);
  numberBuffer.writeUInt32LE(n, 0);

  hasher.update(numberBuffer);

  const digest = hasher.digest();
  const resultBuffer = digest.subarray(0, 4);

  return resultBuffer.readUInt32LE();
};
