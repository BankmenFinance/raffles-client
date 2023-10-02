import { BN } from '@coral-xyz/anchor';

export const getEntrantsSize = (maxEntrants: number) => {
  return 8 + 4 + 4 + 32 * maxEntrants;
};

/**
 * Fetches GraphQL data from the GBG API.
 * @param api The API URL.
 * @param query The GraphQL query.
 * @param variables The variables that need to be injected into the GraphQL query.
 * @returns The response JSON.
 */
export async function fetchGraphqlData<T>(
  api: string,
  query: string
): Promise<T> {
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });

  return (await res.json()) as T;
}

export function bnToDate(bn: BN): Date {
  return new Date(bn.toNumber() * 1000);
}

export function dateToBn(date: Date): BN {
  return new BN(date.valueOf() / 1_000);
}
