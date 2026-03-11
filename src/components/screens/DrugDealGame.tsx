import { useCallback, useEffect, useRef, useState } from "react";
import { DEAL_DURATION, checkBust, createDealState, stayCool, tickHeat } from "../../engine/drugDealGame";
import type { DealState } from "../../engine/drugDealGame";
import { useGameStore } from "../../stores/gameStore";
import { toast } from "../shared/Toast";
import { clamp } from "../../utils/clamp";

interface DrugDealGameProps {
	onEnd: () => void;
}

type GamePhase = "dealing" | "result";

export default function DrugDealGame({ onEnd }: DrugDealGameProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const state = useGameStore((s) => s.state);
	const addLog = useGameStore((s) => s.addLog);

	const dealStateRef = useRef<DealState | null>(null);
	const activeRef = useRef(true);
	const rafRef = useRef<number>(0);
	const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [phase, setPhase] = useState<GamePhase>("dealing");
	const [heat, setHeat] = useState(0);
	const [busted, setBusted] = useState(false);
	const [earnings, setEarnings] = useState(0);
	const [progress, setProgress] = useState(0); // 0-1 time progress

	// Pick highest-qty drug for the deal
	const drugInventory = state?.drugInventory;
	const pendingDrug = drugInventory
		? Object.entries(drugInventory).reduce<{ drug: string; qty: number }>(
				(best, [drug, qty]) => (qty > best.qty ? { drug, qty } : best),
				{ drug: "", qty: 0 },
		  )
		: { drug: "", qty: 0 };

	// Find fiend risk — use the stored deal context if available, fallback moderate risk
	// The drug deal fiend risk is contextual; use a moderate default if not set
	const fiendRisk = 0.3;

	// Initialize deal state
	useEffect(() => {
		dealStateRef.current = createDealState(fiendRisk);
	}, [fiendRisk]);

	// Game loop
	useEffect(() => {
		function loop() {
			if (!activeRef.current) return;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx || !dealStateRef.current) return;

			const W = canvas.offsetWidth || 80;
			const H = canvas.offsetHeight || 240;
			canvas.width = W;
			canvas.height = H;

			// Tick heat
			dealStateRef.current = tickHeat(dealStateRef.current);
			const ds = dealStateRef.current;

			// Update reactive state
			const heatClamped = clamp(ds.heat, 0, 100);
			setHeat(heatClamped);
			setProgress(ds.tick / DEAL_DURATION);

			// Check bust
			if (checkBust(ds)) {
				activeRef.current = false;
				finishDeal(true, ds);
				return;
			}

			// Check time expiry
			if (ds.tick >= DEAL_DURATION) {
				activeRef.current = false;
				finishDeal(false, ds);
				return;
			}

			// Draw heat bar
			const heatFraction = heatClamped / 100;
			const barH = Math.floor(H * heatFraction);

			// Background
			ctx.fillStyle = "#0a0a0a";
			ctx.fillRect(0, 0, W, H);

			// Border
			ctx.strokeStyle = "#ff2222";
			ctx.lineWidth = 2;
			ctx.strokeRect(1, 1, W - 2, H - 2);

			// Heat gradient bar
			const gradient = ctx.createLinearGradient(0, H, 0, H - barH);
			gradient.addColorStop(0, "#ff2222");
			gradient.addColorStop(0.5, "#ff6600");
			gradient.addColorStop(1, "#ffff00");
			ctx.fillStyle = gradient;

			// Pulsing effect
			const pulse = 0.85 + Math.sin(Date.now() / 100) * 0.15;
			ctx.globalAlpha = pulse;
			ctx.fillRect(4, H - barH - 4, W - 8, barH);
			ctx.globalAlpha = 1;

			// Heat % label
			ctx.fillStyle = "#ff6600";
			ctx.font = "bold 10px monospace";
			ctx.textAlign = "center";
			ctx.fillText(`${Math.round(heatClamped)}%`, W / 2, 16);

			rafRef.current = requestAnimationFrame(loop);
		}

		rafRef.current = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafRef.current);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const finishDeal = useCallback((isBusted: boolean, ds: DealState) => {
		setBusted(isBusted);
		setPhase("result");
		cancelAnimationFrame(rafRef.current);

		const gameState = useGameStore.getState().state;
		if (!gameState) return;

		if (isBusted) {
			// Lose the drug and pay fine
			const fine = 80 + Math.floor(Math.random() * 120);
			const newInventory = { ...gameState.drugInventory };
			if (pendingDrug.drug) {
				newInventory[pendingDrug.drug as keyof typeof newInventory] = 0 as never;
			}
			const newState = {
				...gameState,
				drugInventory: newInventory,
				cash: Math.max(0, gameState.cash - fine),
				sanity: clamp(gameState.sanity - 15, 0, 100),
			};
			useGameStore.setState({ state: newState });
			addLog(`Deal went south — BUSTED! Fine $${fine}, sanity -15.`, true, false);
			toast(`BUSTED! -$${fine}`, true);
			setEarnings(-fine);
		} else {
			// Successful deal — earn based on drug inventory
			const qty = pendingDrug.qty;
			const dealEarnings = qty > 0 ? 50 + qty * 20 + Math.floor(Math.random() * 50) : 50;
			const newState = {
				...gameState,
				cash: gameState.cash + dealEarnings,
			};
			useGameStore.setState({ state: newState });
			addLog(`Deal complete. +$${dealEarnings}`, false, true);
			toast(`Deal done! +$${dealEarnings}`);
			setEarnings(dealEarnings);
		}

		resultTimerRef.current = setTimeout(() => {
			onEnd();
		}, 2000);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addLog, onEnd, pendingDrug]);

	const handleStayCool = useCallback(() => {
		if (!activeRef.current || !dealStateRef.current) return;
		dealStateRef.current = stayCool(dealStateRef.current);
		setHeat(clamp(dealStateRef.current.heat, 0, 100));
	}, []);

	// Cleanup
	useEffect(() => {
		return () => {
			if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	const heatColor = heat > 80 ? "#ff2222" : heat > 50 ? "#ff6600" : "#ffaa00";

	return (
		<div
			className="fixed inset-0 flex flex-col items-center justify-center bg-[#080808]"
			style={{ fontFamily: "monospace" }}
		>
			<div
				className="flex w-full max-w-[360px] flex-col items-center gap-4 p-5"
				style={{ border: "2px solid #ff2222", background: "#0d0d0d" }}
			>
				{/* Header */}
				<h2
					className="text-[18px] font-bold tracking-widest"
					style={{ color: "#ff2222", textShadow: "0 0 8px #ff2222" }}
				>
					DEAL IN PROGRESS
				</h2>

				{phase === "dealing" && (
					<>
						{/* Heat bar + layout */}
						<div className="flex w-full items-center gap-4">
							{/* Vertical heat bar canvas */}
							<canvas
								ref={canvasRef}
								style={{ width: 60, height: 200, display: "block", imageRendering: "pixelated" }}
							/>

							{/* Right side info */}
							<div className="flex flex-1 flex-col items-center gap-3">
								<p className="text-[11px] text-[#666]">HEAT LEVEL</p>
								<p
									className="text-[28px] font-bold"
									style={{ color: heatColor, textShadow: `0 0 12px ${heatColor}` }}
								>
									{Math.round(heat)}%
								</p>

								{/* Time progress */}
								<div className="w-full" style={{ background: "#222", height: 6, border: "1px solid #444" }}>
									<div
										className="h-full transition-all duration-100"
										style={{
											width: `${Math.min(100, progress * 100)}%`,
											background: "#ff6600",
										}}
									/>
								</div>
								<p className="text-[10px] text-[#555]">Time remaining</p>

								{/* Stay cool button */}
								<button
									type="button"
									onClick={handleStayCool}
									className="mt-2 w-full py-4 text-[15px] font-bold tracking-widest active:scale-95 active:opacity-75"
									style={{
										border: "2px solid #ff6600",
										color: "#ff6600",
										background: "#150500",
										textShadow: "0 0 8px #ff6600",
										animation: "pulse 1s ease-in-out infinite",
									}}
								>
									STAY COOL
								</button>
								<p className="text-[10px] text-[#555]">Click to reduce heat -22</p>
							</div>
						</div>

						{/* Warning */}
						{heat > 70 && (
							<p
								className="animate-pulse text-center text-[13px] font-bold"
								style={{ color: "#ff2222" }}
							>
								{"⚠ "} SIREN NEARBY {" ⚠"}
							</p>
						)}
					</>
				)}

				{/* Result */}
				{phase === "result" && (
					<div
						className="flex w-full flex-col items-center gap-3 py-6"
						style={{ border: `2px solid ${busted ? "#ff2222" : "#00ff44"}` }}
					>
						<p
							className="text-[22px] font-bold tracking-widest"
							style={{
								color: busted ? "#ff2222" : "#00ff44",
								textShadow: `0 0 12px ${busted ? "#ff2222" : "#00ff44"}`,
							}}
						>
							{busted ? "BUSTED!" : "DEAL DONE!"}
						</p>
						<p className="text-[16px] font-bold" style={{ color: busted ? "#ff4444" : "#ffaa00" }}>
							{busted ? `-$${Math.abs(earnings)}` : `+$${earnings}`}
						</p>
						{busted && <p className="text-[12px] text-[#888]">Lost the stash. Sanity -15.</p>}
						<p className="text-[11px] text-[#555]">Returning to map...</p>
					</div>
				)}
			</div>

			<style>{`
				@keyframes pulse {
					0%, 100% { box-shadow: 0 0 8px #ff6600; }
					50% { box-shadow: 0 0 20px #ff6600, 0 0 40px #ff3300; }
				}
			`}</style>
		</div>
	);
}
