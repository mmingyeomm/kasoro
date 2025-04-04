pub mod instructions;
pub mod states;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;

declare_id!("38cVbT7EHqPwfXR1VgXA5jJiBe3DSAFr6cdCEPx4fbAv");

pub const MASTER_WALLET: &str = "wPrpTY68NWWQQqJbiHaiYNPMk2QRtgWBb3tmEj5nfxY";

////////////////////////////////////////////////////////////////////////////////////////
// 계정 크기 제한(10KB)으로 인해 구조체 크기 축소
// 1. depositors, contents, vote_proposals 벡터 크기 대폭 축소
// 2. 텍스트 필드 길이 제한
// 3. 대용량 데이터는 오프체인(DB)에 저장하고 해시나 참조만 온체인에 저장 권장
//
// 추가할 것:
// 1. 투표 시 vote_count 증가
// 2. daostate의 is_active 변경하는 함수 권한 -> 마스터 지갑으로 변경(완료)
// 3. 1등에게 상금 분배 함수 추가
//     - 백엔드에서 시간 종료 알림 받으면 마지막 사용자에게 상금 분배
// 4. deposit 기능이랑 submit_content 기능 합치기
////////////////////////////////////////////////////////////////////////////////////////

#[program]
pub mod turtle_anchor {
    use super::*;

    pub fn initialize_dao(
        ctx: Context<InitializeDao>,
        dao_name: String,
        time_limit: u64,
        base_fee: u64,
        ai_moderation: bool,
        deposit_share: u8,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.dao_name = dao_name;
        dao.initializer = ctx.accounts.initializer.key();
        dao.time_limit = time_limit;
        dao.base_fee = base_fee;
        dao.ai_moderation = ai_moderation;
        dao.deposit_share = deposit_share;
        dao.timeout_timestamp = Clock::get()?.unix_timestamp as u64 + time_limit;
        dao.total_deposit = 0;
        dao.next_proposal_id = 0;
        dao.is_active = true;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let depositor = &ctx.accounts.depositor;
        let current_time = Clock::get()?.unix_timestamp as u64;

        // DAO가 활성화되어 있는지 확인
        require!(ctx.accounts.dao.is_active, ErrorCode::DaoNotActive);

        let time_limit = ctx.accounts.dao.time_limit;

        // Transfer SOL
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: depositor.to_account_info(),
                to: ctx.accounts.dao.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        let dao = &mut ctx.accounts.dao;

        // Update depositor info
        let depositor_info = DepositorInfo {
            depositor: depositor.key(),
            amount,
            timestamp: current_time,
            locked_until: current_time + time_limit,
        };
        dao.depositors.push(depositor_info);
        dao.total_deposit += amount;

        Ok(())
    }

    pub fn submit_content(
        ctx: Context<SubmitContent>,
        text: String,
        image_uri: String,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let author = &ctx.accounts.author;
        let current_time = Clock::get()?.unix_timestamp as u64;

        // DAO가 활성화되어 있는지 확인
        require!(dao.is_active, ErrorCode::DaoNotActive);

        // Verify author is a depositor
        if !dao.depositors.iter().any(|d| d.depositor == author.key()) {
            return err!(ErrorCode::NotADepositor);
        }

        // 문자열 길이 제한 검증
        require!(text.len() <= 64, ErrorCode::TextTooLong);
        require!(image_uri.len() <= 64, ErrorCode::ImageUriTooLong);

        // 0.1 SOL을 challenge_amount로 설정
        let challenge_amount: u64 = 100000000; // 0.1 SOL (lamports)

        // Transfer SOL from author to DAO account
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: author.to_account_info(),
                to: dao.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, challenge_amount)?;

        // Create new content
        let content = Content {
            author: author.key(),
            text,
            image_uri,
            timestamp: current_time,
            vote_count: 0,
            challenge_amount,
        };

        // Add content and reset timeout
        dao.contents.push(content);
        dao.timeout_timestamp = current_time + dao.time_limit;

