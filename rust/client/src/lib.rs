use anchor_lang::prelude::*;

anchor_gen::generate_cpi_interface!(idl_path = "idl.json");

#[cfg(feature = "mainnet-beta")]
declare_id!("8H35HKgE2YXbvV1aoU4954jnTuMm88yjGRt1giUgxpwu");
#[cfg(not(feature = "mainnet-beta"))]
declare_id!("8H35HKgE2YXbvV1aoU4954jnTuMm88yjGRt1giUgxpwu");

impl std::fmt::Debug for RaffleCreated {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RaffleCreated")
            .field("raffle", &self.raffle)
            .field("creator", &self.creator)
            .field("max_entrants", &self.max_entrants)
            .field("end_timestamp", &self.end_timestamp)
            .field("ticket_price", &self.ticket_price)
            .finish()
    }
}

impl std::fmt::Debug for RaffleClosed {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RaffleClosed")
            .field("raffle", &self.raffle)
            .field("creator", &self.creator)
            .finish()
    }
}
impl std::fmt::Debug for TicketBought {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("TicketsBought")
            .field("raffle", &self.raffle)
            .field("buyer", &self.buyer)
            .field("ticket_index", &self.index)
            .finish()
    }
}

impl std::fmt::Debug for PrizeAdded {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("PrizeAdded")
            .field("raffle", &self.raffle)
            .field("prize", &self.prize)
            .field("prize_index", &self.prize_index)
            .field("amount", &self.amount)
            .field("mint", &self.mint)
            .field("metadata", &self.metadata)
            .field("token_record", &self.token_record)
            .field("merkle_tree", &self.merkle_tree)
            .finish()
    }
}

impl std::fmt::Debug for PrizeClaimed {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("PrizeClaimed")
            .field("raffle", &self.raffle)
            .field("prize", &self.prize)
            .field("prize_index", &self.prize_index)
            .field("ticket_index", &self.ticket_index)
            .field("winner", &self.winner)
            .field("amount", &self.amount)
            .finish()
    }
}

impl std::fmt::Debug for WinnerRevealed {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("WinnerRevealed")
            .field("raffle", &self.raffle)
            .field("randomness", &self.randomness)
            .finish()
    }
}
