import { Event } from '@coral-xyz/anchor';
import { TypeDef } from '@coral-xyz/anchor/dist/cjs/program/namespace/types';
import type { Raffles } from '../generated/types/raffles';

export type ConfigState = TypeDef<Raffles['accounts'][0], Raffles>;
export type RaffleState = TypeDef<Raffles['accounts'][1], Raffles>;
export type PrizeState = TypeDef<Raffles['accounts'][2], Raffles>;
export type EntrantsState = TypeDef<Raffles['accounts'][3], Raffles>;

export type CompressedArgs = TypeDef<Raffles['types'][0], Raffles>;
export type AddPrizeArgs = TypeDef<Raffles['types'][1], Raffles>;
export type InitializeArgs = TypeDef<Raffles['types'][2], Raffles>;
export type PrizeType = TypeDef<Raffles['types'][3], Raffles>;

export type RaffleCreated = Event<Raffles['events'][0], Raffles>;
export type PrizeAdded = Event<Raffles['events'][1], Raffles>;
export type WinnerRevealed = Event<Raffles['events'][2], Raffles>;
