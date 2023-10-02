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
  address: string;
  raffle: string;
  mint?: string;
  merkleTree?: string;
}

export interface AllPrizes {
  prize: Prize[];
}

export interface Ticket {
  user: string;
  raffle: string;
  index: number;
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
