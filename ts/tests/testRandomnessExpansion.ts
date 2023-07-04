/* eslint-disable @typescript-eslint/no-var-requires */
import { expand } from '../src/utils/randomness';

// Load  Env Variables
require('dotenv').config({
  path: __dirname + `/default.env`
});

require('dotenv').config({
  path: __dirname + `/args.env` // Can also be used to override default env variables
});

// Constants

export const main = async () => {
  console.log('Running testRandomnessExpansion.');

  const randomness = Buffer.alloc(32, 0);
  randomness[0] = 1;
  randomness[2] = 2;

  console.log(randomness);
  const firstResult = expand(randomness, 0);
  console.log(firstResult);

  randomness[0] = 255;
  randomness[1] = 254;

  console.log(randomness);
  const secondResult = expand(randomness, 1);
  console.log(secondResult);
};

main();
