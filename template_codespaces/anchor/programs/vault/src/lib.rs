use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("4ZQboCKFb5sJHkzNhQ48VTmo2Zt2zTaJWuMw2aENuo66");

#[program]
pub mod vault {
    use super::*;

    // =========================
    // CREATE (cliente deposita)
    // =========================
    pub fn create_project(ctx: Context<CreateProject>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let vault = &mut ctx.accounts.vault;

        vault.client = ctx.accounts.client.key();
        vault.freelancer = Pubkey::default();
        vault.amount = amount;
        vault.is_assigned = false;
        vault.is_released = false;
        vault.applicants = Vec::new();

        // depósito inicial
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

    // =========================
    // APPLY (freelancer deposita)
    // =========================
    pub fn apply(ctx: Context<Apply>, commitment: u64) -> Result<()> {

    // 🔥 PRIMERO sacas account_info
    let vault_info = ctx.accounts.vault.to_account_info();
    let freelancer_info = ctx.accounts.freelancer.to_account_info();

    // 🔥 LUEGO mutable borrow
    let vault = &mut ctx.accounts.vault;

    require!(!vault.is_assigned, ErrorCode::AlreadyAssigned);

    let freelancer = ctx.accounts.freelancer.key();

    require!(
        !vault.applicants.iter().any(|a| a.freelancer == freelancer),
        ErrorCode::AlreadyApplied
    );

    // 🔥 transferencia
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: freelancer_info,
                to: vault_info,
            },
        ),
        commitment,
    )?;

    vault.applicants.push(Applicant {
        freelancer,
        commitment,
        refunded: false,
    });

    Ok(())
}

    // =========================
    // SELECT
    // =========================
    pub fn select_freelancer(ctx: Context<SelectFreelancer>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(
            ctx.accounts.client.key() == vault.client,
            ErrorCode::Unauthorized
        );

        require!(!vault.is_assigned, ErrorCode::AlreadyAssigned);

        let selected = ctx.accounts.freelancer.key();

        require!(
            vault.applicants.iter().any(|a| a.freelancer == selected),
            ErrorCode::NotApplicant
        );

        vault.freelancer = selected;
        vault.is_assigned = true;

        Ok(())
    }

    // =========================
    // CLAIM REFUND
    // =========================
    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {

    // 🔥 primero account_info
    let vault_info = ctx.accounts.vault.to_account_info();
    let freelancer_info = ctx.accounts.freelancer.to_account_info();

    // 🔥 luego mutable
    let vault = &mut ctx.accounts.vault;

    let freelancer = ctx.accounts.freelancer.key();

    let applicant = vault
        .applicants
        .iter_mut()
        .find(|a| a.freelancer == freelancer)
        .ok_or(ErrorCode::NotApplicant)?;

    require!(!applicant.refunded, ErrorCode::AlreadyRefunded);

    let amount = applicant.commitment;

    **vault_info.try_borrow_mut_lamports()? -= amount;
    **freelancer_info.try_borrow_mut_lamports()? += amount;

    applicant.refunded = true;

    Ok(())
}

    // =========================
    // RELEASE
    // =========================
    pub fn release(ctx: Context<Release>) -> Result<()> {

    // 🔥 PRIMERO sacas account_info
    let vault_info = ctx.accounts.vault.to_account_info();
    let freelancer_info = ctx.accounts.freelancer.to_account_info();

    // 🔥 LUEGO haces mutable borrow
    let vault = &mut ctx.accounts.vault;

    require!(vault.is_assigned, ErrorCode::NotAssigned);
    require!(!vault.is_released, ErrorCode::AlreadyReleased);

    require!(
        ctx.accounts.freelancer.key() == vault.freelancer,
        ErrorCode::Unauthorized
    );

    let amount = vault.amount;

    // 🔥 transferencia segura
    **vault_info.try_borrow_mut_lamports()? -= amount;
    **freelancer_info.try_borrow_mut_lamports()? += amount;

    vault.is_released = true;

    Ok(())
}

}

// =========================
// STRUCTS
// =========================

#[account]
pub struct Vault {
    pub client: Pubkey,
    pub freelancer: Pubkey,
    pub amount: u64,
    pub is_assigned: bool,
    pub is_released: bool,
    pub applicants: Vec<Applicant>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Applicant {
    pub freelancer: Pubkey,
    pub commitment: u64,
    pub refunded: bool,
}

// =========================
// ACCOUNTS
// =========================

#[derive(Accounts)]
pub struct CreateProject<'info> {
    #[account(
    init,
    payer = client,
    seeds = [b"vault", client.key().as_ref()],
    bump,
    space = 8 + 32 + 32 + 8 + 1 + 1 + (4 + 1000)
)]
pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Apply<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub freelancer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SelectFreelancer<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub client: Signer<'info>,

    /// CHECK:
    pub freelancer: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub freelancer: Signer<'info>,
}

#[derive(Accounts)]
pub struct Release<'info> {
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    /// CHECK:
    #[account(mut)]
    pub freelancer: AccountInfo<'info>,
}

// =========================
// ERRORES
// =========================

#[error_code]
pub enum ErrorCode {
    #[msg("No autorizado")]
    Unauthorized,
    #[msg("Ya liberado")]
    AlreadyReleased,
    #[msg("Monto inválido")]
    InvalidAmount,
    #[msg("Ya asignado")]
    AlreadyAssigned,
    #[msg("Ya aplicó")]
    AlreadyApplied,
    #[msg("No es aplicante")]
    NotApplicant,
    #[msg("Ya reembolsado")]
    AlreadyRefunded,
    #[msg("No asignado")]
    NotAssigned,
}