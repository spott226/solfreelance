use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("4ZQboCKFb5sJHkzNhQ48VTmo2Zt2zTaJWuMw2aENuo66");

#[program]
pub mod vault {
    use super::*;

    pub fn create_project(
        ctx: Context<CreateProject>,
        amount: u64,
        timestamp: i64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let vault_info = ctx.accounts.vault.to_account_info();
        let client_info = ctx.accounts.client.to_account_info();

        let vault = &mut ctx.accounts.vault;

        vault.client = ctx.accounts.client.key();
        vault.freelancer = Pubkey::default();
        vault.amount = amount;
        vault.is_assigned = false;
        vault.is_released = false;
        vault.applicants = Vec::new();
        vault.timestamp = timestamp;

        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: client_info,
                    to: vault_info,
                },
            ),
            amount,
        )?;

        Ok(())
    }

    pub fn apply(ctx: Context<Apply>, commitment: u64) -> Result<()> {
        require!(commitment > 0, ErrorCode::InvalidAmount);

        let vault_info = ctx.accounts.vault.to_account_info();
        let freelancer_info = ctx.accounts.freelancer.to_account_info();

        let vault = &mut ctx.accounts.vault;

        require!(!vault.is_assigned, ErrorCode::AlreadyAssigned);

        let freelancer = ctx.accounts.freelancer.key();

        require!(
            !vault.applicants.iter().any(|a| a.freelancer == freelancer),
            ErrorCode::AlreadyApplied
        );

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

    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        let vault_info = ctx.accounts.vault.to_account_info();
        let freelancer_info = ctx.accounts.freelancer.to_account_info();

        let vault = &mut ctx.accounts.vault;

        let freelancer = ctx.accounts.freelancer.key();

        require!(freelancer != vault.freelancer, ErrorCode::Unauthorized);

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

    pub fn release(ctx: Context<Release>) -> Result<()> {
        let vault_info = ctx.accounts.vault.to_account_info();
        let freelancer_info = ctx.accounts.freelancer.to_account_info();

        let vault = &mut ctx.accounts.vault;

        require!(!vault.is_released, ErrorCode::AlreadyReleased);

        require!(
            ctx.accounts.client.key() == vault.client,
            ErrorCode::Unauthorized
        );

        require!(vault.is_assigned, ErrorCode::NotAssigned);

        let amount = vault.amount;

        // 🔥 FIX (único cambio)
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
    pub is_assigned: bool,
    pub is_released: bool,
    pub applicants: Vec<Applicant>,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Applicant {
    pub freelancer: Pubkey,
    pub commitment: u64,
    pub refunded: bool,
}

#[derive(Accounts)]
#[instruction(amount: u64, timestamp: i64)]
pub struct CreateProject<'info> {
    #[account(
        init,
        payer = client,
        seeds = [
            b"vault",
            client.key().as_ref(),
            &timestamp.to_le_bytes()
        ],
        bump,
        space = 8 + 32 + 32 + 8 + 1 + 1 + (4 + 1000) + 8
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
    #[account(
        mut,
        seeds = [
            b"vault",
            vault.client.as_ref(),
            &vault.timestamp.to_le_bytes()
        ],
        bump
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK:
    #[account(mut)]
    pub freelancer: AccountInfo<'info>,

    pub client: Signer<'info>,

    pub system_program: Program<'info, System>,
}

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