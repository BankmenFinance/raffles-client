use clap::{App, Arg, SubCommand};

pub trait ConfigSubCommands {
    fn config_subcommands(self) -> Self;
}

impl ConfigSubCommands for App<'_, '_> {
    fn config_subcommands(self) -> Self {
        self.subcommand(
            SubCommand::with_name("init")
                .about("Initialize the Config.")
                .arg(
                    Arg::with_name("market")
                        .short("g")
                        .takes_value(true)
                        .long("market")
                        .help(
                            "The Phoenix Market to filter Grid Bots for, value should be a pubkey.",
                        ),
                )
                .arg(
                    Arg::with_name("protocol-fee")
                        .takes_value(true)
                        .long("protocol-fee")
                        .help(
                            "The protocol fee taken from performance fees, denominated in basis points, value should fit in a u16.",
                        ),
                )
        )
    }
}
