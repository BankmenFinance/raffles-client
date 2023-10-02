import { fetchGraphqlData } from '../utils/shared';
import { AllPrizes, AllRaffles, AllUsers, AllTickets } from '../api/models';
import {
  allPrizesQuery,
  allRafflesQuery,
  allTicketsQuery,
  allUsersQuery,
  rafflesForMintQuery,
  prizesForRaffleQuery,
  ticketsForUserQuery,
  ticketsForUserAndRaffleQuery
} from '../api/queries';
import { PublicKey } from '@solana/web3.js';

export class RafflesApiClient {
  constructor(readonly endpoint: string) {}

  async getRaffles(): Promise<AllRaffles> {
    return await fetchGraphqlData<AllRaffles>(this.endpoint, allRafflesQuery);
  }

  async getRafflesWithMint(mint: PublicKey): Promise<AllRaffles> {
    return await fetchGraphqlData<AllRaffles>(
      this.endpoint,
      rafflesForMintQuery(mint)
    );
  }

  async getPrizes(): Promise<AllPrizes> {
    return await fetchGraphqlData<AllPrizes>(this.endpoint, allPrizesQuery);
  }

  async getPrizesForRaffle(raffle: PublicKey): Promise<AllPrizes> {
    return await fetchGraphqlData<AllPrizes>(
      this.endpoint,
      prizesForRaffleQuery(raffle)
    );
  }

  async getTickets(): Promise<AllTickets> {
    return await fetchGraphqlData<AllTickets>(this.endpoint, allTicketsQuery);
  }

  async getTicketsForUser(user: PublicKey): Promise<AllTickets> {
    return await fetchGraphqlData<AllTickets>(
      this.endpoint,
      ticketsForUserQuery(user)
    );
  }

  async getTicketsForUserAndRaffle(
    user: PublicKey,
    raffle: PublicKey
  ): Promise<AllTickets> {
    return await fetchGraphqlData<AllTickets>(
      this.endpoint,
      ticketsForUserAndRaffleQuery(user, raffle)
    );
  }

  async getUsers(): Promise<AllUsers> {
    return await fetchGraphqlData<AllUsers>(this.endpoint, allUsersQuery);
  }
}
