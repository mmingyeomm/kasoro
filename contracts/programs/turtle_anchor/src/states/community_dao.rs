use crate::{Content, DepositorInfo, VoteProposal};
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct CommunityState {
    #[max_len(32)]
    pub community_name: String, //
    pub time_limit: u64, //
    pub init_base_fee: u64, //
    pub fee_multiplier: u8, //
    pub prize_ratio: Challengers, //---------------------
    pub voted: f32, //
    pub vote_period: u8, // day
    pub lst_addr: Pubkey,         //---------------------
    pub active : bool, //
    pub ai_moderation: bool, //

    #[max_len(5, 200)]
    pub contents: Vec<Content>, //---------------------
    pub basefee_vault: Pubkey, //---------------------
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Challengers {
    #[max_len(10)]
    pub ratio: Vec<f32>,
    #[max_len(10)]
    pub challengers: Vec<Pubkey>,
    pub len: u8,
}


