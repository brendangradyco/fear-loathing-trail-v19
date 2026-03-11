interface WinScreenProps {
	onRestart: () => void;
}

function WinIllustration() {
	return (
		<svg
			viewBox="0 0 200 120"
			className="mx-auto mb-4 block w-[220px]"
			preserveAspectRatio="xMidYMid meet"
		>
			{/* Tropical night sky */}
			<rect width="200" height="120" fill="#0a1a0a" />

			{/* Stars */}
			{[
				[15, 8],
				[40, 14],
				[75, 6],
				[110, 12],
				[145, 8],
				[175, 16],
				[30, 24],
				[90, 18],
				[160, 10],
				[55, 30],
				[130, 22],
			].map(([x, y]) => (
				<rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill="#fff" opacity="0.5" />
			))}

			{/* Moon */}
			<circle cx="170" cy="20" r="10" fill="#ffffcc" opacity="0.6" />
			<circle cx="173" cy="17" r="9" fill="#0a1a0a" />

			{/* Colombian mountains / skyline background */}
			<polygon points="0,75 25,50 45,60 65,42 85,55 110,38 135,52 160,40 180,50 200,45 200,75" fill="#1a2a1a" />

			{/* City lights in the valley */}
			{[
				[20, 70],
				[35, 68],
				[50, 71],
				[65, 67],
				[80, 70],
				[95, 66],
				[110, 69],
				[125, 68],
				[140, 70],
				[155, 67],
				[170, 69],
			].map(([x, y]) => (
				<rect
					key={x}
					x={x}
					y={y}
					width="3"
					height="5"
					fill="#ffee44"
					opacity="0.5"
				/>
			))}

			{/* Ground */}
			<rect x="0" y="75" width="200" height="45" fill="#0a1a0a" />

			{/* Road */}
			<rect x="0" y="88" width="200" height="9" fill="#223322" />

			{/* Road markings */}
			{[20, 60, 100, 140, 180].map((x) => (
				<rect key={x} x={x} y="92" width="12" height="2" fill="#ffee44" opacity="0.25" />
			))}

			{/* The Great Red Shark arriving */}
			<rect x="68" y="81" width="30" height="10" rx="2" fill="#cc2200" />
			<rect x="74" y="78" width="14" height="6" rx="1" fill="#aa1a00" />
			{/* Headlights */}
			<rect x="67" y="83" width="2" height="3" fill="#ffffaa" />

			{/* Tropical palms */}
			<rect x="145" y="60" width="2" height="20" fill="#2a4a2a" />
			<ellipse cx="146" cy="58" rx="8" ry="5" fill="#2a5a2a" opacity="0.8" />
			<rect x="165" y="65" width="2" height="16" fill="#2a4a2a" />
			<ellipse cx="166" cy="63" rx="6" ry="4" fill="#2a5a2a" opacity="0.8" />

			{/* Colombia welcome sign */}
			<rect x="10" y="68" width="2" height="18" fill="#555" />
			<rect x="4" y="63" width="22" height="11" fill="#cc4400" />
			<rect x="7" y="65" width="16" height="2" fill="#ffee44" opacity="0.7" />
			<rect x="7" y="69" width="12" height="1" fill="#ffee44" opacity="0.4" />

			{/* Trophy */}
			<g transform="translate(100, 108)">
				<rect x="-6" y="0" width="12" height="3" fill="#ffcc00" />
				<rect x="-4" y="-6" width="8" height="7" rx="1" fill="#ffcc00" />
				<rect x="-8" y="-4" width="4" height="3" rx="1" fill="#ffcc00" />
				<rect x="4" y="-4" width="4" height="3" rx="1" fill="#ffcc00" />
				<rect x="-2" y="-3" width="4" height="3" fill="#cc9900" />
			</g>
		</svg>
	);
}

export default function WinScreen({ onRestart }: WinScreenProps) {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center gap-3 bg-bg p-8 safe-top">
			<WinIllustration />
			<h1 className="text-center text-[28px] font-bold text-yellow">BOGOTA!</h1>
			<p className="max-w-[300px] text-center text-[13px] leading-relaxed text-dim">
				You made it to Colombia. The bats followed the whole way.
			</p>
			<button
				type="button"
				onClick={onRestart}
				className="mt-2 w-[200px] rounded-lg bg-orange p-3.5 text-base font-bold text-black active:opacity-75"
			>
				Play Again
			</button>
		</div>
	);
}
