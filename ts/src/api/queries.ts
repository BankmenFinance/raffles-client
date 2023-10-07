import { PublicKey } from '@solana/web3.js';

export const allRafflesQuery = `
  query getAllRaffles {
    raffle(
      where: { status: { _eq: "Active" } }
    ) {
      address
      creator
      proceeds_mint
      max_entrants
      ticket_price
    }
  }
`;

export const allPrizesQuery = `
  query allPrizes {
    prize() {
      address
      prize_index
      claimed
      raffle
      winner
      prize_mint
      merkle_tree
    }
  }
`;

export const unclaimedPrizesQuery = `
  query allPrizes {
    prize(
      where: { winner: { _eq: false } }
    ) {
      address
      prize_index
      raffle
      prize_mint
      merkle_tree
    }
  }
`;

export const unclaimedPrizesForRaffleQuery = (raffle: PublicKey) => `
  query allPrizes {
    prize(
      where: {
        claimed: { _eq: false },
        raffle: { _eq: "${raffle.toString()}" }
      }
    ) {
      address
      prize_index
      raffle
      prize_mint
      merkle_tree
    }
  }
`;

export const allTicketsQuery = `
  query allTickets {
    ticket(
      where: { status: { _eq: "Valid" } }
    ) {
        user
        raffle
        index
    }
  }
`;

export const allUsersQuery = `
  query user {
    prize() {
      address
      raffles_created
      tickets_bought
      prizes_won
    }
  }
`;

export const rafflesForMintQuery = (mint: PublicKey) => `
query raffleForMint {
    raffle(
        where: { proceeds_mint: { _eq: "${mint.toString()}" } }
    ) {
        address
        creator
        proceeds_mint
        max_entrants
        ticket_price
    }
}
`;

export const prizesForRaffleQuery = (raffle: PublicKey) => `
query prizesForRaffle {
  prize(
    where: { raffle: { _eq: "${raffle.toString()}" } }
  ) {
    address
    raffle
    prize_mint
    merkle_tree
  }
}
`;

export const ticketsForUserQuery = (user: PublicKey) => `
query ticketsForUser {
  ticket(
    where: { buyer: { _eq: "${user.toString()}" } },
    status: { _eq: "Valid" }
  ) {
    buyer
    raffle
    ticket_index
  }
}
`;

export const ticketsForUserAndRaffleQuery = (
  user: PublicKey,
  raffle: PublicKey
) => `
query ticketsForUserAndRaffle {
  ticket(
    where: {
      buyer: { _eq: "${user.toString()}" },
      raffle: { _eq: "${raffle.toString()}" }},
      status: { _eq: "Valid" }
  ) {
    buyer
    raffle
    ticket_index
  }
}
`;
