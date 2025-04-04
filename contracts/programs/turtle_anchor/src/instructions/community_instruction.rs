use anchor_lang::prelude::*;
use crate::states::basefee_vault::BasefeeVault;
use crate::states::community_dao::CommunityState;

#[derive(Accounts)]
#[instruction(community_name: String)] // 여기에 파라미터 추가
pub struct InitializeCommunity<'info> {

    #[account(mut)]
    pub initializer: Signer<'info>,

    #[account(
        init,
        payer = initializer,
        space = 8 + CommunityState::INIT_SPACE,
        seeds = [
            b"community",
            initializer.key().as_ref(),
            community_name.as_bytes() // 단순히 DAO 이름을 시드로 사용
        ],
        bump
    )]
    pub community: Account<'info, CommunityState>,

    #[account(
        init,
        payer = initializer,
        space = 8 + BasefeeVault::INIT_SPACE,
        seeds = [
            b"vault",
            initializer.key().as_ref(),
            community_name.as_bytes() // 단순히 DAO 이름을 시드로 사용
        ],
        bump
    )]
    pub vault: Account<'info, BasefeeVault>,
    
    pub system_program: Program<'info, System>,
}


pub fn initialize_community(
    ctx: Context<InitializeCommunity>,
    community_name: String,
    time_limit: u64,
    base_fee: u64,
    fee_multiplier: u8,
    lst_addr: Pubkey,
    ai_moderation: bool,
) -> Result<()> {
    let community = &mut ctx.accounts.community;
    community.community_name = community_name;
    community.time_limit = time_limit;
    community.init_base_fee = base_fee;
    community.fee_multiplier = fee_multiplier;
    community.ai_moderation = ai_moderation;
    community.voted = 0_f32;
    community.vote_period = 0;
    community.active = true;

    Ok(())
}