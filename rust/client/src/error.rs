use solana_client::client_error::ClientError;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum RafflesClientError {
    #[error(transparent)]
    ClientError(#[from] ClientError),
    #[error(transparent)]
    Serdes(Box<dyn std::error::Error>),
}
