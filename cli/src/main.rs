use clap::{crate_description, crate_name, ArgMatches};
use raffles_cli::{
    cli::{parse_args, process_command},
    get_clap_app,
};
use std::error;

pub const VERSION: &str = "0.0.1";

#[tokio::main]
async fn main() {
    solana_logger::setup_with_default("off");

    let matches = get_clap_app(crate_name!(), crate_description!(), VERSION).get_matches();

    run(&matches).await.unwrap();
}

async fn run(matches: &ArgMatches<'_>) -> Result<(), Box<dyn error::Error>> {
    let config = parse_args(matches)?;
    let result = process_command(&config).await?;
    println!("{}", result);
    Ok(())
}
