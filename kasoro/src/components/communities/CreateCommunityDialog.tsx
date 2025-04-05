'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { api } from '@/api';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import axios from 'axios';
import { Connection, LAMPORTS_PER_SOL, PublicKey, clusterApiUrl } from '@solana/web3.js';

// Import from contract target types
import { Kasoro } from '../../../contract_idl/kasoro';
import kasoroIdl from '../../../contract_idl/kasoro.json';

// Placeholder for program ID - replace with actual ID from lib.rs
const PROGRAM_ID = new PublicKey('CEnBjSSjuoL13LtgDeALeAMWqSg9W7t1J5rtjeKNarAM');

interface CreateCommunityDialogProps {
	isOpen: boolean;
	onClose: () => void;
	userWalletAddress?: string | null;
}

interface CommunityResponse {
	id: string;
	name: string;
	description: string;
	createdAt: string;
	creatorId: string;
	baseFeePercentage: number;
}

export default function CreateCommunityDialog({ isOpen, onClose, userWalletAddress }: CreateCommunityDialogProps) {
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [timeLimit, setTimeLimit] = useState(30);
	const [baseFee, setBaseFee] = useState(0.1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [uploadingImage, setUploadingImage] = useState(false);
	const router = useRouter();
	const { connected, publicKey, sendTransaction } = useWallet();

	const isWalletLinked = !!userWalletAddress;

	// Handle clicking outside the dialog to close it
	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	// Add escape key support
	useEffect(() => {
		const handleEscKey = (e: KeyboardEvent) => {
			if (isOpen && e.key === 'Escape') {
				onClose();
			}
		};

		window.addEventListener('keydown', handleEscKey);
		return () => window.removeEventListener('keydown', handleEscKey);
	}, [isOpen, onClose]);

	const uploadToPinata = async (file: File): Promise<string> => {
		try {
			setUploadingImage(true);
			toast.loading('Uploading image...', { id: 'upload' });
			console.log('[이미지 업로드] 시작: ', file.name, file.size);

			const formData = new FormData();
			formData.append('file', file);

			const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY!,
					pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!,
				},
			});

			const url = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
			console.log('[이미지 업로드] 성공 - URL: ', url);
			toast.success('Image uploaded successfully!', { id: 'upload' });
			return url;
		} catch (error) {
			console.error('[이미지 업로드] 실패: ', error);
			toast.error('Failed to upload image', { id: 'upload' });
			throw new Error('Failed to upload image');
		} finally {
			setUploadingImage(false);
		}
	};

	const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				toast.error('Image size should be less than 5MB');
				return;
			}

			setImage(file);
			// 미리보기 생성
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!connected || !publicKey) {
			setError('Please connect your wallet first');
			toast.error('Please connect your wallet first');
			return;
		}

		if (!isWalletLinked) {
			setError('Please link your wallet to your account first');
			toast.error('Please link your wallet to your account first');
			return;
		}

		// Check that connected wallet matches linked wallet
		if (publicKey.toString() !== userWalletAddress) {
			setError("The connected wallet doesn't match your linked wallet");
			toast.error("The connected wallet doesn't match your linked wallet");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Upload image if one is selected
			let imageURL = null;
			if (image) {
				try {
					console.log('[커뮤니티 생성] 이미지 업로드 시작');
					imageURL = await uploadToPinata(image);
					console.log('[커뮤니티 생성] 이미지 업로드 완료 - URL:', imageURL);
				} catch (error) {
					console.error('[커뮤니티 생성] 이미지 업로드 실패:', error);
					toast.error('Failed to upload image, but continuing with community creation');
					// Continue with community creation even if image upload fails
				}
			}

			// Check if community name already exists
			try {
				const response = await api.get('/communities');
				const communities: any = response.data;
				const existingCommunity = communities.find(
					(community: any) => community.name.toLowerCase() === name.toLowerCase()
				);

				if (existingCommunity) {
					setLoading(false);
					setError(`A community with the name "${name}" already exists. Please choose a different name.`);
					toast.error(`A community with the name "${name}" already exists.`);
					return;
				}
			} catch (error) {
				console.error('Error checking community name:', error);
				// Continue with community creation if the check fails
			}
			// Create connection to the cluster
			const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
			console.log('Connection structure:', connection);
			// Create a provider from connection and wallet
			const provider = new AnchorProvider(
				connection,
				{
					publicKey,
					signTransaction: async (tx: web3.Transaction) => {
						tx.feePayer = publicKey;
						tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
						return await sendTransaction(tx, connection);
					},
				},
				{ preflightCommitment: 'processed' }
			);
			// Load program from IDL
			console.log('IDL structure:', kasoroIdl);
			console.log('Provider structure:', provider);
			console.log('publickey:', publicKey.toString());
			console.log('programId:', PROGRAM_ID.toString());
			console.log('provider:', provider.publicKey.toString());

			const program = new Program(kasoroIdl as Kasoro, provider);
			console.log('Program structure:', program.programId.toString());
			// Create a transaction to initialize community
			const transaction = new web3.Transaction();
			console.log('Transaction structure:', transaction);
			// Find PDA for community and vault
			const [communityPda] = anchor.web3.PublicKey.findProgramAddressSync(
				[Buffer.from('community'), publicKey.toBuffer(), Buffer.from(name)],
				PROGRAM_ID
			);
			console.log('Community PDA structure:', communityPda);
			const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
				[Buffer.from('vault'), publicKey.toBuffer(), Buffer.from(name)],
				PROGRAM_ID
			);
			console.log('Vault PDA structure:', vaultPda);
			// Add initialize instruction to transaction
			transaction.add(
				await program.methods
					.initialize(
						name,
						new anchor.BN(timeLimit), // Convert minutes to seconds
						new anchor.BN(baseFee * LAMPORTS_PER_SOL), // Base fee percentage
						2, // fee_multiplier (example value)
						new PublicKey('5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm'), // lst_addr (using user's public key as placeholder)
						false, // ai_moderation
						[0.4, 0.3, 0.2, 0.1]
					)
					.accounts({
						initializer: publicKey,
						community: communityPda,
						vault: vaultPda,
						systemProgram: web3.SystemProgram.programId,
					})
					.instruction()
			);

			const latestBlockhash = await connection.getLatestBlockhash();
			// Send transaction to the network
			const signature = await sendTransaction(transaction, connection);

			// Wait for confirmation

			await connection.confirmTransaction(
				{
					signature,
					blockhash: latestBlockhash.blockhash,
					lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
				},
				'confirmed'
			);

			const communityAccount = await program.account.communityState.fetch(communityPda);
			console.log('CommunityState account pubkey:', communityPda.toString());
			// console.log('vault account pubkey:', vaultPda.toString());
			// console.log('CommunityState account:', communityAccount);

			// console.log('CommunityState name:', communityAccount.communityName);
			// console.log('CommunityState timeLimit:', communityAccount.timeLimit);
			// console.log('CommunityState baseFeePercentage:', communityAccount.initBaseFee);
			// //  console.log("CommunityState fee_multiplier:", communityAccount.fee_multiplier);
			// console.log('CommunityState prize_ratio:', communityAccount.prizeRatio);
			// console.log('CommunityState active:', communityAccount.active);
			// console.log('CommunityState lstAddr:', communityAccount.lstAddr.toString());
			// console.log('CommunityState basefee_vault:', communityAccount.basefeeVault.toString());
			//  console.log("CommunityState aiModeration:", communityAccount.ai_moderation);

			// Call the backend API to register the community in the database
			const requestBody = {
				name,
				description,
				timeLimit,
				baseFeePercentage: baseFee,
				walletAddress: publicKey.toString(),
				imageURL: imageURL,
			};
			console.log('[커뮤니티 생성] API 요청 데이터:', requestBody);

			const { data } = await api.post<CommunityResponse>('/communities', requestBody);

			console.log('[커뮤니티 생성] API 응답 데이터:', data);
			console.log('[커뮤니티 생성] 이미지 URL 확인:', imageURL);

			// Reset form
			setName('');
			setDescription('');
			setTimeLimit(30);
			setBaseFee(0.1);
			setImage(null);
			setImagePreview(null);

			toast.success('Community created successfully!');
			onClose();

			// Navigate to the new community
			router.push(`/communities/${data.id}`);
		} catch (error) {
			console.error('Error creating community:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to create community';
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	}

	return !isOpen ? null : (
		<div
			className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-8 animate-fadeIn"
			onClick={handleBackdropClick}
		>
			<div className="relative w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
				<div className="bg-white dark:bg-gray-800 rounded-xl border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] p-6 shadow-2xl transform transition-all duration-300 animate-scaleIn max-h-[90vh] overflow-y-auto">
					<div className="absolute top-2 right-2">
						<button
							type="button"
							onClick={onClose}
							className="bg-[#FF69B4] text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#FF1493] transition-all duration-300 shadow-lg transform hover:scale-110 hover:rotate-90"
							title="Close dialog"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<h2 className="text-3xl font-extrabold tracking-wider mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-[#FF69B4] to-purple-500 dark:from-[#FF1493] dark:to-purple-400 uppercase">
						Create a Dank Meme Community
					</h2>

					{error && (
						<div className="bg-red-100 dark:bg-red-900/30 border-4 border-dashed border-red-400 dark:border-red-600 p-4 rounded-xl mb-6 text-red-800 dark:text-red-200 font-bold">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="space-y-8">
							<div>
								<label
									htmlFor="name"
									className="block text-lg font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-2 uppercase"
								>
									Community Name
								</label>
								<input
									type="text"
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="e.g. Doge Lovers"
									required
									className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 
									border-3 border-dashed border-[#FF69B4] dark:border-[#FF1493] 
									focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF69B4] 
									text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 
									font-medium transform hover:scale-[1.01] transition-all"
								/>
							</div>

							<div>
								<label
									htmlFor="description"
									className="block text-lg font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-2 uppercase"
								>
									Meme Description
								</label>
								<textarea
									id="description"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Describe your meme community vibes..."
									rows={3}
									className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 
									border-3 border-dashed border-[#FF69B4] dark:border-[#FF1493] 
									focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF69B4] 
									text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 
									font-medium transform hover:scale-[1.01] transition-all"
								></textarea>
							</div>

							<div className="grid grid-cols-2 gap-6">
								<div>
									<label
										htmlFor="timeLimit"
										className="block text-lg font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-2 uppercase"
									>
										Time Limit (minutes)
									</label>
									<div className="relative mt-1">
										<input
											type="number"
											id="timeLimit"
											value={timeLimit}
											onChange={(e) => setTimeLimit(Number(e.target.value))}
											min="1"
											max="1440"
											required
											className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 
											border-3 border-dashed border-[#FF69B4] dark:border-[#FF1493] 
											focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF69B4] 
											text-gray-700 dark:text-gray-200 
											font-medium transform hover:scale-[1.01] transition-all text-center"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="baseFee"
										className="block text-lg font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-2 uppercase"
									>
										Base Fee (SOL)
									</label>
									<div className="relative mt-1">
										<input
											type="number"
											id="baseFee"
											value={baseFee}
											onChange={(e) => setBaseFee(Number(e.target.value))}
											min="0"
											step="0.01"
											required
											className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 
											border-3 border-dashed border-[#FF69B4] dark:border-[#FF1493] 
											focus:border-[#FF1493] focus:outline-none focus:ring-2 focus:ring-[#FF69B4] 
											text-gray-700 dark:text-gray-200 
											font-medium transform hover:scale-[1.01] transition-all text-center"
										/>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-lg font-extrabold text-[#FF69B4] dark:text-[#FF69B4] mb-2 uppercase">
									Meme Profile Image (Optional)
								</label>
								<div className="flex justify-center">
									<label
										htmlFor="image"
										className="cursor-pointer flex flex-col items-center justify-center w-40 h-40 border-4 border-dashed border-[#FF69B4] dark:border-[#FF1493] rounded-2xl overflow-hidden bg-pink-50 dark:bg-gray-700 hover:bg-pink-100 dark:hover:bg-gray-600 transition-colors transform hover:scale-105"
									>
										{imagePreview ? (
											<img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
										) : (
											<div className="flex flex-col items-center justify-center p-4">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-12 w-12 text-[#FF69B4] dark:text-[#FF1493] mb-2"
													viewBox="0 0 20 20"
													fill="currentColor"
												>
													<path
														fillRule="evenodd"
														d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
														clipRule="evenodd"
													/>
												</svg>
												<span className="text-base font-bold text-[#FF69B4] dark:text-[#FF1493]">
													{uploadingImage ? 'Uploading...' : 'Upload Meme Pic'}
												</span>
											</div>
										)}
										<input
											type="file"
											id="image"
											accept=".jpg,.jpeg,.png,.gif"
											onChange={handleImageChange}
											disabled={uploadingImage}
											className="hidden"
										/>
									</label>
								</div>
								{imagePreview && (
									<div className="relative mt-4 flex justify-center">
										<button
											type="button"
											onClick={() => {
												setImage(null);
												setImagePreview(null);
											}}
											className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all border-2 border-white dark:border-gray-700 font-bold"
										>
											Remove Image
										</button>
									</div>
								)}
							</div>
						</div>

						{!connected && (
							<div className="bg-yellow-100 dark:bg-yellow-900/30 border-4 border-dashed border-yellow-400 dark:border-yellow-600 p-4 rounded-xl text-yellow-800 dark:text-yellow-300 font-bold text-center">
								Connect your wallet to create a dank meme community!
							</div>
						)}

						{connected && !isWalletLinked && (
							<div className="bg-yellow-100 dark:bg-yellow-900/30 border-4 border-dashed border-yellow-400 dark:border-yellow-600 p-4 rounded-xl text-yellow-800 dark:text-yellow-300 font-bold text-center">
								Link your wallet to your account first!
							</div>
						)}

						<div className="flex justify-center gap-6 mt-8">
							<button
								type="button"
								onClick={onClose}
								className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold border-4 border-dashed border-gray-400 dark:border-gray-500 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 uppercase tracking-wider text-lg shadow-md"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading || !name.trim() || !connected || !isWalletLinked}
								className="px-6 py-3 bg-gradient-to-r from-[#FF69B4] to-[#FF1493] hover:from-[#FF1493] hover:to-[#FF69B4] text-white font-extrabold border-4 border-dashed border-white dark:border-gray-700 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 uppercase tracking-wider text-lg shadow-md"
							>
								{loading ? 'Creating...' : '🚀 Create Community 🚀'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
