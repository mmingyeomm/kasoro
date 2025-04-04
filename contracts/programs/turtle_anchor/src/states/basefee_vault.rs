use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct BasefeeVault {
    #[max_len(1000)]
    pub ratio: Vec<DepositersInfo>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct DepositersInfo {
    pub deposit_address: Pubkey,
    pub bounty_amount: f32,
}