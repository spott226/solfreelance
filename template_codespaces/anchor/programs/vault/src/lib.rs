use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("FinQpN2cyfhNKHVX2LjPRqg7V4JUcPXZ5ipLSSrHFBJJ");

#[program]
pub mod vault {
    use super::*;

    // 1. Crear escrow + depositar
    pub fn initialize(
        ctx: Context<Initialize>,
        amount: u64,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        vault.client = ctx.accounts.client.key();
        vault.freelancer = ctx.accounts.freelancer.key();
        vault.amount = amount;
        vault.is_released = false;

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.client.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }

    // 2. Liberar pago (solo cliente)
    pub fn release(ctx: Context<Release>) -> Result<()> {

    // 🔑 PRIMERO sacas account_info (ANTES del borrow mutable)
    let vault_info = ctx.accounts.vault.to_account_info();
    let freelancer_info = ctx.accounts.freelancer.to_account_info();

    let vault = &mut ctx.accounts.vault;

    require!(
        ctx.accounts.client.key() == vault.client,
        VaultError::Unauthorized
    );

    require!(!vault.is_released, VaultError::AlreadyReleased);

    let amount = vault.amount;

    **vault_info.try_borrow_mut_lamports()? -= amount;
    **freelancer_info.try_borrow_mut_lamports()? += amount;

    vault.is_released = true;

    Ok(())
}
}

#[account]
pub struct Vault {
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
    pub is_released: bool,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = client,
        space = 8 + 32 + 32 + 8 + 1
    )]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub client: Signer<'info>,

    /// CHECK: solo dirección
    pub freelancer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub client: Signer<'info>,

    /// CHECK: solo destino
    #[account(mut)]
    pub freelancer: AccountInfo<'info>,
}

#[error_code]
pub enum VaultError {
    #[msg("No autorizado")]
    Unauthorized,
    #[msg("Ya liberado")]
    AlreadyReleased,
}