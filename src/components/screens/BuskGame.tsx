import { useCallback, useEffect, useRef, useState } from "react";
import { calculateReward, checkInput, generateSequence } from "../../engine/buskGame";
import { useGameStore } from "../../stores/gameStore";
import { toast } from "../shared/Toast";

interface BuskGameProps {
	onEnd: () => void;
}

const PAD_COLORS = [
	{ id: 0, label: "RED", active: "#ff4444", inactive: "rgba(255,68,68,0.3)", border: "#ff4444" },
	{ id: 1, label: "GRN", active: "#44ff44", inactive: "rgba(68,255,68,0.3)", border: "#44ff44" },
	{ id: 2, label: "BLU", active: "#4444ff", inactive: "rgba(68,68,255,0.3)", border: "#4444ff" },
	{ id: 3, label: "YLW", active: "#ffff44", inactive: "rgba(255,255,68,0.3)", border: "#ffff44" },
] as const;

type GamePhase = "showing" | "input" | "result" | "between";

export default function BuskGame({ onEnd }: BuskGameProps) {
	const addLog = useGameStore((s) => s.addLog);

	const [round, setRound] = useState(1);
	const [sequence, setSequence] = useState<number[]>([]);
	const [playerInput, setPlayerInput] = useState<number[]>([]);
	const [activePad, setActivePad] = useState<number | null>(null);
	const [phase, setPhase] = useState<GamePhase>("showing");
	const [resultWon, setResultWon] = useState(false);
	const [resultCash, setResultCash] = useState(0);
	const [resultMsg, setResultMsg] = useState("");

	const resultTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Generate sequence for a round and play it
	const playRound = useCallback((roundNum: number) => {
		const seq = generateSequence(roundNum);
		setSequence(seq);
		setPlayerInput([]);
		setPhase("showing");

		let i = 0;
		function showNext() {
			if (i >= seq.length) {
				setActivePad(null);
				setPhase("input");
				return;
			}
			setActivePad(seq[i] ?? null);
			setTimeout(() => {
				setActivePad(null);
				i++;
				setTimeout(showNext, 250);
			}, 450);
		}
		showNext();
	}, []);

	// Start first round on mount
	useEffect(() => {
		playRound(1);
	}, [playRound]);

	const finishGame = useCallback(
		(won: boolean, completedRound: number, fullWin: boolean) => {
			const cash = calculateReward(completedRound, won || fullWin);
			setResultWon(fullWin);
			setResultCash(cash);

			const gameState = useGameStore.getState().state;
			if (gameState) {
				const newSanity = fullWin ? Math.min(100, gameState.sanity + 5) : gameState.sanity;
				const logMsg = fullWin
					? `Busked 4 rounds — crowd went wild! +$${cash}, sanity +5`
					: won
					? `Busked ${completedRound} rounds then bailed. +$${cash}`
					: `Busked ${completedRound} round(s), missed a note. +$${cash}`;

				useGameStore.setState({
					state: {
						...gameState,
						cash: gameState.cash + cash,
						sanity: newSanity,
						buskDone: true,
					},
				});
				addLog(logMsg, false, fullWin || cash > 20);
				toast(fullWin ? `CROWD LOVES IT! +$${cash}` : `Busked for +$${cash}`, false);
			}

			const msg = fullWin
				? "FULL SET! CROWD GOES WILD!"
				: won
				? `Bailed after ${completedRound} round(s).`
				: "Wrong note — show over.";
			setResultMsg(msg);
			setPhase("result");

			resultTimerRef.current = setTimeout(() => {
				onEnd();
			}, 2000);
		},
		[addLog, onEnd],
	);

	const handlePadClick = useCallback(
		(padId: number) => {
			if (phase !== "input") return;

			const newInput = [...playerInput, padId];
			setActivePad(padId);
			setTimeout(() => setActivePad(null), 200);

			const { correct, complete } = checkInput(sequence, newInput);

			if (!correct) {
				// Wrong pad
				setPlayerInput(newInput);
				setPhase("between");
				setTimeout(() => {
					finishGame(false, round, false);
				}, 400);
				return;
			}

			setPlayerInput(newInput);

			if (complete) {
				setPhase("between");
				if (round >= 4) {
					// Won!
					setTimeout(() => {
						finishGame(true, round, true);
					}, 700);
				} else {
					// Next round
					setTimeout(() => {
						setRound(round + 1);
						playRound(round + 1);
					}, 700);
				}
			}
		},
		[phase, playerInput, sequence, round, finishGame, playRound],
	);

	const handleBail = useCallback(() => {
		if (phase !== "input" && phase !== "showing") return;
		finishGame(true, round, false);
	}, [phase, round, finishGame]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (resultTimerRef.current) clearTimeout(resultTimerRef.current);
		};
	}, []);

	const canBail = phase === "input" || phase === "showing";

	return (
		<div
			className="fixed inset-0 flex flex-col items-center justify-center bg-[#050510]"
			style={{ fontFamily: "monospace" }}
		>
			<div
				className="flex w-full max-w-[360px] flex-col items-center gap-5 p-6"
				style={{ border: "2px solid #ff6600", background: "#0a0a14" }}
			>
				{/* Header */}
				<h2 className="text-[18px] font-bold tracking-widest text-orange" style={{ textShadow: "0 0 8px #ff6600" }}>
					BUSK
				</h2>

				{/* Round indicator */}
				<div className="flex gap-2">
					{[1, 2, 3, 4].map((r) => (
						<div
							key={r}
							className="h-3 w-3 rounded-full"
							style={{
								background: r < round ? "#ff6600" : r === round ? "#ffaa00" : "#333",
								boxShadow: r === round ? "0 0 6px #ffaa00" : "none",
							}}
						/>
					))}
					<span className="ml-2 text-[11px] text-[#888]">Round {round}/4</span>
				</div>

				{/* Status */}
				<p className="text-center text-[12px]" style={{ color: phase === "showing" ? "#ffaa00" : "#888" }}>
					{phase === "showing" && "Watch the sequence..."}
					{phase === "input" && "Repeat the sequence!"}
					{phase === "between" && "..."}
					{phase === "result" && resultMsg}
				</p>

				{/* 2x2 Pad grid */}
				{phase !== "result" && (
					<div className="grid grid-cols-2 gap-3">
						{PAD_COLORS.map((pad) => {
							const isActive = activePad === pad.id;
							return (
								<button
									key={pad.id}
									type="button"
									onClick={() => handlePadClick(pad.id)}
									disabled={phase !== "input"}
									className="h-[100px] w-[130px] rounded-none transition-all duration-100 active:scale-95"
									style={{
										background: isActive ? pad.active : pad.inactive,
										border: `2px solid ${pad.border}`,
										boxShadow: isActive ? `0 0 20px ${pad.active}` : "none",
										cursor: phase === "input" ? "pointer" : "default",
									}}
								>
									<span
										className="text-[13px] font-bold"
										style={{ color: isActive ? "#000" : pad.border }}
									>
										{pad.label}
									</span>
								</button>
							);
						})}
					</div>
				)}

				{/* Result display */}
				{phase === "result" && (
					<div
						className="flex w-full flex-col items-center gap-2 py-4"
						style={{ border: `2px solid ${resultWon ? "#00ff44" : "#ff6600"}` }}
					>
						<p
							className="text-[20px] font-bold tracking-widest"
							style={{ color: resultWon ? "#00ff44" : "#ffaa00", textShadow: `0 0 10px ${resultWon ? "#00ff44" : "#ffaa00"}` }}
						>
							{resultMsg}
						</p>
						<p className="text-[15px] font-bold text-[#ffaa00]">+${resultCash}</p>
						{resultWon && <p className="text-[12px] text-[#00ff44]">Sanity +5</p>}
						<p className="text-[11px] text-[#555]">Returning to map...</p>
					</div>
				)}

				{/* Bail button */}
				{canBail && (
					<button
						type="button"
						onClick={handleBail}
						className="w-full py-2.5 text-[13px] font-bold tracking-widest active:opacity-75"
						style={{ border: "1px solid #555", color: "#888", background: "transparent" }}
					>
						BAIL OUT (+${calculateReward(round, true)})
					</button>
				)}
			</div>
		</div>
	);
}