        Ok(())
    }

    pub fn create_vote(
        ctx: Context<CreateVote>,
        title: String,
        description: String,
        vote_type: VoteType,
        options: Vec<String>,
        voting_period: u64,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let proposer = &ctx.accounts.proposer;
        let current_time = Clock::get()?.unix_timestamp as u64;

        // DAO가 활성화되어 있는지 확인
        require!(dao.is_active, ErrorCode::DaoNotActive);

        // Verify proposer is a depositor
        if !dao.depositors.iter().any(|d| d.depositor == proposer.key()) {
            return err!(ErrorCode::NotADepositor);
        }

        // Validate voting period (minimum 1 week)
        const ONE_WEEK: u64 = 7 * 24 * 60 * 60;
        require!(voting_period >= ONE_WEEK, ErrorCode::InvalidVotingPeriod);

        // Create new vote proposal
        let proposal = VoteProposal {
            proposal_id: dao.next_proposal_id,
            proposer: proposer.key(),
            title,
            description,
            vote_type,
            options,
            start_time: current_time,
            end_time: current_time + voting_period,
            votes: Vec::new(),
            status: VoteStatus::Active,
        };

        dao.vote_proposals.push(proposal);
        dao.next_proposal_id += 1;

        Ok(())
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        proposal_id: u64,
        option_index: u8,
    ) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let voter = &ctx.accounts.voter;
        let current_time = Clock::get()?.unix_timestamp as u64;

        // DAO가 활성화되어 있는지 확인
        require!(dao.is_active, ErrorCode::DaoNotActive);

        // Find voter's deposit amount
        let voting_power = dao.depositors
            .iter()
            .find(|d| d.depositor == voter.key())
            .map(|d| d.amount)
            .ok_or(ErrorCode::NotADepositor)?;

        // Find and update the proposal
        let proposal = dao.vote_proposals
            .iter_mut()
            .find(|p| p.proposal_id == proposal_id)
            .ok_or(ErrorCode::ProposalNotFound)?;

        // Validate proposal state
        require!(proposal.status == VoteStatus::Active, ErrorCode::ProposalNotActive);
        require!(current_time <= proposal.end_time, ErrorCode::VotingPeriodEnded);
        require!(
            (option_index as usize) < proposal.options.len(),
            ErrorCode::InvalidOptionIndex
        );

        // Check if voter already voted
        require!(
            !proposal.votes.iter().any(|v| v.voter == voter.key()),
            ErrorCode::AlreadyVoted
        );

        // Add vote
        proposal.votes.push(VoteInfo {
            voter: voter.key(),
            option_index,
            voting_power,
        });

        Ok(())
    }

    pub fn process_timeout(ctx: Context<ProcessTimeout>) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        let current_time = Clock::get()?.unix_timestamp as u64;

        // Verify timeout has occurred
        require!(
            current_time >= dao.timeout_timestamp,
            ErrorCode::TimeoutNotReached
        );

        // Process completed votes
        // 투표 결과를 저장할 변수들
        let mut time_limit_change: Option<u64> = None;
        let mut base_fee_change: Option<u64> = None;
        let mut ai_moderation_change: Option<bool> = None;

        for proposal in dao.vote_proposals.iter_mut() {
            if proposal.status == VoteStatus::Active && current_time > proposal.end_time {
                proposal.status = VoteStatus::Completed;

                // Count votes
                let mut option_votes = vec![0u64; proposal.options.len()];
                let mut total_votes = 0u64;

                for vote in &proposal.votes {
                    option_votes[vote.option_index as usize] += vote.voting_power;
                    total_votes += vote.voting_power;
                }

                if total_votes > 0 {
                    // Find winning option
                    let mut winning_index = 0;
                    let mut highest_votes = 0u64;

                    for (i, &votes) in option_votes.iter().enumerate() {
                        if votes > highest_votes {
                            highest_votes = votes;
                            winning_index = i;
                        }
                    }

                    // 결과를 즉시 적용하지 않고 변경 사항을 저장
                    match proposal.vote_type {
                        VoteType::ChangeTimeLimit => {
                            if let Ok(new_time) = proposal.options[winning_index].parse::<u64>() {
                                time_limit_change = Some(new_time);
                            }
                        }
                        VoteType::ChangeBaseFee => {
                            if let Ok(new_fee) = proposal.options[winning_index].parse::<u64>() {
                                if new_fee <= 100 {
                                    base_fee_change = Some(new_fee);
                                }
                            }
                        }
                        VoteType::ChangeAiModeration => {
                            ai_moderation_change = Some(proposal.options[winning_index].to_lowercase() == "on");
                        }
                        VoteType::ContentQualityRating => {
                            // Content quality votes are handled separately
                        }
                    }
                    proposal.status = VoteStatus::Executed;
                }
            }
        }

        // 저장된 변경 사항 적용
        if let Some(new_time) = time_limit_change {
            dao.time_limit = new_time;
        }
        if let Some(new_fee) = base_fee_change {
            dao.base_fee = new_fee;
        }
        if let Some(new_ai_moderation) = ai_moderation_change {
            dao.ai_moderation = new_ai_moderation;
        }

        // Find best content and distribute rewards
        let mut best_content_index = None;
        let mut best_vote_count = 0;

        for (i, content) in dao.contents.iter().enumerate() {
            if content.vote_count > best_vote_count {
                best_vote_count = content.vote_count;
                best_content_index = Some(i);
            }
        }

        if let Some(best_index) = best_content_index {
            let _winner = dao.contents[best_index].author;

            // Calculate rewards
            let base_fee_amount = dao.total_deposit * (dao.base_fee as u64) / 100;
            let _quality_share = base_fee_amount * (dao.deposit_share as u64) / 100;

            // Reset DAO state
            dao.timeout_timestamp = current_time + dao.time_limit;
            dao.total_deposit = 0;
            dao.contents.clear();

            // Reset depositor amounts
            for depositor in dao.depositors.iter_mut() {
                depositor.amount = 0;
            }
        } else {
            // Reset timeout if no content was submitted
            dao.timeout_timestamp = current_time + dao.time_limit;
        }

        Ok(())
    }

    pub fn toggle_dao_state(ctx: Context<ToggleDaoState>) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.is_active = !dao.is_active;
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum VoteType {
    ChangeTimeLimit,
    ChangeBaseFee,
    ChangeAiModeration,
    ContentQualityRating,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum VoteStatus {
    Active,
    Completed,
    Executed,
}

#[account]
#[derive(InitSpace)]
pub struct DaoState {
    #[max_len(32)]
    pub dao_name: String,
    pub initializer: Pubkey,
    pub time_limit: u64,
    pub base_fee: u64,
    pub ai_moderation: bool,
    pub deposit_share: u8,
    pub timeout_timestamp: u64,
    pub total_deposit: u64,

    #[max_len(5, 32)]
    pub depositors: Vec<DepositorInfo>,

    #[max_len(5, 32)]
    pub contents: Vec<Content>,

    #[max_len(3, 16)]
    pub vote_proposals: Vec<VoteProposal>,

    pub next_proposal_id: u64,
    pub is_active: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct DepositorInfo {
    pub depositor: Pubkey,
    pub amount: u64,
    pub timestamp: u64,
    pub locked_until: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Content {
    pub author: Pubkey,
    #[max_len(32)]
    pub text: String,
    #[max_len(32)]
    pub image_uri: String,
    pub timestamp: u64,
    pub vote_count: u64,
    pub challenge_amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct VoteInfo {
    pub voter: Pubkey,
    pub option_index: u8,
    pub voting_power: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct VoteProposal {
    pub proposal_id: u64,
    pub proposer: Pubkey,

    #[max_len(16)]
    pub title: String,

    #[max_len(32)]
    pub description: String,
    pub vote_type: VoteType,
    #[max_len(3, 8)]
    pub options: Vec<String>,
    pub start_time: u64,
    pub end_time: u64,
    #[max_len(5)]
    pub votes: Vec<VoteInfo>,
    pub status: VoteStatus,
}


#[derive(Accounts)]
#[instruction(dao_name: String)] // 여기에 파라미터 추가
pub struct InitializeDao<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(
        init,
        payer = initializer,
        space = 8 + DaoState::INIT_SPACE,
        seeds = [
            b"dao",
            initializer.key().as_ref(),
            dao_name.as_bytes() // 단순히 DAO 이름을 시드로 사용
        ],
        bump
    )]
    pub dao: Account<'info, DaoState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

    #[account(mut)]
    pub dao: Account<'info, DaoState>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not a depositor")]
    NotADepositor,
    #[msg("Invalid voting period")]
    InvalidVotingPeriod,
    #[msg("Proposal not found")]
    ProposalNotFound,
    #[msg("Proposal is not active")]
    ProposalNotActive,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Invalid option index")]
    InvalidOptionIndex,
    #[msg("Already voted")]
    AlreadyVoted,
    #[msg("Timeout not reached")]
    TimeoutNotReached,
    #[msg("DAO is not active")]
    DaoNotActive,
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Text too long")]
    TextTooLong,
    #[msg("Image URI too long")]
    ImageUriTooLong,
}

#[derive(Accounts)]
pub struct SubmitContent<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(mut)]
    pub dao: Account<'info, DaoState>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateVote<'info> {
    #[account(mut)]
    pub proposer: Signer<'info>,
    #[account(mut)]
    pub dao: Account<'info, DaoState>,
}

#[derive(Accounts)]
pub struct CastVote<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(mut)]
    pub dao: Account<'info, DaoState>,
}

#[derive(Accounts)]
pub struct ProcessTimeout<'info> {
    #[account(mut)]
    pub caller: Signer<'info>,
    #[account(mut)]
    pub dao: Account<'info, DaoState>,
}

#[derive(Accounts)]
pub struct ToggleDaoState<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        constraint = authority.key().to_string() == MASTER_WALLET @ ErrorCode::UnauthorizedAccess
    )]
    pub dao: Account<'info, DaoState>,
}