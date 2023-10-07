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
  ticketsForUserAndRaffleQuery,
  unclaimedPrizesQuery,
  unclaimedPrizesForRaffleQuery
} from '../api/queries';
import { PublicKey } from '@solana/web3.js';
import { Cluster } from '../types';
import { CONFIGS } from '../constants';

/**
 * This Raffles Api Client exposes utility methods to fetch data from the GraphQL API.
 */
export class RafflesApiClient {
  private endpoint: string;

  constructor(readonly cluster: Cluster, endpoint?: string) {
    this.endpoint = endpoint ? endpoint : CONFIGS[cluster].HISTORY_API_GRAPHQL;
  }

  /**
   * Fetches all raffles.
   */
  async getRaffles(): Promise<AllRaffles> {
    return await fetchGraphqlData<AllRaffles>(this.endpoint, allRafflesQuery);
  }

  /**
   * Fetches all raffles with a given mint.
   */
  async getRafflesWithMint(mint: PublicKey): Promise<AllRaffles> {
    return await fetchGraphqlData<AllRaffles>(
      this.endpoint,
      rafflesForMintQuery(mint)
    );
  }

  /**
   * Fetches all prizes.
   */
  async getPrizes(): Promise<AllPrizes> {
    return await fetchGraphqlData<AllPrizes>(this.endpoint, allPrizesQuery);
  }

  /**
   * Fetches all prizes for a given raffle.
   */
  async getPrizesForRaffle(raffle: PublicKey): Promise<AllPrizes> {
    return await fetchGraphqlData<AllPrizes>(
      this.endpoint,
      prizesForRaffleQuery(raffle)
    );
  }

  /**
   * Fetches all prizes.
   */
  async getUnclaimedPrizes(): Promise<AllPrizes> {
    return await fetchGraphqlData<AllPrizes>(
      this.endpoint,
      unclaimedPrizesQuery
    );
  }

  /**
   * Fetches all prizes.
   */
  async getUnclaimedPrizesForRaffle(raffle: PublicKey): Promise<AllPrizes> {
    return await fetchGraphqlData<AllPrizes>(
      this.endpoint,
      unclaimedPrizesForRaffleQuery(raffle)
    );
  }

  /**
   * Fetches all tickets.
   */
  async getTickets(): Promise<AllTickets> {
    return await fetchGraphqlData<AllTickets>(this.endpoint, allTicketsQuery);
  }

  /**
   * Fetches all tickets that a given user has purchased.
   */
  async getTicketsForUser(user: PublicKey): Promise<AllTickets> {
    return await fetchGraphqlData<AllTickets>(
      this.endpoint,
      ticketsForUserQuery(user)
    );
  }

  /**
   * Fetches all tickets that a given user has purchased for the given raffle.
   */
  async getTicketsForUserAndRaffle(
    user: PublicKey,
    raffle: PublicKey
  ): Promise<AllTickets> {
    return await fetchGraphqlData<AllTickets>(
      this.endpoint,
      ticketsForUserAndRaffleQuery(user, raffle)
    );
  }

  /**
   * Fetches all users.
   */
  async getUsers(): Promise<AllUsers> {
    return await fetchGraphqlData<AllUsers>(this.endpoint, allUsersQuery);
  }
}
