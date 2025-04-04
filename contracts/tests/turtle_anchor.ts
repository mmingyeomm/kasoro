import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TurtleAnchor } from "../target/types/turtle_anchor";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import assert from "assert";

describe("turtle_anchor", () => {
  // 테스트 환경 설정
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TurtleAnchor;
  const initializer = provider.wallet.publicKey;

  // 테스트용 변수 설정
  const daoName = "daostate space test 5";
  const timeLimit = 60 * 60 * 24 * 7; // 7일(초 단위)
  const baseFee = 5; // 5%
  const aiModeration = true;
  const depositShare = 50; // 50%
  
  /////////////////////////////////////////////////////////////////////////
  let daoPDA: PublicKey;
  [daoPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("dao"), 
        initializer.toBuffer(), 
        Buffer.from(daoName)
      ],
      program.programId
  );

  let daoPDA2: PublicKey;
  [daoPDA2] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("dao2"), 
      initializer.toBuffer(), 
      Buffer.from(daoName)
    ],
    program.programId
);
  /////////////////////////////////////////////////////////////////////////

  it("DAO를 초기화합니다", async () => {
    try {
      console.log("================================================");
      console.log("- 프로그램 ID:", program.programId.toString());
      console.log("- 사용자 주소:", initializer.toString());
      console.log("- DAO 이름:", daoName);
      console.log("- DAO PDA:", daoPDA.toString()); 
      console.log("- DAO PDA2:", daoPDA2.toString());
      console.log("================================================");

      // DAO 초기화 트랜잭션 실행
      const tx = await program.methods
        .initializeDao(
          daoName,
          new anchor.BN(timeLimit),
          new anchor.BN(baseFee),
          aiModeration,
          depositShare,
        )
        .accounts({
          initializer: initializer,
          dao: daoPDA,
          dao2: daoPDA2,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      console.log("DAO 초기화 트랜잭션:", tx);
      console.log("Solana Explorer URL:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
      
      // 트랜잭션 확인 대기
      const latestBlockhash = await provider.connection.getLatestBlockhash();
      await provider.connection.confirmTransaction({
        signature: tx,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      });
      console.log("✅ DAO Initialize 트랜잭션 confirmed!");

      // DAO 상태 확인
      const daoAccount = await program.account.daoState.fetch(daoPDA);
      console.log("📝 DAO PDA data:", daoAccount);
      
      // DAO2 상태 확인
      const dao2Account = await program.account.daoState.fetch(daoPDA2);
      console.log("📝 DAO2 PDA data:", dao2Account);

      // // 검증
      // assert.equal(daoAccount.daoName, daoName);
      // assert.equal(daoAccount.baseFee.toNumber(), baseFee);
      // assert.equal(daoAccount.aiModeration, aiModeration);
      // assert.equal(daoAccount.depositShare, depositShare);
      // assert.equal(daoAccount.timeLimit.toNumber(), timeLimit);
      
      // // DAO2 검증
      // assert.equal(dao2Account.daoName, daoName);
      // assert.equal(dao2Account.baseFee.toNumber(), baseFee);
      // assert.equal(dao2Account.aiModeration, aiModeration);
      // assert.equal(dao2Account.depositShare, depositShare);
      // assert.equal(dao2Account.timeLimit.toNumber(), timeLimit);
    } catch (error) {
      console.error("에러 발생:", error);
      throw error;
    }
  });

  // it("DAO에 SOL을 예치합니다", async () => {
  //   try {

  //     // const daoPDA = new PublicKey("AAb7vSHqmFterYG7mGXnsLb533xFs98d9bwH7DBSDdG9");

  //     const amount = new anchor.BN(0.0234 * LAMPORTS_PER_SOL); // 0.123 SOL     
  //     console.log("DAO PDA:", daoPDA.toString());
  //     console.log("initializer:", initializer.toString());
  //     const tx = await program.methods
  //       .deposit(amount)
  //       .accounts({
  //         depositor: initializer,
  //         dao: daoPDA,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();
      
  //     console.log("예치할 금액:",parseFloat(amount.toString())/LAMPORTS_PER_SOL, "SOL");
  //     console.log("예치 트랜잭션:", tx);
  //     console.log("Solana Explorer URL:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

  //     // 트랜잭션 확인 대기
  //     const latestBlockhash = await provider.connection.getLatestBlockhash();
  //     await provider.connection.confirmTransaction({
  //       signature: tx,
  //       blockhash: latestBlockhash.blockhash,
  //       lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  //     });
  //     console.log("✅예치 트랜잭션이 확인되었습니다!");      
      
  //     // DAO 상태 확인
  //     const daoAccount = await program.account.daoState.fetch(daoPDA);
  //     console.log("업데이트된 DAO 데이터:", daoAccount);
      
  //     // 검증
  //     // assert.equal(daoAccount.totalDeposit.toNumber(), amount.toNumber());
  //     console.log("total deposit amount", daoAccount.totalDeposit.toNumber()/LAMPORTS_PER_SOL, "SOL");
  //     const depositor = daoAccount.depositors[0];
  //     // assert.equal(depositor.depositor.toString(), initializer.toString());
  //     // assert.equal(depositor.amount.toNumber(), amount.toNumber());
  //   } catch (error) {
  //     console.error("예치 중 에러 발생:", error);
  //     throw error;
  //   }
  // });

  // it("컨텐츠를 제출합니다", async () => {
  //   try {
  //     const daoPDA = new PublicKey("EtZwNta6zavZEoD768NuLAvMdHZUp1tWfQpxkjv2MphY");

  //     const contentText = "afadfafaf";
  //     const imageUri = "https://apricot-selective-kangaroo-871.mypinata.cloud/ipfs/bafkreifb64ur44ufdlejl57ucowyv2jqhptgd7zotv6qfoaj4r7jqkbkau";

  //     const tx = await program.methods
  //       .submitContent(contentText, imageUri)
  //       .accounts({
  //         author: initializer,
  //         dao: daoPDA,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();
      
  //     console.log("컨텐츠 제출 트랜잭션:", tx);
  //     console.log("Solana Explorer URL:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

  //     // 트랜잭션 확인 대기
  //     const latestBlockhash = await provider.connection.getLatestBlockhash();
  //     await provider.connection.confirmTransaction({
  //       signature: tx,
  //       blockhash: latestBlockhash.blockhash,
  //       lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  //     });
  //     console.log("컨텐츠 제출 트랜잭션이 확인되었습니다!");

  //     // DAO 상태 확인
  //     const daoAccount = await program.account.daoState.fetch(daoPDA);
  //     console.log("DAO 상태:", daoAccount);
  //     console.log("컨텐츠 제출 후 DAO contents 데이터:", daoAccount.contents);
  //     console.log("컨텐츠 imageUri:", daoAccount.contents[0].imageUri);
  //     // 컨텐츠 정보 확인 및 검증
  //     // assert.equal(daoAccount.contents.length, 1);
      
  //     // const content = daoAccount.contents[0];
  //     // assert.equal(content.author.toString(), initializer.toString());
  //     // assert.equal(content.text, contentText);
  //     // assert.equal(content.imageUri, imageUri);
  //     // assert.equal(content.voteCount.toNumber(), 0);
  //   } catch (error) {
  //     console.error("컨텐츠 제출 중 에러 발생:", error);
  //     throw error;
  //   }
  // });

  // it("투표 제안을 생성합니다", async () => {
  //   try {
  //     const title = "기본 수수료 변경";
  //     const description = "기본 수수료를 5%에서 3%로 변경 제안";
  //     const voteType = { changeBaseFee: {} }; // VoteType enum
  //     const options = ["3", "5", "7"];
  //     const votingPeriod = new anchor.BN(60 * 60 * 24 * 7); // 7일(초 단위)

  //     const tx = await program.methods
  //       .createVote(title, description, voteType, options, votingPeriod)
  //       .accounts({
  //         proposer: initializer,
  //         dao: daoPDA,
  //       })
  //       .rpc();
      
  //     console.log("투표 제안 트랜잭션:", tx);
  //     console.log("Solana Explorer URL:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

  //     // 트랜잭션 확인 대기
  //     const latestBlockhash = await provider.connection.getLatestBlockhash();
  //     await provider.connection.confirmTransaction({
  //       signature: tx,
  //       blockhash: latestBlockhash.blockhash,
  //       lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  //     });
  //     console.log("투표 제안 트랜잭션이 확인되었습니다!");

  //     // DAO 상태 확인
  //     const daoAccount = await program.account.daoState.fetch(daoPDA);
  //     console.log("DAO 상태:", daoAccount);
  //     console.log("투표 제안 생성 후 DAO 데이터:", daoAccount.voteProposals);
      
  //     // 투표 제안 정보 확인
  //     assert.equal(daoAccount.voteProposals.length, 1);
      
  //     const proposal = daoAccount.voteProposals[0];
  //     assert.equal(proposal.proposer.toString(), initializer.toString());
  //     assert.equal(proposal.title, title);
  //     assert.equal(proposal.description, description);
  //     assert.deepEqual(proposal.options, options);
  //     assert.equal(proposal.votes.length, 0);
  //     assert.ok(proposal.status.active !== undefined);
  //   } catch (error) {
  //     console.error("투표 제안 생성 중 에러 발생:", error);
  //     throw error;
  //   }
  // });

  // it("투표를 진행합니다", async () => {
  //   try {
  //     const proposalId = 0;
  //     const optionIndex = 0; // 첫 번째 옵션(3%)에 투표

  //     const tx = await program.methods
  //       .castVote(new anchor.BN(proposalId), optionIndex)
  //       .accounts({
  //         voter: initializer,
  //         dao: daoPDA,
  //       })
  //       .rpc();
      
  //     console.log("투표 트랜잭션:", tx);
  //     console.log("Solana Explorer URL:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);

  //     // 트랜잭션 확인 대기
  //     const latestBlockhash = await provider.connection.getLatestBlockhash();
  //     await provider.connection.confirmTransaction({
  //       signature: tx,
  //       blockhash: latestBlockhash.blockhash,
  //       lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  //     });
  //     console.log("투표 트랜잭션이 확인되었습니다!");

  //     // DAO 상태 확인
  //     const daoAccount = await program.account.daoState.fetch(daoPDA);
  //     console.log("DAO 상태:", daoAccount);
  //     console.log("투표 후 DAO 데이터:", daoAccount.voteProposals[0].votes);
      
  //     // 투표 정보 확인
  //     const proposal = daoAccount.voteProposals[0];
  //     assert.equal(proposal.votes.length, 1);
      
  //     const vote = proposal.votes[0];
  //     assert.equal(vote.voter.toString(), initializer.toString());
  //     assert.equal(vote.optionIndex, optionIndex);
  //   } catch (error) {
  //     console.error("투표 중 에러 발생:", error);
  //     throw error;
  //   }
  // });

  // it("DAO의 활성 상태를 변경합니다", async () => {
  //   try {
  //     console.log("================================================");
  //     console.log("DAO 상태 변경 테스트 시작");
      
  //     // 상태 변경 전 DAO 상태 확인
  //     const beforeState = await program.account.daoState.fetch(daoPDA);
  //     console.log("변경 전 DAO 활성 상태:", beforeState.isActive);
  
  //     // 상태 변경 트랜잭션 실행
  //     const tx = await program.methods
  //       .toggleDaoState()
  //       .accounts({
  //         authority: initializer,
  //         dao: daoPDA,
  //       })
  //       .rpc();
      
  //     console.log("상태 변경 트랜잭션:", tx);
  //     console.log("Solana Explorer URL:", `https://explorer.solana.com/tx/${tx}?cluster=devnet`);
      
  //     // 트랜잭션 확인 대기
  //     const latestBlockhash = await provider.connection.getLatestBlockhash();
  //     await provider.connection.confirmTransaction({
  //       signature: tx,
  //       blockhash: latestBlockhash.blockhash,
  //       lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
  //     });
  //     console.log("✅ 상태 변경 트랜잭션이 확인되었습니다!");
  
  //     // 변경 후 DAO 상태 확인
  //     const afterState = await program.account.daoState.fetch(daoPDA);
  //     console.log("변경 후 DAO 활성 상태:", afterState.isActive);
  
  //     // 검증
  //     assert.equal(afterState.isActive, !beforeState.isActive, "DAO 상태가 제대로 토글되지 않았습니다");
      
  //     console.log("================================================");
  //   } catch (error) {
  //     console.error("DAO 상태 변경 중 에러 발생:", error);
  //     throw error;
  //   }
  // });


});
