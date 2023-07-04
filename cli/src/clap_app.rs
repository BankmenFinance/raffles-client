use clap::{App, AppSettings, Arg};
use solana_clap_utils::input_validators::is_url_or_moniker;

use crate::ConfigSubCommands;

pub fn get_clap_app<'a, 'b>(name: &str, about: &'a str, version: &'b str) -> App<'a, 'b> {
    App::new(name)
        .about(about)
        .version(version)
        .setting(AppSettings::SubcommandRequiredElseHelp)
        .setting(AppSettings::UnifiedHelpMessage)
        .arg(
            Arg::with_name("json_rpc_url")
                .short("u")
                .long("url")
                .value_name("URL_OR_MONIKER")
                .takes_value(true)
                .global(true)
                .validator(is_url_or_moniker)
                .help("URL for Solana's JSON RPC"),
        )
        .arg(
            Arg::with_name("keypair")
                .short("k")
                .long("keypair")
                .value_name("KEYPAIR")
                .global(true)
                .takes_value(true)
                .help("Filepath or URL to a keypair"),
        )
        .config_subcommands()
}
