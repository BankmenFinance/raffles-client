use anchor_lang::{
    prelude::*,
    solana_program::{keccak, pubkey::PUBKEY_BYTES},
};

anchor_gen::generate_cpi_interface!(idl_path = "idl.json");

#[cfg(feature = "mainnet-beta")]
declare_id!("BMrafdefSrPWCwxgiKsRURz7uM3vd8maZFga6qCQDXBB");
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
            .field("proceeds_mint", &self.proceeds_mint)
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

impl std::fmt::Debug for RaffleEdit {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RaffleEdit")
            .field("raffle", &self.raffle)
            .field("max", &self.max)
            .field("ticket_price", &self.ticket_price)
            .finish()
    }
}

impl std::fmt::Debug for RaffleCancelled {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RaffleCancelled")
            .field("raffle", &self.raffle)
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

impl std::fmt::Debug for ProceedsCollected {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ProceedsCollected")
            .field("raffle", &self.raffle)
            .field("creator", &self.creator)
            .field("proceeds_mint", &self.proceeds_mint)
            .field("amount", &self.amount)
            .field("fee", &self.fee)
            .finish()
    }
}

impl Entrants {
    /// The size of the account, not accounting for the Anchor Discriminator.
    pub const LEN: usize = std::mem::size_of::<Self>();
    /// The size of entrants excluding the entrants array.
    pub const BASE_SIZE: usize = 8 + Self::LEN;

    /// Gets the entrant for the given ticket index.
    pub fn get_entrant_by_ticket_index(
        entrants_data: &[u8],
        max_entrants: usize,
        ticket_index: usize,
    ) -> Pubkey {
        let mut i = 0;

        for idx in 0..max_entrants {
            let start_index = Entrants::BASE_SIZE + PUBKEY_BYTES * idx;
            let entrant =
                Pubkey::try_from_slice(&entrants_data[start_index..start_index + PUBKEY_BYTES])
                    .unwrap();
            if entrant != Pubkey::default() {
                if i == ticket_index {
                    return entrant;
                } else {
                    i += 1;
                }
            }
        }

        Pubkey::default()
    }
}

pub fn expand(randomness: [u8; 32], n: u32) -> u32 {
    let mut hasher = keccak::Hasher::default();
    hasher.hash(&randomness);
    hasher.hash(&n.to_le_bytes());

    u32::from_le_bytes(
        hasher.result().to_bytes()[0..4]
            .try_into()
            .expect("slice with incorrect length"),
    )
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_bit_slicing() {
        let mut randomness = [0; 32];
        randomness[0] = 1;
        randomness[2] = 2;

        let first_result = expand(randomness, 0);
        println!("{}", first_result);

        randomness[0] = 255;
        randomness[1] = 254;

        let second_result = expand(randomness, 1);
        assert_ne!(first_result, second_result);
    }
}
