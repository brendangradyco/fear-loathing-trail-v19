import { useCallback, useEffect, useRef, useState } from "react";
import { checkHit, createHustleState, updateMarker } from "../../engine/hustleGame";
import type { HustleState } from "../../engine/hustleGame";
import { useGameStore } from "../../stores/gameStore";
import { toast } from "../shared/Toast";

interface HustleGameProps {
	onEnd: () => void;
}

type GamePhase = "playing" | "result";

export default function HustleGame({ onEnd }: HustleGameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const state = useGameStore((s) => s.state);
	const addLog = useGameStore((s) => s.addLog);

	const hustleStateRef = useRef<HustleState | null>(null);
	const activeRef = useRef(true);
	const rafRef = useRef<number>(0);
	const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [phase, setPhase] = useState<GamePhase>("playing");
	const [resultSuccess, setResultSuccess] = useState(false);
	const [resultAmount, setResultAmount] = useState(0);

	const smoothSkill = state?.skills.smooth ?? 30;

	// Initialize hustle state
	useEffect(() => {
		hustleStateRef.current = createHustleState(smoothSkill);
	}, [smoothSkill]);

	// Animation loop
	useEffect(() => {
		function loop() {
			if (!activeRef.current) return;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx || !hustleStateRef.current) return;

			const W = canvas.offsetWidth || 320;
			canvas.width = W;
			canvas.height = 80;
			const H = 80;

			// Update marker position
			hustleStateRef.current = updateMarker(hustleStateRef.current);
			const hs = hustleStateRef.current;

			// Background
			ctx.fillStyle = "#0a0a0a";
			ctx.fillRect(0, 0, W, H);

			// Pixel-art box border
			ctx.strokeStyle = "#ff6600";
			ctx.lineWidth = 2;
			ctx.strokeRect(1, 1, W - 2, H - 2);

			// Track
			const trackY = H / 2;
			const trackH = 8;
			ctx.fillStyle = "#1a1a1a";
			ctx.fillRect(16, trackY - trackH / 2, W - 32, trackH);

			// Zone (green)
			const trackW = W - 32;
			const zoneWidthPx = (hs.zoneWidth / 100) * trackW;
			const zoneCenterPx = 16 + (hs.zoneCenter / 100) * trackW;
			ctx.fillStyle = "#00ff44";
			ctx.shadowBlur = 8;
			ctx.shadowColor = "#00ff44";
			ctx.fillRect(zoneCenterPx - zoneWidthPx / 2, trackY - trackH / 2, zoneWidthPx, trackH);
			ctx.shadowBlur = 0;

			// Marker (red)
			const markerX = 16 + (hs.marker / 100) * trackW;
			ctx.fillStyle = "#ff2222";
			ctx.shadowBlur = 12;
			ctx.shadowColor = "#ff2222";
			ctx.fillRect(markerX - 3, trackY - trackH / 2 - 4, 6, trackH + 8);
			ctx.shadowBlur = 0;

			// Label
			ctx.fillStyle = "#888";
			ctx.font = "10px monospace";
			ctx.textAlign = "left";
			ctx.fillText("HUSTLE", 20, 18);

			rafRef.current = requestAnimationFrame(loop);
		}

		rafRef.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafRef.current);
	}, []);

	const handleStop = useCallback(() => {
		if (!activeRef.current || phase !== "playing") return;
		if (!hustleStateRef.current) return;

		activeRef.current = false;
		cancelAnimationFrame(rafRef.current);

		const result = checkHit(hustleStateRef.current);
		setResultSuccess(result.success);
		setResultAmount(Math.abs(result.reward));
		setPhase("result");

		// Update game state
		const gameState = useGameStore.getState().state;
		if (gameState) {
			const newCash = Math.max(0, gameState.cash + result.reward);
			const logMsg = result.success
				? `Hustle: lifted $${result.reward} from some square.`
				: `Hustle: fumbled it. Lost $${Math.abs(result.reward)}.`;

			useGameStore.setState({
				state: {
					...gameState,
					cash: newCash,
					hustleDone: true,
				},
			});
			addLog(logMsg, !result.success, result.success);
			toast(result.success ? `+$${result.reward} — smooth operator!` : `-$${Math.abs(result.reward)} — blown cover.`, !result.success);
		}

		// Auto-navigate after result display
		resultTimerRef.current = setTimeout(() => {
			onEnd();
		}, 1500);
	}, [phase, addLog, onEnd]);

	// Cleanup timer on unmount
	useEffect(() => {
		return () => {
			if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div
			className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0a0a]"
			style={{ fontFamily: "monospace" }}
		>
			{/* Pixel border frame */}
			<div
				className="flex w-full max-w-[360px] flex-col items-center gap-6 rounded-none p-6"
				style={{ border: "2px solid #ff6600", background: "#111" }}
			>
				<h2 className="text-[18px] font-bold tracking-widest text-orange" style={{ textShadow: "0 0 8px #ff6600" }}>
					PICKPOCKET
				</h2>

				<p className="text-center text-[12px] text-[#888]">
					Stop the marker inside the GREEN zone.
				</p>

				{/* Canvas */}
				{phase === "playing" && (
					<canvas
						ref={canvasRef}
						className="w-full cursor-pointer"
						style={{ height: 80, display: "block", imageRendering: "pixelated" }}
						onClick={handleStop}
						onTouchStart={handleStop}
					/>
				)}

				{/* Result */}
				{phase === "result" && (
					<div
						className="flex w-full flex-col items-center gap-3 py-4"
						style={{ border: `2px solid ${resultSuccess ? "#00ff44" : "#ff2222"}`, background: "#0a0a0a" }}
					>
						<p
							className="text-[22px] font-bold tracking-widest"
							style={{ color: resultSuccess ? "#00ff44" : "#ff2222", textShadow: resultSuccess ? "0 0 12px #00ff44" : "0 0 12px #ff2222" }}
						>
							{resultSuccess ? "CLEAN LIFT!" : "BUSTED!"}
						</p>
						<p className="text-[15px] font-bold" style={{ color: resultSuccess ? "#00ff44" : "#ff4444" }}>
							{resultSuccess ? `+$${resultAmount}` : `-$${resultAmount}`}
						</p>
						<p className="text-[11px] text-[#666]">Returning to map...</p>
					</div>
				)}

				{/* Tap to stop button */}
				{phase === "playing" && (
					<button
						type="button"
						onClick={handleStop}
						className="w-full rounded-none py-4 text-[16px] font-bold tracking-widest active:opacity-75"
						style={{ border: "2px solid #ff6600", color: "#ff6600", background: "#0a0a0a" }}
					>
						TAP TO STOP
					</button>
				)}
			</div>
		</div>
	);
}
