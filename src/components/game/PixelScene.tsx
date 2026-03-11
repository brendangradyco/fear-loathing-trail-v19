/**
 * Pixel art scene illustrations for game events and locations.
 * Metal Slug X inspired — chunky pixel sprites rendered as SVG for crispness at any scale.
 */

const SCENE_COLORS = {
	sky: "#0d0d1a",
	skyGrad: "#1a0a2a",
	sand: "#3a2a10",
	road: "#222",
	roadLine: "#444",
	cactus: "#1a4a1a",
	cactusDark: "#0d330d",
	mesa: "#2a1a0a",
	mesaLight: "#3a2510",
	sun: "#ff6600",
	sunGlow: "rgba(255,102,0,0.15)",
	stars: "#ffffff",
};

/** Desert background with parallax layers — used behind TrailMap */
export function DesertParallax({ offset = 0 }: { offset?: number }) {
	const farOffset = offset * 0.2;
	const midOffset = offset * 0.5;

	return (
		<svg viewBox="0 0 320 140" className="block w-full" preserveAspectRatio="xMidYMid slice">
			<defs>
				<linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor={SCENE_COLORS.sky} />
					<stop offset="100%" stopColor={SCENE_COLORS.skyGrad} />
				</linearGradient>
				<radialGradient id="sun-glow" cx="0.8" cy="0.3">
					<stop offset="0%" stopColor={SCENE_COLORS.sunGlow} />
					<stop offset="100%" stopColor="transparent" />
				</radialGradient>
			</defs>

			{/* Sky */}
			<rect width="320" height="140" fill="url(#sky-grad)" />

			{/* Sun glow */}
			<circle cx="260" cy="30" r="60" fill="url(#sun-glow)" />

			{/* Stars */}
			{[
				[30, 12],
				[80, 25],
				[150, 8],
				[200, 18],
				[280, 15],
				[120, 30],
				[240, 10],
				[60, 20],
				[310, 28],
			].map(([x, y]) => (
				<rect
					key={`${x}-${y}`}
					x={x}
					y={y}
					width="2"
					height="2"
					fill={SCENE_COLORS.stars}
					opacity="0.4"
				/>
			))}

			{/* Far mesa layer (slowest parallax) */}
			<g transform={`translate(${farOffset}, 0)`}>
				<polygon
					points="0,95 40,55 80,70 120,50 160,75 200,60 240,70 280,55 320,80 320,95"
					fill={SCENE_COLORS.mesa}
				/>
				<polygon
					points="0,95 40,55 80,70 120,50 160,75 200,60 240,70 280,55 320,80 320,95"
					fill={SCENE_COLORS.mesaLight}
					opacity="0.3"
				/>
			</g>

			{/* Mid cactus layer */}
			<g transform={`translate(${midOffset}, 0)`}>
				{/* Cactus 1 */}
				<rect x="45" y="72" width="6" height="23" fill={SCENE_COLORS.cactus} />
				<rect x="39" y="78" width="6" height="4" fill={SCENE_COLORS.cactus} />
				<rect x="39" y="74" width="6" height="4" fill={SCENE_COLORS.cactus} />
				<rect x="51" y="80" width="6" height="4" fill={SCENE_COLORS.cactus} />
				<rect x="51" y="76" width="6" height="4" fill={SCENE_COLORS.cactus} />

				{/* Cactus 2 */}
				<rect x="185" y="75" width="5" height="20" fill={SCENE_COLORS.cactusDark} />
				<rect x="180" y="81" width="5" height="3" fill={SCENE_COLORS.cactusDark} />
				<rect x="180" y="78" width="5" height="3" fill={SCENE_COLORS.cactusDark} />

				{/* Cactus 3 */}
				<rect x="280" y="78" width="4" height="17" fill={SCENE_COLORS.cactus} />
				<rect x="276" y="84" width="4" height="3" fill={SCENE_COLORS.cactus} />
			</g>

			{/* Sand/ground */}
			<rect x="0" y="95" width="320" height="45" fill={SCENE_COLORS.sand} />

			{/* Road */}
			<rect x="0" y="105" width="320" height="12" fill={SCENE_COLORS.road} />
			<line
				x1="0"
				y1="111"
				x2="320"
				y2="111"
				stroke={SCENE_COLORS.roadLine}
				strokeWidth="2"
				strokeDasharray="20 15"
				className="animate-[road-dash_2s_linear_infinite]"
			/>
		</svg>
	);
}

/** Pixel art car sprite — drives along the trail map */
export function PixelCar({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 32 16" className={className} preserveAspectRatio="xMidYMid meet">
			{/* Body */}
			<rect x="4" y="4" width="24" height="8" rx="1" fill="#cc3300" />
			{/* Roof */}
			<rect x="10" y="1" width="12" height="5" rx="1" fill="#aa2200" />
			{/* Windshield */}
			<rect x="11" y="2" width="5" height="3" fill="#224466" />
			{/* Rear window */}
			<rect x="18" y="2" width="3" height="3" fill="#224466" />
			{/* Headlight */}
			<rect x="3" y="6" width="2" height="3" fill="#ffcc00" />
			{/* Taillight */}
			<rect x="27" y="6" width="2" height="3" fill="#ff3333" />
			{/* Front wheel */}
			<rect x="6" y="11" width="6" height="4" rx="2" fill="#222" />
			<rect x="7" y="12" width="4" height="2" rx="1" fill="#444" />
			{/* Rear wheel */}
			<rect x="20" y="11" width="6" height="4" rx="2" fill="#222" />
			<rect x="21" y="12" width="4" height="2" rx="1" fill="#444" />
			{/* Exhaust */}
			<rect x="28" y="9" width="3" height="2" fill="#666" opacity="0.6" />
		</svg>
	);
}

