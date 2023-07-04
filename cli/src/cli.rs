use clap::ArgMatches;
use raffles::{state::Config, InitializeArgs};
use raffles_client::{
    instructions::initialize as init_ix,
    utils::{create_transaction, send_transaction},
};
use solana_clap_utils::input_validators::normalize_to_url_if_moniker;
use solana_client::{client_error::ClientError, nonblocking::rpc_client::RpcClient};
use solana_sdk::{
    bpf_loader_upgradeable, commitment_config::CommitmentConfig, pubkey::Pubkey,
    signature::Keypair, signer::Signer,
};
use std::{fs::File, io::Read, str::FromStr, sync::Arc};
use thiserror::Error;

pub enum CliCommand {
    Initialize { protocol_fee: u16 },
}

pub struct CliCommandInfo {
    pub command: CliCommand,
}

pub struct CliConfig {
    pub command: CliCommand,
    pub json_rpc_url: String,
    pub keypair_path: String,
    pub rpc_client: Option<Arc<RpcClient>>,
    pub keypair: Option<Keypair>,
}

#[derive(Debug, Error)]
#[allow(clippy::large_enum_variant)]
pub enum CliError {
    #[error("Bad parameter: {0}")]
    BadParameters(String),
    #[error(transparent)]
    ClientError(#[from] ClientError),
    #[error("Command not recognized: {0}")]
    CommandNotRecognized(String),
    #[error("Keypair file opening error: {0}")]
    KeypairFileOpenError(String),
    #[error("Keypair file read error: {0}")]
    KeypairFileReadError(String),
    #[error("Keypair loading error: {0}")]
    KeypairLoadError(String),
}

fn load_keypair(path: &str) -> Result<Keypair, Box<dyn std::error::Error>> {
    let fd = File::open(path);

    let mut file = match fd {
        Ok(f) => f,
        Err(e) => {
            return Err(Box::new(CliError::KeypairFileOpenError(e.to_string())));
        }
    };

    let file_string = &mut String::new();
    let file_read_res = file.read_to_string(file_string);

    if let Err(e) = file_read_res {
        return Err(Box::new(CliError::KeypairFileReadError(e.to_string())));
    };

    let keypair_bytes: Vec<u8> = file_string
        .replace('[', "")
        .replace(']', "")
        .replace(',', " ")
        .split(' ')
        .map(|x| u8::from_str(x).unwrap())
        .collect();

    let keypair = Keypair::from_bytes(keypair_bytes.as_ref());

    match keypair {
        Ok(kp) => Ok(kp),
        Err(e) => Err(Box::new(CliError::KeypairLoadError(e.to_string()))),
    }
}

pub async fn process_command(config: &CliConfig) -> Result<String, Box<dyn std::error::Error>> {
    match &config.command {
        CliCommand::Initialize { protocol_fee } => {
            initialize(config, *protocol_fee).await.unwrap();
            return Ok("Sucessfully intialized config.".to_string());
        }
    }
}

pub async fn initialize(
    config: &CliConfig,
    protocol_fee: u16,
) -> Result<(), Box<dyn std::error::Error>> {
    let rpc_client = config.rpc_client.as_ref().unwrap();
    let keypair = config.keypair.as_ref().unwrap();

    let (config, _) = Config::derive();

    let program_data =
        Pubkey::find_program_address(&[&raffles::ID.as_ref()], &bpf_loader_upgradeable::ID);

    let ixs = vec![init_ix(
        &config,
        &raffles::id(),
        &program_data.0,
        &keypair.pubkey(),
        &InitializeArgs { protocol_fee },
    )];

    println!("{:?}", ixs);

    let blockhash = match rpc_client.get_latest_blockhash().await {
        Ok(bh) => bh,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    let tx = create_transaction(blockhash, &ixs, keypair, None);

    let sig = match send_transaction(rpc_client, &tx, true).await {
        Ok(s) => s,
        Err(e) => {
            return Err(Box::new(e));
        }
    };

    println!(
        "Successfully created Config. Transaction signature: {}",
        sig
    );
    Ok(())
}

pub fn parse_command(matches: &ArgMatches) -> Result<CliCommandInfo, Box<dyn std::error::Error>> {
    let response: CliCommandInfo = match matches.subcommand() {
        ("init", Some(matches)) => {
            let protocol_fee = u16::from_str(matches.value_of("protocol-fee").unwrap()).unwrap();
            Ok(CliCommandInfo {
                command: CliCommand::Initialize { protocol_fee },
            })
        }
        ("", None) => {
            eprintln!("{}", matches.usage());
            Err(CliError::CommandNotRecognized(
                "no subcommand given".to_string(),
            ))
        }
        _ => unreachable!(),
    }?;
    Ok(response)
}

pub fn parse_args(matches: &ArgMatches<'_>) -> Result<CliConfig, Box<dyn std::error::Error>> {
    let json_rpc_url = matches.value_of("json_rpc_url").unwrap();
    let keypair_path = matches.value_of("keypair").unwrap();

    let normalized_url = normalize_to_url_if_moniker(json_rpc_url);
    println!("Using JSON-RPC URL: {}", normalized_url);

    println!("Loading keypair from: {}", keypair_path);
    let keypair = load_keypair(keypair_path)?;
    println!("Loaded keypair with address: {}", keypair.pubkey());

    let CliCommandInfo { command } = parse_command(matches)?;

    Ok(CliConfig {
        command,
        json_rpc_url: normalized_url.to_string(),
        keypair_path: keypair_path.to_string(),
        rpc_client: Some(Arc::new(RpcClient::new_with_commitment(
            normalized_url,
            CommitmentConfig::confirmed(),
        ))),
        keypair: Some(keypair),
    })
}
