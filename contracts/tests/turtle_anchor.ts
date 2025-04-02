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
  console.log("initializer", initializer);
  // 테스트용 변수 설정
  const daoName = "test2";
  const timeLimit = 60 * 60 * 24 * 7; // 7일(초 단위)
  const baseFee = 5; // 5%
  const aiModeration = true;
  const depositShare = 50; // 50%
  
  let daoPDA: PublicKey;
  let slot: number;
  
  it("DAO를 초기화합니다", async () => {
    try {
      // DAO PDA 생성을 위한 slot 정보 가져오기
      slot = await provider.connection.getSlot();


      [daoPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("dao"), initializer.toBuffer(), Buffer.from(daoName)],
        program.programId
      );

      console.log("================================================");
      console.log("프로그램 ID:", program.programId.toString());
      console.log("지갑 주소:", initializer.toString());
      console.log("DAO PDA:", daoPDA.toString());
      console.log("Seed 구성요소:");
      console.log("- dao (string):", Buffer.from("dao").toString());
      console.log("- initializer (bytes):", initializer.toBuffer());
      console.log("- daoName (string):", daoName);
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
      console.log("트랜잭션이 확인되었습니다!");

      // DAO 상태 확인
      const daoAccount = await program.account.daoState.fetch(daoPDA);
      console.log("DAO 계정 데이터:", daoAccount);

      // 검증
      assert.equal(daoAccount.daoName, daoName);
      assert.equal(daoAccount.baseFee.toNumber(), baseFee);
      assert.equal(daoAccount.aiModeration, aiModeration);
      assert.equal(daoAccount.depositShare, depositShare);
      assert.equal(daoAccount.timeLimit.toNumber(), timeLimit);
    } catch (error) {
      console.error("에러 발생:", error);
      throw error;
    }
  });

  // it("DAO에 SOL을 예치합니다", async () => {
  //   try {
  //     const amount = new anchor.BN(0.11 * LAMPORTS_PER_SOL); // 0.1 SOL
  //     const amount2 = new anchor.BN(0.22* LAMPORTS_PER_SOL); // 0.1 SOL
      

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
  //     console.log("예치 트랜잭션이 확인되었습니다!");

  //     // 두번째 예치
  //     const tx2 = await program.methods
  //       .deposit(amount2)
  //       .accounts({
  //         depositor: initializer,
  //         dao: daoPDA,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       })
  //       .rpc();
  //     console.log("예치할 금액:",parseFloat(amount2.toString())/LAMPORTS_PER_SOL, "SOL");
  //     console.log("예치 트랜잭션:", tx2);
  //     console.log("Solana Explorer URL:", `https://explorer.solana.com/tx/${tx2}?cluster=devnet`);

  //     // 트랜잭션 확인 대기
  //     const latestBlockhash2 = await provider.connection.getLatestBlockhash();
  //     await provider.connection.confirmTransaction({
  //       signature: tx2,
  //       blockhash: latestBlockhash2.blockhash,
  //       lastValidBlockHeight: latestBlockhash2.lastValidBlockHeight
  //     });
  //     console.log("예치 트랜잭션이 확인되었습니다!");
      
  //     // DAO 상태 확인
  //     const daoAccount = await program.account.daoState.fetch(daoPDA);
  //     console.log("업데이트된 DAO 데이터:", daoAccount);
      
  //     // 검증
  //     // assert.equal(daoAccount.totalDeposit.toNumber(), amount.toNumber());
  //     console.log("total deposit amount", daoAccount.totalDeposit.toNumber()/LAMPORTS_PER_SOL, "SOL");
  //     const depositor = daoAccount.depositors[0];
  //     assert.equal(depositor.depositor.toString(), initializer.toString());
  //     // assert.equal(depositor.amount.toNumber(), amount.toNumber());
  //   } catch (error) {
  //     console.error("예치 중 에러 발생:", error);
  //     throw error;
  //   }
  // });

  // it("컨텐츠를 제출합니다", async () => {
  //   try {
  //     const contentText = "0402 테스트 컨텐츠!";
  //     const imageUri = "https://ipfs.io/ipfs/QmcftY21NKeeeJHFW1W27vN7xAmegTzvezk7K5unkFuDpP";

  //     const tx = await program.methods
  //       .submitContent(contentText, imageUri)
  //       .accounts({
  //         author: initializer,
  //         dao: daoPDA,
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
  //     console.log("컨텐츠 제출 후 DAO 데이터:", daoAccount.contents);
      
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
});
