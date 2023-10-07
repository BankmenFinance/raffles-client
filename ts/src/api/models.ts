export interface Raffle {
  address: string;
  proceedsMint: string;
  maxEntrants: number;
  ticketPrice: number;
  endsAt: string;
}

export interface AllRaffles {
  raffle: Raffle[];
}

export interface Prize {
  claimed: boolean;
  winner: string;
  address: string;
  raffle: string;
  mint?: string;
  merkleTree?: string;
}

export interface AllPrizes {
  prize: Prize[];
}

export interface Ticket {
  buyer: string;
  raffle: string;
  ticketIndex: number;
}

export interface AllTickets {
  ticket: Ticket[];
}

export interface User {
  address: string;
  rafflesCreated: number;
  ticketsBought: number;
  prizesWon: number;
}

export interface AllUsers {
  user: User[];
}
