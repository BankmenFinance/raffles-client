use anchor_lang::{
    prelude::Pubkey,
    solana_program::{instruction::Instruction, sysvar::rent},
    system_program, InstructionData, ToAccountMetas,
};
use anchor_spl::{associated_token, token};
use raffles::InitializeArgs;

#[allow(clippy::too_many_arguments)]
pub fn initialize(
    config: &Pubkey,
    raffles_program: &Pubkey,
    raffles_program_data: &Pubkey,
    upgrade_authority: &Pubkey,
    args: &InitializeArgs,
) -> Instruction {
    let accounts = raffles::accounts::Initialize {
        config: *config,
        raffles_program: *raffles_program,
        raffles_program_data: *raffles_program_data,
        upgrade_authority: *upgrade_authority,
        system_program: system_program::ID,
    };
    let ix_data = raffles::instruction::Initialize { args: *args };
    Instruction {
        program_id: raffles::id(),
        accounts: accounts.to_account_metas(Some(false)),
        data: ix_data.data(),
    }
}
