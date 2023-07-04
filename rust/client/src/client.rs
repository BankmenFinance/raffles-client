use crate::{
    prelude::RafflesClientError,
    utils::{deserialize_account, get_program_accounts},
    ConfigAccount, EntrantsAccount, RaffleAccount,
};
use log::warn;
use raffles::state::{Config, Raffle};
use solana_client::{
    nonblocking::rpc_client::RpcClient,
    rpc_filter::{Memcmp, MemcmpEncodedBytes, MemcmpEncoding, RpcFilterType},
};
use std::sync::Arc;

pub struct RafflesClient {
    pub rpc_client: Arc<RpcClient>,
}

impl RafflesClient {
    pub fn new(rpc_client: Arc<RpcClient>) -> Self {
        Self { rpc_client }
    }

    /// Gets all existing [`Config`].
    ///
    /// # Errors
    ///
    /// This function will return an error if there is an error performing the RPC request.
    pub async fn get_config(&self) -> Result<ConfigAccount, RafflesClientError> {
        let config_address = Config::derive();

        let account = match self.rpc_client.get_account(&config_address.0).await {
            Ok(a) => a,
            Err(e) => {
                return Err(RafflesClientError::ClientError(e));
            }
        };

        let cfg = match deserialize_account::<Config>(&mut account.data.as_slice()) {
            Ok(a) => a,
            Err(e) => {
                warn!("Failed to deserialize account. Error: {:?}", e);
                return Err(RafflesClientError::Serdes(e));
            }
        };

        Ok(ConfigAccount {
            state: cfg,
            pubkey: config_address.0,
        })
    }

    /// Gets all existing [`Config`].
    ///
    /// # Errors
    ///
    /// This function will return an error if there is an error performing the RPC request.
    pub async fn get_raffles(&self) -> Result<Vec<RaffleAccount>, RafflesClientError> {
        let filters: Vec<RpcFilterType> = vec![RpcFilterType::DataSize(Raffle::LEN as u64 + 8)];

        let accounts = match get_program_accounts(&self.rpc_client, filters, &raffles::id()).await {
            Ok(a) => a,
            Err(e) => {
                return Err(RafflesClientError::ClientError(e));
            }
        };

        let mut profiles = Vec::new();

        for (account_pubkey, account) in accounts.iter() {
            let profile = match deserialize_account::<Raffle>(&mut account.data.as_slice()) {
                Ok(a) => a,
                Err(e) => {
                    warn!(
                        "Failed to deserialize account {}. Error: {:?}",
                        account_pubkey, e
                    );
                    continue;
                }
            };
            profiles.push(RaffleAccount {
                state: profile,
                pubkey: *account_pubkey,
            });
        }

        Ok(profiles)
    }
}
