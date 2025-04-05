import Image from 'next/image';

export default function GlobalFooter() {
	return (
		<footer className="w-full py-12 bg-white rounded-b-3xl text-purple-black relative z-10">
			<div className="max-w-6xl mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-white/20">
					<div className="flex flex-col md:flex-row items-center gap-2 space-x-3 mb-6 md:mb-0">
						<a href="/" className="flex gap-2 items-center">
							<div className="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center">
								<Image src="/images/kasoro_logo.png" alt="Kasoro Logo" width={30} height={30} />
							</div>
							<h4 className="font-[bazzi] font-bold text-xl">KASORO</h4>
						</a>
						<p className="text-sm">First CommuniFi on Solana</p>
					</div>

					<div className="flex space-x-8">
						<a
							href="#"
							className="text-purple-black hover:text-pink-light transition-all hover:scale-105 duration-300 flex items-center gap-2"
						>
							<span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">𝕏</span>
							<span>Twitter</span>
						</a>
						<a
							href="#"
							className="text-purple-black hover:text-pink-light transition-all hover:scale-105 duration-300 flex items-center gap-2"
						>
							<span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">📱</span>
							<span>Telegram</span>
						</a>
						<a
							href="#"
							className="text-purple-black hover:text-pink-light transition-all hover:scale-105 duration-300 flex items-center gap-2"
						>
							<span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">🐙</span>
							<span>GitHub</span>
						</a>
					</div>
				</div>

				<div className="flex flex-col md:flex-row justify-between items-center">
					<p className="text-sm mb-4 md:mb-0">© 2025 Kasoro. All rights reserved.</p>
					<div className="flex space-x-6">
						<a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
							Terms
						</a>
						<a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
							Privacy
						</a>
						<a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
							Contact
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
