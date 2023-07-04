pub mod client;
pub mod error;
pub mod instructions;
pub mod utils;

pub mod prelude {
    pub use crate::client::*;
    pub use crate::error::*;
    pub use crate::utils::*;
}
use anchor_lang::prelude::Pubkey;
use raffles::state::{Config, Entrants, Raffle};

#[derive(Default, Clone)]
pub struct ConfigAccount {
    pub state: Box<Config>,
    pub pubkey: Pubkey,
}

#[derive(Default, Clone)]
pub struct EntrantsAccount {
    pub state: Box<Entrants>,
    pub pubkey: Pubkey,
}

#[derive(Default, Clone)]
pub struct RaffleAccount {
    pub state: Box<Raffle>,
    pub pubkey: Pubkey,
}
