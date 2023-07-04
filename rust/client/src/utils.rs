use anchor_lang::{AccountDeserialize, Discriminator, Owner};
use solana_account_decoder::UiAccountEncoding;
use solana_client::{
    client_error::ClientError,
    nonblocking::rpc_client::RpcClient,
    rpc_config::{RpcAccountInfoConfig, RpcProgramAccountsConfig, RpcSendTransactionConfig},
    rpc_filter::RpcFilterType,
};
use solana_sdk::{
    account::Account,
    commitment_config::{CommitmentConfig, CommitmentLevel},
    hash::Hash,
    instruction::Instruction,
    pubkey::Pubkey,
    signature::{Keypair, Signature},
    signer::Signer,
    transaction::Transaction,
};
use std::{
    fs::File,
    io::Read,
    path::Path,
    str::{from_utf8, FromStr, Utf8Error},
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum KeypairError {
    #[error("Error opening keypair file: {:?}", self)]
    FileOpen(std::io::Error),
    #[error("Error reading keypair file: {:?}", self)]
    FileRead(std::io::Error),
    #[error("Provided keypair file contents do not match keypair length.")]
    SizeMismatch,
    #[error("Error loading keypair.")]
    Load,
}

/// The length in bytes of a keypair, to match the underlying Ed25519 Keypair.
pub const KEYPAIR_LENGTH: usize = 64;

/// Loads a Solana [`Keypair`] from a file at the given path.
///
/// ### Errors
///
/// This function will return an error if something goes wrong while attempting to open or
/// read the file, or finally in case the [`Keypair`] bytes in the file are invalid.
///
/// ### Format
///
/// The file should have the following format, and in total should have [`KEYPAIR_LENGTH`] bytes.
///
/// \[123, 34, 78, 0, 1, 3, 45 (...)\]
#[inline(always)]
pub fn load_keypair<P>(path: P) -> Result<Keypair, KeypairError>
where
    P: AsRef<Path>,
{
    let fd = File::open(path);

    let mut file = match fd {
        Ok(f) => f,
        Err(e) => {
            return Err(KeypairError::FileOpen(e));
        }
    };

    let file_string = &mut String::new();
    let file_read_res = file.read_to_string(file_string);

    if let Err(e) = file_read_res {
        return Err(KeypairError::FileRead(e));
    };

    let keypair_bytes: Vec<u8> = file_string
        .replace('[', "")
        .replace(']', "")
        .replace(',', " ")
        .split(' ')
        .map(|x| u8::from_str(x).unwrap())
        .collect();

    if keypair_bytes.len() != KEYPAIR_LENGTH {
        return Err(KeypairError::SizeMismatch);
    }

    let keypair = Keypair::from_bytes(keypair_bytes.as_ref());

    match keypair {
        Ok(kp) => Ok(kp),
        Err(_) => Err(KeypairError::Load),
    }
}

/// Encodes a string into an array of bytes fixed with 32 length.
#[inline(always)]
pub fn encode_string(alias: &str) -> [u8; 32] {
    let mut encoded = [0_u8; 32];
    let alias_bytes = alias.as_bytes();
    assert!(alias_bytes.len() <= 32);
    for (i, byte) in alias_bytes.iter().enumerate() {
        encoded[i] = *byte;
    }
    encoded
}

#[inline(always)]
pub fn decode_string(data: &[u8]) -> Result<String, Utf8Error> {
    let str = match from_utf8(data) {
        Ok(s) => s,
        Err(e) => {
            return Err(e);
        }
    };
    let str = str.trim_matches(char::from(0));
    Ok(str.to_string())
}

/// Sends a transaction
#[inline(always)]
pub async fn send_transaction(
    rpc_client: &RpcClient,
    tx: &Transaction,
    confirm: bool,
) -> Result<Signature, ClientError> {
    let config = RpcSendTransactionConfig {
        preflight_commitment: Some(CommitmentLevel::Processed),
        ..Default::default()
    };
    let submit_res = if confirm {
        rpc_client.send_and_confirm_transaction(tx).await
    } else {
        rpc_client.send_transaction_with_config(tx, config).await
    };
    match submit_res {
        Ok(s) => Ok(s),
        Err(e) => Err(e),
    }
}

/// Creates a transaction with the given blockhash, instructions, payer and signers.
pub fn create_transaction(
    blockhash: Hash,
    ixs: &[Instruction],
    payer: &Keypair,
    signers: Option<&[&Keypair]>,
) -> Transaction {
    let mut all_signers = vec![payer];
    if let Some(signers) = signers {
        all_signers.extend_from_slice(signers);
    }
    let mut transaction = Transaction::new_with_payer(ixs, Some(&payer.pubkey()));

    transaction.sign(&all_signers, blockhash);
    transaction
}

/// Gets all program accounts according to the given filters for the given program.
pub async fn get_program_accounts(
    rpc_client: &RpcClient,
    filters: Vec<RpcFilterType>,
    program_id: &Pubkey,
) -> Result<Vec<(Pubkey, Account)>, ClientError> {
    rpc_client
        .get_program_accounts_with_config(
            program_id,
            RpcProgramAccountsConfig {
                filters: Some(filters),
                account_config: RpcAccountInfoConfig {
                    encoding: Some(UiAccountEncoding::Base64),
                    commitment: Some(CommitmentConfig::confirmed()),
                    ..RpcAccountInfoConfig::default()
                },
                ..RpcProgramAccountsConfig::default()
            },
        )
        .await
}

/// Gets the account and attempts deserializing the received account data into the the account [`T`].
///
/// # Errors
///
/// This function will return an error if there is an error during deserialization.
pub async fn get_program_account<T>(
    rpc_client: &RpcClient,
    account: &Pubkey,
) -> Result<Box<T>, Box<dyn std::error::Error>>
where
    T: Owner + Discriminator + AccountDeserialize,
{
    let account = match rpc_client.get_account_data(account).await {
        Ok(a) => a,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    deserialize_account::<T>(&mut account.as_slice())
}

/// Attempts deserializing the given account data into the the account [`T`].
///
/// # Errors
///
/// This function will return an error if there is an error during deserialization.
pub fn deserialize_account<T>(data: &mut &[u8]) -> Result<Box<T>, Box<dyn std::error::Error>>
where
    T: Owner + Discriminator + AccountDeserialize,
{
    let decoded = match T::try_deserialize(data) {
        Ok(a) => a,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    Ok(Box::new(decoded))
}