/** Event illustration — renders a pixel art scene based on event ID */
export function EventIllustration({ eventId }: { eventId: string }) {
	const scene = EVENT_SCENES[eventId];
	if (!scene) return null;

	return (
		<div className="mb-2 overflow-hidden rounded-lg border border-border">
			<svg
				viewBox="0 0 280 100"
				className="block w-full bg-[#0a0a0a]"
				preserveAspectRatio="xMidYMid slice"
			>
				{scene}
			</svg>
		</div>
	);
}

/** Pixel art scenes for each event */
const EVENT_SCENES: Record<string, React.ReactNode> = {
	bats: (
		<>
			{/* Dark sky */}
			<rect width="280" height="100" fill="#0d0d1a" />
			{/* Moon */}
			<circle cx="230" cy="25" r="15" fill="#ddd" opacity="0.8" />
			<circle cx="225" cy="22" r="12" fill="#0d0d1a" />
			{/* Bat swarm */}
			{[
				[60, 20],
				[90, 35],
				[120, 15],
				[140, 40],
				[170, 25],
				[80, 50],
				[150, 50],
				[110, 30],
				[200, 35],
				[50, 40],
			].map(([x, y], i) => (
				<g key={i} transform={`translate(${x},${y})`}>
					<polygon points="-6,0 -3,-3 0,0 3,-3 6,0 3,1 0,-1 -3,1" fill="#222" />
					<rect x="-1" y="-1" width="2" height="2" fill="#ff3333" />
				</g>
			))}
			{/* Road */}
			<rect x="0" y="75" width="280" height="25" fill="#1a1a0a" />
			<rect x="0" y="82" width="280" height="8" fill="#333" />
			{/* Car */}
			<rect x="110" y="73" width="28" height="10" rx="2" fill="#cc3300" />
			<rect x="116" y="69" width="12" height="6" rx="1" fill="#aa2200" />
			<rect x="113" y="82" width="6" height="4" rx="2" fill="#222" />
			<rect x="126" y="82" width="6" height="4" rx="2" fill="#222" />
		</>
	),

	breakdown: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			{/* Sun */}
			<circle cx="200" cy="20" r="12" fill="#ff6600" opacity="0.6" />
			{/* Desert */}
			<rect x="0" y="60" width="280" height="40" fill="#3a2a10" />
			{/* Road */}
			<rect x="0" y="72" width="280" height="10" fill="#333" />
			{/* Broken car */}
			<rect x="100" y="63" width="30" height="11" rx="2" fill="#cc3300" />
			<rect x="106" y="59" width="14" height="6" rx="1" fill="#aa2200" />
			{/* Smoke puffs */}
			<circle cx="100" cy="56" r="5" fill="#555" opacity="0.5" />
			<circle cx="95" cy="50" r="4" fill="#444" opacity="0.4" />
			<circle cx="98" cy="44" r="3" fill="#333" opacity="0.3" />
			{/* Hood open */}
			<rect x="98" y="58" width="8" height="1" fill="#aa2200" transform="rotate(-30,98,58)" />
			{/* Wheels */}
			<rect x="104" y="73" width="6" height="4" rx="2" fill="#222" />
			<rect x="120" y="73" width="6" height="4" rx="2" fill="#222" />
		</>
	),

	police: (
		<>
			<rect width="280" height="100" fill="#0a0a1a" />
			{/* Police lights — alternating red/blue */}
			<rect x="0" y="0" width="140" height="100" fill="rgba(0,0,255,0.05)" />
			<rect x="140" y="0" width="140" height="100" fill="rgba(255,0,0,0.05)" />
			{/* Road */}
			<rect x="0" y="65" width="280" height="35" fill="#222" />
			{/* Police car */}
			<rect x="160" y="58" width="32" height="12" rx="2" fill="#111" />
			<rect x="166" y="54" width="16" height="6" rx="1" fill="#1a1a1a" />
			{/* Light bar */}
			<rect x="168" y="52" width="5" height="3" fill="#3333ff" />
			<rect x="175" y="52" width="5" height="3" fill="#ff3333" />
			{/* Badge */}
			<rect x="182" y="60" width="6" height="6" fill="#ffcc00" opacity="0.8" />
			{/* Player car ahead */}
			<rect x="60" y="60" width="26" height="10" rx="2" fill="#cc3300" />
			<rect x="66" y="56" width="12" height="6" rx="1" fill="#aa2200" />
		</>
	),

	hitchhiker: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			{/* Desert */}
			<rect x="0" y="60" width="280" height="40" fill="#3a2a10" />
			<rect x="0" y="72" width="280" height="10" fill="#333" />
			{/* Hitchhiker figure */}
			<rect x="140" y="44" width="6" height="6" rx="3" fill="#dda080" />
			<rect x="139" y="50" width="8" height="14" fill="#446644" />
			<rect x="140" y="64" width="3" height="8" fill="#334433" />
			<rect x="144" y="64" width="3" height="8" fill="#334433" />
			{/* Thumb out */}
			<rect x="147" y="52" width="6" height="2" fill="#dda080" />
			{/* Backpack */}
			<rect x="136" y="50" width="4" height="10" rx="1" fill="#664422" />
			{/* Sign */}
			<rect x="150" y="48" width="20" height="10" fill="#ddd" />
			<rect x="152" y="50" width="16" height="1" fill="#333" />
			<rect x="152" y="53" width="12" height="1" fill="#333" />
		</>
	),

	casino: (
		<>
			<rect width="280" height="100" fill="#0d001a" />
			{/* Casino building */}
			<rect x="80" y="20" width="120" height="60" fill="#1a1a2a" />
			<rect x="85" y="22" width="110" height="3" fill="#ff6600" />
			{/* Neon sign */}
			<rect
				x="100"
				y="28"
				width="80"
				height="14"
				rx="2"
				fill="#220022"
				stroke="#ff00ff"
				strokeWidth="1"
			/>
			{/* Windows */}
			{[95, 115, 135, 155, 175].map((x) => (
				<rect key={x} x={x} y="48" width="8" height="10" fill="#ffcc00" opacity="0.6" />
			))}
			{/* Door */}
			<rect x="130" y="58" width="20" height="22" fill="#332233" />
			<rect x="139" y="60" width="2" height="18" fill="#ffcc00" opacity="0.4" />
			{/* Stars */}
			<rect x="30" y="10" width="2" height="2" fill="#fff" opacity="0.3" />
			<rect x="250" y="15" width="2" height="2" fill="#fff" opacity="0.3" />
			{/* Ground */}
			<rect x="0" y="80" width="280" height="20" fill="#1a1a1a" />
		</>
	),

	wolves: (
		<>
			<rect width="280" height="100" fill="#0a0a1a" />
			{/* Moon */}
			<circle cx="220" cy="20" r="12" fill="#ddd" opacity="0.7" />
			{/* Desert */}
			<rect x="0" y="65" width="280" height="35" fill="#2a1a0a" />
			{/* Wolf pack — pixel wolves */}
			{[80, 120, 160, 200].map((x, i) => (
				<g key={i} transform={`translate(${x},${55 + (i % 2) * 5})`}>
					{/* Body */}
					<rect x="0" y="2" width="14" height="7" fill="#555" />
					{/* Head */}
					<rect x="-4" y="0" width="6" height="6" fill="#666" />
					{/* Eye */}
					<rect x="-3" y="1" width="2" height="2" fill="#ffcc00" />
					{/* Legs */}
					<rect x="1" y="9" width="2" height="4" fill="#444" />
					<rect x="10" y="9" width="2" height="4" fill="#444" />
					{/* Tail */}
					<rect x="13" y="0" width="3" height="3" fill="#555" />
				</g>
			))}
		</>
	),

	border: (
		<>
			<rect width="280" height="100" fill="#0d0d0d" />
			{/* Checkpoint structure */}
			<rect x="120" y="15" width="40" height="55" fill="#333" />
			<rect x="115" y="12" width="50" height="5" fill="#444" />
			{/* Gate arm */}
			<rect x="80" y="35" width="45" height="3" fill="#ff3333" />
			<rect x="155" y="35" width="45" height="3" fill="#ff3333" />
			{/* Warning stripes */}
			{[85, 95, 105, 115, 160, 170, 180, 190].map((x) => (
				<rect
					key={x}
					x={x}
					y="33"
					width="5"
					height="7"
					fill="#ffcc00"
					opacity={x % 20 === 5 ? 0.8 : 0.4}
				/>
			))}
			{/* Guard booth window */}
			<rect x="128" y="22" width="24" height="14" fill="#224466" opacity="0.6" />
			{/* Road */}
			<rect x="0" y="70" width="280" height="30" fill="#222" />
			<line x1="0" y1="85" x2="280" y2="85" stroke="#444" strokeWidth="2" strokeDasharray="15 10" />
			{/* Guard silhouette */}
			<rect x="108" y="42" width="6" height="6" rx="3" fill="#222" />
			<rect x="107" y="48" width="8" height="14" fill="#1a1a1a" />
		</>
	),

	flat_tire: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			<rect x="0" y="65" width="280" height="35" fill="#3a2a10" />
			<rect x="0" y="75" width="280" height="8" fill="#333" />
			{/* Car tilted */}
			<g transform="rotate(3, 120, 67)">
				<rect x="100" y="58" width="30" height="11" rx="2" fill="#cc3300" />
				<rect x="106" y="54" width="14" height="6" rx="1" fill="#aa2200" />
			</g>
			{/* Good wheel */}
			<rect x="120" y="71" width="6" height="5" rx="2" fill="#222" />
			{/* Flat wheel */}
			<rect x="104" y="72" width="7" height="3" rx="1" fill="#222" />
			{/* Flat tire on ground */}
			<circle cx="90" cy="78" r="5" fill="#222" />
			<circle cx="90" cy="78" r="3" fill="#333" />
		</>
	),

	dust_storm: (
		<>
			<rect width="280" height="100" fill="#2a1a00" />
			{/* Dust layers */}
			<rect x="0" y="0" width="280" height="100" fill="#3a2a10" opacity="0.3" />
			{/* Swirling dust particles */}
			{[
				[20, 30, 3],
				[60, 50, 4],
				[100, 20, 2],
				[140, 60, 5],
				[180, 35, 3],
				[220, 45, 4],
				[260, 25, 2],
				[40, 70, 3],
				[120, 40, 2],
				[200, 55, 3],
			].map(([x, y, r], i) => (
				<circle key={i} cx={x} cy={y} r={r} fill="#aa8844" opacity="0.4" />
			))}
			{/* Barely visible road */}
			<rect x="0" y="72" width="280" height="10" fill="#333" opacity="0.3" />
			{/* Car fighting through */}
			<rect x="100" y="64" width="26" height="10" rx="2" fill="#cc3300" opacity="0.7" />
		</>
	),

	mirage: (
		<>
			<rect width="280" height="100" fill="#1a0a00" />
			{/* Hot sun */}
			<circle cx="140" cy="15" r="20" fill="#ff6600" opacity="0.4" />
			<circle cx="140" cy="15" r="12" fill="#ffcc00" opacity="0.3" />
			{/* Heat shimmer lines */}
			{[40, 50, 60, 70].map((y) => (
				<line
					key={y}
					x1="0"
					y1={y}
					x2="280"
					y2={y}
					stroke="#ff6600"
					strokeWidth="1"
					opacity="0.08"
				/>
			))}
			{/* Desert */}
			<rect x="0" y="65" width="280" height="35" fill="#3a2a10" />
			{/* Mirage — wavy pool */}
			<ellipse cx="200" cy="62" rx="30" ry="5" fill="#2244aa" opacity="0.3" />
			<ellipse cx="200" cy="60" rx="25" ry="3" fill="#3355cc" opacity="0.2" />
			{/* Palm tree mirage */}
			<rect x="195" y="40" width="3" height="20" fill="#336633" opacity="0.3" />
			<polygon points="185,42 197,35 209,42" fill="#338833" opacity="0.25" />
		</>
	),

	gas_station: (
		<>
			<rect width="280" height="100" fill="#0d0d1a" />
			{/* Station building */}
			<rect x="100" y="30" width="80" height="40" fill="#222" />
			<rect x="95" y="27" width="90" height="5" fill="#333" />
			{/* Pumps */}
			<rect x="80" y="45" width="10" height="20" fill="#444" />
			<rect x="82" y="48" width="6" height="6" fill="#00ff88" opacity="0.5" />
			<rect x="190" y="45" width="10" height="20" fill="#444" />
			<rect x="192" y="48" width="6" height="6" fill="#00ff88" opacity="0.5" />
			{/* Sign */}
			<rect x="120" y="32" width="40" height="12" fill="#111" />
			<rect x="125" y="34" width="30" height="2" fill="#ff6600" />
			<rect x="125" y="38" width="20" height="2" fill="#ff6600" />
			{/* Ground */}
			<rect x="0" y="70" width="280" height="30" fill="#1a1a1a" />
			{/* Neon light */}
			<rect x="95" y="25" width="2" height="45" fill="#ff6600" opacity="0.1" />
			<rect x="183" y="25" width="2" height="45" fill="#ff6600" opacity="0.1" />
		</>
	),

	river: (
		<>
			{/* Sky */}
			<rect width="280" height="100" fill="#0a1a2a" />
			{/* Dense jungle banks */}
			<rect x="0" y="30" width="70" height="70" fill="#1a3a10" />
			<rect x="210" y="30" width="70" height="70" fill="#1a3a10" />
			{/* River — churning blue */}
			<rect x="60" y="40" width="160" height="45" fill="#0044aa" />
			{/* White rapids — blocky chunks */}
			<rect x="70" y="45" width="18" height="4" fill="#aaddff" opacity="0.7" />
			<rect x="110" y="52" width="22" height="4" fill="#aaddff" opacity="0.6" />
			<rect x="155" y="47" width="15" height="4" fill="#aaddff" opacity="0.7" />
			<rect x="85" y="60" width="20" height="3" fill="#88ccff" opacity="0.5" />
			<rect x="140" y="63" width="18" height="3" fill="#88ccff" opacity="0.5" />
			{/* Rickety brown bridge */}
			<rect x="90" y="38" width="100" height="6" fill="#5a3a10" />
			<rect x="90" y="44" width="4" height="20" fill="#4a2a08" />
			<rect x="186" y="44" width="4" height="20" fill="#4a2a08" />
			{/* Cross planks */}
			<rect x="110" y="38" width="3" height="16" fill="#4a2a08" />
			<rect x="135" y="38" width="3" height="16" fill="#4a2a08" />
			<rect x="162" y="38" width="3" height="16" fill="#4a2a08" />
			{/* Guide figure on bank */}
			<rect x="48" y="54" width="5" height="5" rx="2" fill="#cc9966" />
			<rect x="47" y="59" width="7" height="10" fill="#226622" />
			<rect x="47" y="69" width="3" height="6" fill="#1a4a1a" />
			<rect x="51" y="69" width="3" height="6" fill="#1a4a1a" />
			{/* Guide pole */}
			<rect x="44" y="52" width="2" height="18" fill="#886633" />
		</>
	),

	busker: (
		<>
			{/* City street, dusk */}
			<rect width="280" height="100" fill="#0d0a1a" />
			{/* Buildings */}
			<rect x="0" y="15" width="50" height="70" fill="#1a1a2a" />
			<rect x="55" y="25" width="40" height="60" fill="#221a2a" />
			<rect x="200" y="10" width="80" height="75" fill="#1a1a2a" />
			{/* Lit windows */}
			<rect x="10" y="22" width="8" height="6" fill="#ffcc00" opacity="0.5" />
			<rect x="25" y="22" width="8" height="6" fill="#ffcc00" opacity="0.4" />
			<rect x="10" y="35" width="8" height="6" fill="#ffcc00" opacity="0.3" />
			<rect x="210" y="18" width="8" height="6" fill="#ffcc00" opacity="0.5" />
			<rect x="225" y="18" width="8" height="6" fill="#ffcc00" opacity="0.4" />
			{/* Street */}
			<rect x="0" y="72" width="280" height="28" fill="#1a1a1a" />
			<rect x="0" y="76" width="280" height="8" fill="#2a2a2a" />
			{/* Busker figure */}
			<rect x="128" y="46" width="6" height="6" rx="3" fill="#cc9966" />
			<rect x="127" y="52" width="8" height="14" fill="#446688" />
			<rect x="127" y="66" width="3" height="7" fill="#334455" />
			<rect x="132" y="66" width="3" height="7" fill="#334455" />
			{/* Guitar body */}
			<rect x="120" y="54" width="9" height="7" rx="2" fill="#884422" />
			<rect x="115" y="51" width="3" height="12" fill="#663311" />
			{/* Strings */}
			<rect x="116" y="52" width="1" height="10" fill="#ccaa44" opacity="0.7" />
			<rect x="118" y="52" width="1" height="10" fill="#ccaa44" opacity="0.7" />
			{/* Hat on ground */}
			<ellipse cx="140" cy="76" rx="10" ry="3" fill="#222" />
			{/* Coins */}
			<rect x="135" y="74" width="3" height="2" fill="#ccaa00" opacity="0.8" />
			<rect x="141" y="73" width="3" height="2" fill="#ccaa00" opacity="0.6" />
		</>
	),

	tuberculosis: (
		<>
			{/* Dark, oppressive grey */}
			<rect width="280" height="100" fill="#0d0d0d" />
			{/* Road */}
			<rect x="0" y="65" width="280" height="35" fill="#1a1a1a" />
			{/* Sick figure hunched over steering wheel */}
			<rect x="120" y="35" width="40" height="30" rx="2" fill="#551111" />
			<rect x="126" y="27" width="18" height="12" rx="1" fill="#3a0a0a" />
			{/* Figure hunched */}
			<rect x="130" y="32" width="8" height="8" rx="4" fill="#cc9966" />
			<rect x="128" y="40" width="12" height="10" fill="#442222" />
			{/* Cough particles — red dots */}
			<rect x="138" y="35" width="3" height="3" rx="1" fill="#cc2222" opacity="0.9" />
			<rect x="144" y="32" width="2" height="2" rx="1" fill="#dd3333" opacity="0.8" />
			<rect x="150" y="30" width="3" height="3" rx="1" fill="#cc1111" opacity="0.7" />
			<rect x="156" y="28" width="2" height="2" rx="1" fill="#bb2222" opacity="0.6" />
			<rect x="147" y="38" width="2" height="2" rx="1" fill="#cc2222" opacity="0.5" />
			<rect x="153" y="35" width="3" height="2" rx="1" fill="#dd1111" opacity="0.6" />
			<rect x="159" y="33" width="2" height="2" rx="1" fill="#cc2222" opacity="0.4" />
			{/* Handkerchief */}
			<rect x="140" y="42" width="8" height="5" fill="#eee" opacity="0.7" />
			<rect x="142" y="43" width="4" height="3" fill="#cc3333" opacity="0.6" />
			{/* Wheels */}
			<rect x="124" y="63" width="6" height="4" rx="2" fill="#111" />
			<rect x="150" y="63" width="6" height="4" rx="2" fill="#111" />
		</>
	),

	measles: (
		<>
			{/* Sickly yellow-green tint */}
			<rect width="280" height="100" fill="#0d0d00" />
			{/* Road */}
			<rect x="0" y="65" width="280" height="35" fill="#1a1a10" />
			<rect x="0" y="72" width="280" height="8" fill="#222210" />
			{/* Large face close-up — chunky pixel art */}
			{/* Head */}
			<rect x="100" y="10" width="80" height="70" rx="4" fill="#cc9966" />
			{/* Eyes */}
			<rect x="115" y="28" width="16" height="12" rx="2" fill="#ffffff" />
			<rect x="149" y="28" width="16" height="12" rx="2" fill="#ffffff" />
			<rect x="120" y="31" width="8" height="8" rx="3" fill="#222" />
			<rect x="154" y="31" width="8" height="8" rx="3" fill="#222" />
			{/* Red irises (sick look) */}
			<rect x="122" y="33" width="4" height="4" rx="2" fill="#aa2222" />
			<rect x="156" y="33" width="4" height="4" rx="2" fill="#aa2222" />
			{/* Nose */}
			<rect x="134" y="45" width="12" height="8" rx="2" fill="#bb8855" />
			{/* Mouth — grimacing */}
			<rect x="120" y="60" width="40" height="5" rx="2" fill="#7a3322" />
			{/* Red measle spots scattered across face */}
			<rect x="108" y="22" width="6" height="6" rx="3" fill="#cc2222" opacity="0.85" />
			<rect x="165" y="18" width="5" height="5" rx="2" fill="#cc2222" opacity="0.85" />
			<rect x="112" y="50" width="5" height="5" rx="2" fill="#dd2222" opacity="0.9" />
			<rect x="163" y="52" width="6" height="6" rx="3" fill="#cc1111" opacity="0.8" />
			<rect x="130" y="16" width="4" height="4" rx="2" fill="#dd3333" opacity="0.85" />
			<rect x="155" y="62" width="5" height="5" rx="2" fill="#cc2222" opacity="0.8" />
			<rect x="116" y="65" width="4" height="4" rx="2" fill="#cc2222" opacity="0.75" />
			<rect x="170" y="40" width="4" height="4" rx="2" fill="#dd2222" opacity="0.8" />
		</>
	),

	broken_bones: (
		<>
			{/* Desert road, harsh daylight */}
			<rect width="280" height="100" fill="#1a0a00" />
			<rect x="0" y="55" width="280" height="45" fill="#3a2a10" />
			<rect x="0" y="65" width="280" height="10" fill="#333" />
			{/* Deep pothole — cracked road */}
			<rect x="110" y="62" width="40" height="10" fill="#111" />
			{/* Crack lines radiating */}
			<line x1="110" y1="62" x2="95" y2="55" stroke="#555" strokeWidth="2" />
			<line x1="150" y1="62" x2="165" y2="55" stroke="#555" strokeWidth="2" />
			<line x1="130" y1="72" x2="125" y2="82" stroke="#555" strokeWidth="1" />
			<line x1="120" y1="65" x2="105" y2="70" stroke="#444" strokeWidth="1" />
			<line x1="140" y1="65" x2="158" y2="70" stroke="#444" strokeWidth="1" />
			{/* Car pitched forward into pothole */}
			<g transform="rotate(8, 120, 62)">
				<rect x="95" y="48" width="30" height="15" rx="2" fill="#cc3300" />
				<rect x="101" y="42" width="14" height="8" rx="1" fill="#aa2200" />
				{/* Wheel in hole */}
				<rect x="99" y="61" width="7" height="5" rx="2" fill="#111" />
				{/* Good wheel */}
				<rect x="118" y="63" width="6" height="4" rx="2" fill="#222" />
			</g>
			{/* Pain stars */}
			<polygon points="230,20 232,14 234,20 240,18 235,22 237,28 232,24 227,28 229,22 224,18" fill="#ffcc00" opacity="0.8" />
		</>
	),

	aids: (
		<>
			{/* Clinical white-grey */}
			<rect width="280" height="100" fill="#0d1010" />
			{/* Clinic building */}
			<rect x="70" y="15" width="140" height="65" fill="#1a2222" />
			<rect x="65" y="12" width="150" height="6" fill="#223333" />
			{/* TEST sign — blocky neon */}
			<rect x="95" y="20" width="90" height="16" rx="2" fill="#001a00" stroke="#00cc44" strokeWidth="1" />
			<rect x="100" y="23" width="10" height="2" fill="#00cc44" opacity="0.9" />
			<rect x="113" y="23" width="8" height="2" fill="#00cc44" opacity="0.9" />
			<rect x="113" y="27" width="8" height="2" fill="#00cc44" opacity="0.9" />
			<rect x="124" y="23" width="10" height="2" fill="#00cc44" opacity="0.9" />
			<rect x="137" y="23" width="10" height="2" fill="#00cc44" opacity="0.9" />
			{/* Red cross */}
			<rect x="128" y="42" width="6" height="16" fill="#cc2222" />
			<rect x="122" y="48" width="18" height="6" fill="#cc2222" />
			{/* Windows */}
			<rect x="80" y="50" width="14" height="10" fill="#224422" opacity="0.6" />
			<rect x="186" y="50" width="14" height="10" fill="#224422" opacity="0.6" />
			{/* Door */}
			<rect x="150" y="55" width="16" height="25" fill="#112211" />
			{/* Envelope on ground (test results) */}
			<rect x="130" y="82" width="20" height="14" fill="#ddd" opacity="0.8" />
			<polygon points="130,82 140,90 150,82" fill="#bbb" opacity="0.7" />
			{/* Ground */}
			<rect x="0" y="80" width="280" height="20" fill="#111" />
		</>
	),

	mid_dabs: (
		<>
			{/* Purple-grey haze interior */}
			<rect width="280" height="100" fill="#100a1a" />
			{/* Haze layers */}
			<rect x="0" y="0" width="280" height="100" fill="#220a44" opacity="0.15" />
			{/* Dab rig on dash — glowing */}
			<rect x="110" y="50" width="18" height="20" rx="2" fill="#222" />
			<rect x="116" y="38" width="6" height="14" fill="#333" />
			<rect x="113" y="36" width="12" height="4" rx="2" fill="#444" />
			{/* Glowing nail */}
			<rect x="122" y="42" width="6" height="6" rx="1" fill="#ff6600" opacity="0.9" />
			<circle cx="125" cy="45" r="4" fill="#ff8800" opacity="0.4" />
			{/* Smoke clouds — layered ovals */}
			<ellipse cx="130" cy="28" rx="20" ry="10" fill="#553377" opacity="0.4" />
			<ellipse cx="155" cy="18" rx="25" ry="12" fill="#442266" opacity="0.35" />
			<ellipse cx="108" cy="22" rx="18" ry="9" fill="#553377" opacity="0.3" />
			<ellipse cx="175" cy="12" rx="20" ry="8" fill="#331155" opacity="0.3" />
			{/* Steering wheel — blurred */}
			<circle cx="140" cy="68" r="14" fill="none" stroke="#333" strokeWidth="3" opacity="0.6" />
			<rect x="138" y="54" width="4" height="14" fill="#333" opacity="0.5" />
			{/* Dashboard */}
			<rect x="80" y="60" width="120" height="30" fill="#1a1a1a" />
			{/* Glow from rig */}
			<rect x="100" y="40" width="60" height="40" fill="#ff6600" opacity="0.04" />
		</>
	),

	diphtheria: (
		<>
			{/* Bleak grey */}
			<rect width="280" height="100" fill="#0a0a0a" />
			{/* Road */}
			<rect x="0" y="65" width="280" height="35" fill="#1a1a1a" />
			<rect x="0" y="72" width="280" height="8" fill="#222" />
			{/* Figure standing by roadside — clutching throat */}
			{/* Body */}
			<rect x="130" y="52" width="10" height="18" fill="#334455" />
			{/* Head */}
			<rect x="131" y="43" width="8" height="9" rx="3" fill="#cc9966" />
			{/* Hands at throat */}
			<rect x="126" y="50" width="5" height="4" rx="1" fill="#cc9966" />
			<rect x="139" y="50" width="5" height="4" rx="1" fill="#cc9966" />
			{/* Legs */}
			<rect x="131" y="70" width="3" height="8" fill="#223344" />
			<rect x="136" y="70" width="3" height="8" fill="#223344" />
			{/* Medical cross nearby */}
			<rect x="160" y="48" width="5" height="14" fill="#cc2222" opacity="0.8" />
			<rect x="155" y="53" width="15" height="5" fill="#cc2222" opacity="0.8" />
			{/* Pain lines around throat */}
			<line x1="123" y1="48" x2="118" y2="44" stroke="#cc2222" strokeWidth="1" opacity="0.7" />
			<line x1="148" y1="48" x2="153" y2="44" stroke="#cc2222" strokeWidth="1" opacity="0.7" />
			<line x1="135" y1="43" x2="135" y2="38" stroke="#cc2222" strokeWidth="1" opacity="0.7" />
		</>
	),

	feast: (
		<>
			{/* Warm evening campfire light */}
			<rect width="280" height="100" fill="#0d0800" />
			{/* Ground */}
			<rect x="0" y="65" width="280" height="35" fill="#2a1a08" />
			{/* Campfire glow */}
			<circle cx="140" cy="68" r="30" fill="#ff6600" opacity="0.08" />
			{/* Campfire */}
			<rect x="132" y="60" width="16" height="8" fill="#331100" />
			<polygon points="135,60 140,48 145,60" fill="#ff6600" opacity="0.9" />
			<polygon points="137,60 140,52 143,60" fill="#ffcc00" opacity="0.8" />
			<polygon points="133,60 138,55 142,60" fill="#ff4400" opacity="0.7" />
			{/* Table */}
			<rect x="70" y="55" width="140" height="8" fill="#5a3a10" />
			<rect x="75" y="63" width="4" height="12" fill="#442a08" />
			<rect x="201" y="63" width="4" height="12" fill="#442a08" />
			{/* Food items on table */}
			<circle cx="100" cy="53" r="5" fill="#bb3300" />
			<rect x="115" y="48" width="12" height="6" rx="2" fill="#cc8822" />
			<circle cx="155" cy="52" r="6" fill="#aa5500" />
			<rect x="170" y="49" width="10" height="5" rx="1" fill="#668833" />
			{/* Seated figures — silhouettes */}
			<rect x="82" y="40" width="6" height="6" rx="3" fill="#553322" />
			<rect x="80" y="46" width="10" height="10" fill="#443322" />
			<rect x="180" y="38" width="6" height="6" rx="3" fill="#553322" />
			<rect x="178" y="44" width="10" height="12" fill="#443322" />
			<rect x="120" y="36" width="6" height="6" rx="3" fill="#553322" />
			<rect x="118" y="42" width="10" height="14" fill="#443322" />
		</>
	),

	cards: (
		<>
			{/* Cantina backroom — dim light */}
			<rect width="280" height="100" fill="#0d0800" />
			{/* Table */}
			<rect x="60" y="52" width="160" height="30" rx="3" fill="#2a1a08" />
			<rect x="60" y="50" width="160" height="5" rx="2" fill="#3a2510" />
			{/* Card fan — face cards */}
			<rect x="90" y="40" width="16" height="22" rx="1" fill="#fff" opacity="0.9" />
			<rect x="100" y="38" width="16" height="22" rx="1" fill="#fff" opacity="0.9" />
			<rect x="110" y="36" width="16" height="22" rx="1" fill="#fff" opacity="0.9" />
			{/* Card suits */}
			<rect x="92" y="43" width="4" height="4" fill="#cc1111" opacity="0.9" />
			<rect x="102" y="41" width="4" height="4" fill="#111" opacity="0.9" />
			<rect x="112" y="39" width="4" height="4" fill="#cc1111" opacity="0.9" />
			{/* Chips */}
			<circle cx="160" cy="58" r="6" fill="#cc0000" opacity="0.8" />
			<circle cx="173" cy="58" r="6" fill="#0000cc" opacity="0.8" />
			<circle cx="186" cy="58" r="6" fill="#ffffff" opacity="0.6" />
			<circle cx="160" cy="70" r="6" fill="#00aa00" opacity="0.8" />
			<circle cx="173" cy="70" r="6" fill="#cc0000" opacity="0.8" />
			{/* Chips stripe */}
			<line x1="154" y1="58" x2="166" y2="58" stroke="#fff" strokeWidth="1" opacity="0.4" />
			{/* Shadowy player hands */}
			<rect x="70" y="65" width="14" height="5" rx="2" fill="#553322" />
			<rect x="196" y="65" width="14" height="5" rx="2" fill="#553322" />
			{/* Overhead lamp */}
			<rect x="128" y="5" width="4" height="20" fill="#555" />
			<circle cx="130" cy="28" r="10" fill="#ffcc44" opacity="0.2" />
		</>
	),

	lizard: (
		<>
			{/* Night, neon-lit motel */}
			<rect width="280" height="100" fill="#0a0008" />
			{/* Motel building */}
			<rect x="50" y="20" width="180" height="65" fill="#1a1a22" />
			<rect x="45" y="17" width="190" height="6" fill="#222233" />
			{/* Vacancy sign — glowing */}
			<rect x="90" y="24" width="100" height="14" rx="2" fill="#1a0000" stroke="#ff2222" strokeWidth="1" />
			<rect x="95" y="27" width="8" height="2" fill="#ff2222" opacity="0.9" />
			<rect x="106" y="27" width="8" height="2" fill="#ff2222" opacity="0.9" />
			<rect x="106" y="31" width="8" height="2" fill="#ff2222" opacity="0.9" />
			<rect x="106" y="29" width="2" height="2" fill="#ff2222" opacity="0.9" />
			{/* Windows */}
			{[60, 90, 130, 170, 200].map((x) => (
				<rect key={x} x={x} y="46" width="14" height="12" fill="#223322" opacity="0.7" />
			))}
			{/* One window glowing yellow-green — lizard silhouette */}
			<rect x="170" y="46" width="14" height="12" fill="#334400" opacity="0.9" />
			{/* Lizard silhouette */}
			<rect x="173" y="49" width="4" height="4" rx="2" fill="#111" />
			<rect x="172" y="53" width="6" height="3" fill="#111" />
			<rect x="177" y="52" width="4" height="2" fill="#111" />
			<rect x="170" y="52" width="3" height="2" fill="#111" />
			{/* Door */}
			<rect x="130" y="60" width="20" height="25" fill="#2a2a33" />
			{/* Ground */}
			<rect x="0" y="85" width="280" height="15" fill="#111" />
			{/* Parking lot lines */}
			<line x1="80" y1="85" x2="80" y2="100" stroke="#333" strokeWidth="1" strokeDasharray="3 4" />
			<line x1="130" y1="85" x2="130" y2="100" stroke="#333" strokeWidth="1" strokeDasharray="3 4" />
			<line x1="180" y1="85" x2="180" y2="100" stroke="#333" strokeWidth="1" strokeDasharray="3 4" />
		</>
	),

	attorney: (
		<>
			{/* Desert road, dust haze */}
			<rect width="280" height="100" fill="#1a0a00" />
			<rect x="0" y="58" width="280" height="42" fill="#3a2a10" />
			<rect x="0" y="68" width="280" height="10" fill="#333" />
			{/* Large Samoan figure on roadside */}
			{/* Head — large */}
			<rect x="185" y="22" width="18" height="18" rx="4" fill="#8a5533" />
			{/* Body — imposing bulk */}
			<rect x="180" y="40" width="28" height="28" fill="#1a2255" />
			{/* Briefcase */}
			<rect x="208" y="50" width="16" height="12" rx="1" fill="#5a3a10" />
			<rect x="213" y="48" width="6" height="4" rx="1" fill="#3a2a08" />
			{/* Handle */}
			<rect x="215" y="46" width="2" height="4" fill="#884422" />
			{/* Legs */}
			<rect x="184" y="68" width="8" height="14" fill="#111833" />
			<rect x="196" y="68" width="8" height="14" fill="#111833" />
			{/* Shoes */}
			<rect x="182" y="80" width="12" height="4" rx="1" fill="#111" />
			<rect x="194" y="80" width="12" height="4" rx="1" fill="#111" />
			{/* Raised arm — flagging */}
			<rect x="208" y="36" width="16" height="6" rx="2" fill="#8a5533" transform="rotate(-30, 208, 39)" />
			{/* Car in distance */}
			<rect x="50" y="60" width="22" height="8" rx="2" fill="#cc3300" opacity="0.7" />
			<rect x="56" y="56" width="10" height="6" rx="1" fill="#aa2200" opacity="0.7" />
		</>
	),

	adrenochrome: (
		<>
			{/* Interior of car — dark, ominous */}
			<rect width="280" height="100" fill="#050010" />
			{/* Dashboard */}
			<rect x="0" y="60" width="280" height="40" fill="#0d0d1a" />
			<rect x="0" y="55" width="280" height="8" fill="#1a1a2a" />
			{/* Dashboard details */}
			<rect x="20" y="62" width="40" height="12" rx="1" fill="#111122" />
			<rect x="220" y="62" width="40" height="12" rx="1" fill="#111122" />
			{/* Gauges glow */}
			<circle cx="40" cy="68" r="6" fill="#003300" opacity="0.8" />
			<circle cx="240" cy="68" r="6" fill="#003300" opacity="0.8" />
			{/* Vial on dashboard — glowing */}
			<rect x="126" y="44" width="10" height="20" rx="2" fill="#1a0044" stroke="#aa00ff" strokeWidth="1" />
			{/* Glowing liquid */}
			<rect x="127" y="50" width="8" height="12" rx="1" fill="#6600cc" opacity="0.8" />
			{/* Glow aura */}
			<ellipse cx="131" cy="58" rx="14" ry="8" fill="#8800ff" opacity="0.12" />
			<ellipse cx="131" cy="55" rx="20" ry="14" fill="#6600cc" opacity="0.06" />
			{/* Cap */}
			<rect x="128" y="42" width="6" height="4" rx="1" fill="#880088" />
			{/* Reflection on windshield */}
			<rect x="0" y="0" width="280" height="55" fill="#220044" opacity="0.1" />
			{/* Night road outside */}
			<rect x="0" y="0" width="280" height="55" fill="#000" />
			<line x1="100" y1="55" x2="140" y2="10" stroke="#333" strokeWidth="1" opacity="0.3" />
			<line x1="180" y1="55" x2="140" y2="10" stroke="#333" strokeWidth="1" opacity="0.3" />
		</>
	),
};
