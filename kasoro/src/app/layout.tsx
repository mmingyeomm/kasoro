import type { Metadata } from 'next';
import { SolanaWalletProvider } from '@/components/wallet/SolanaWalletProvider';
import '@/styles/globals.css';
import GlobalHeader from '@/components/global/GlobalHeader';
import GlobalFooter from '@/components/global/GlobalFooter';
import { Quicksand } from 'next/font/google';

export const metadata: Metadata = {
	title: 'Kasoro | First CommuniFi on Solana',
	description: 'The cutest community-driven platform for content creators and community builders on Solana',
};

const quicksand = Quicksand({
	weight: ['300', '400', '500', '600', '700'],
	variable: '--font-quicksand',
	subsets: ['latin'],
	display: 'swap',
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${quicksand.variable} antialiased`}>
				<SolanaWalletProvider>
					<GlobalHeader />
					<div className="min-h-screen flex flex-col">
						{children}
						<GlobalFooter />
					</div>
				</SolanaWalletProvider>
			</body>
		</html>
	);
}
