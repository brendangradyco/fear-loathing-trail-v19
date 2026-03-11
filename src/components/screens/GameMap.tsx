import { useCallback, useState } from "react";
import { TRAIL_STOPS } from "../../data/trailStops";
import { useGameStore } from "../../stores/gameStore";
import { useNetworkStore } from "../../stores/networkStore";
import DiseaseIndicator from "../game/DiseaseIndicator";
import DrugInventory from "../game/DrugInventory";
import EventModal from "../game/EventModal";
import GameLog from "../game/GameLog";
import RationSelector from "../game/RationSelector";
import StatsBar from "../game/StatsBar";
import TrailMap from "../game/TrailMap";
import { toast } from "../shared/Toast";

interface GameMapProps {
	onShop: () => void;
	onHunt: () => void;
	onHustle: () => void;
	onBusk: () => void;
}

export default function GameMap({ onShop, onHunt, onHustle, onBusk }: GameMapProps) {
	const [rationOpen, setRationOpen] = useState(false);

	const state = useGameStore((s) => s.state);
	const currentEvent = useGameStore((s) => s.currentEvent);
	const doTravel = useGameStore((s) => s.doTravel);
	const doRest = useGameStore((s) => s.doRest);
	const addLog = useGameStore((s) => s.addLog);
	const finishGame = useGameStore((s) => s.finishGame);

	const peers = useNetworkStore((s) => s.peers);
	const sendShankAlert = useNetworkStore((s) => s.sendShankAlert);
	const isMultiplayer = Object.keys(peers).length > 0;

	const handleTravel = useCallback(() => {
		if (!state) return;
		if (state.stopIdx >= TRAIL_STOPS.length - 1) return;
		const nextStop = TRAIL_STOPS[state.stopIdx + 1];
		doTravel();
		if (nextStop) {
			addLog(`Arrived at ${nextStop.name}`, false, true);
		}
	}, [state, doTravel, addLog]);

	const handleRest = useCallback(() => {
		doRest();
		addLog("Rested. Sanity +15. Fuel -5.", false, true);
		toast("Rested. Sanity +15, Fuel -5.");
	}, [doRest, addLog]);

	const handleFinish = useCallback(() => {
		finishGame();
	}, [finishGame]);

	const handleHunt = useCallback(() => {
		if (!state) return;
		if (state.laserAmmo <= 0) {
			toast("No laser ammo!", true);
			return;
		}
		onHunt();
	}, [state, onHunt]);

	const handleHustle = useCallback(() => {
		if (!state) return;
		if (state.hustleDone) {
			toast("Already hustled this stop.", true);
			return;
		}
		if (state.shankStunned) {
			toast("Still stunned from shank!", true);
			return;
		}
		onHustle();
	}, [state, onHustle]);

	const handleBusk = useCallback(() => {
		if (!state) return;
		if (state.buskDone) {
			toast("Already busked this stop.", true);
			return;
		}
		if (state.shankStunned) {
			toast("Still stunned from shank!", true);
			return;
		}
		onBusk();
	}, [state, onBusk]);

	const handleShank = useCallback(() => {
		if (!state) return;
		if (state.shankCooldown) {
			toast("Shank on cooldown.", true);
			return;
		}
		const peerIds = Object.keys(peers);
		if (peerIds.length === 0) return;
		const target = peerIds[Math.floor(Math.random() * peerIds.length)];
		if (!target) return;
		sendShankAlert(target);
		toast("Shank thrown!");
	}, [state, peers, sendShankAlert]);

	if (!state) return null;

	const stop = TRAIL_STOPS[state.stopIdx];
	const nextStop = TRAIL_STOPS[state.stopIdx + 1];
	const canTravel = state.stopIdx < TRAIL_STOPS.length - 1;

	const hustleDisabled = state.hustleDone || state.shankStunned;
	const buskDisabled = state.buskDone || state.shankStunned;
	const shankDisabled = state.shankCooldown;

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Stats bar */}
			<StatsBar />

			{/* Trail map */}
			<TrailMap currentIdx={state.stopIdx} />

			{/* Action area */}
			<div className="flex-1 overflow-y-auto p-2.5">
				{/* Current event or travel UI */}
				{currentEvent ? (
					<EventModal event={currentEvent} />
				) : (
					<>
						{/* Stop info + disease/drug indicators */}
						{stop && (
							<div className="mb-2 rounded-lg bg-surface2 px-3 py-2.5 text-[12px] text-dim">
								<div className="text-sm font-bold text-orange">
									{stop.emoji} {stop.name}
								</div>
								<div className="mt-1 text-[11px]">{stop.desc}</div>
								<div className="mt-2 flex flex-wrap gap-2">
									<DiseaseIndicator />
									<DrugInventory />
								</div>
							</div>
						)}

						{/* Action buttons */}
						<div className="mb-2.5 grid grid-cols-2 gap-2">
							{canTravel ? (
								<button
									type="button"
									onClick={handleTravel}
									className="rounded-lg bg-orange p-3 text-sm font-bold text-black active:opacity-75"
								>
									Drive to {nextStop?.name ?? "Next Stop"}
								</button>
							) : (
								<button
									type="button"
									onClick={handleFinish}
									className="rounded-lg bg-green p-3 text-sm font-bold text-black active:opacity-75"
								>
									{"🏁"} REACH BOGOTA
								</button>
							)}
							<button
								type="button"
								onClick={handleRest}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75"
							>
								{"😴"} Rest (+sanity)
							</button>
							<button
								type="button"
								onClick={onShop}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75"
							>
								{"🛒"} Shop
							</button>
							<button
								type="button"
								onClick={handleHunt}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75"
							>
								{"🔫"} Hunt
							</button>
							<button
								type="button"
								onClick={handleHustle}
								disabled={hustleDisabled}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75 disabled:opacity-40"
							>
								{"💼"} Hustle
							</button>
							<button
								type="button"
								onClick={handleBusk}
								disabled={buskDisabled}
								className="rounded-md border border-orange bg-transparent p-2.5 text-sm text-orange active:opacity-75 disabled:opacity-40"
							>
								{"🎸"} Busk
							</button>
							{isMultiplayer && (
								<button
									type="button"
									onClick={handleShank}
									disabled={shankDisabled}
									className="col-span-2 rounded-md border border-red bg-transparent p-2.5 text-sm text-red active:opacity-75 disabled:opacity-40"
								>
									{"🔪"} Shank
								</button>
							)}
						</div>

						{/* Ration selector (collapsible) */}
						<div className="mb-2.5 rounded-lg border border-border bg-surface2">
							<button
								type="button"
								onClick={() => setRationOpen((v) => !v)}
								className="flex w-full items-center justify-between px-3 py-2.5 text-[12px] font-bold text-dim"
							>
								<span>
									{"🍖"} Rations: {state.rationTier}
								</span>
								<span>{rationOpen ? "▲" : "▼"}</span>
							</button>
							{rationOpen && (
								<div className="border-t border-border p-2.5">
									<RationSelector />
								</div>
							)}
						</div>
					</>
				)}

				{/* Game log */}
				<GameLog entries={state.log} />
			</div>
		</div>
	);
}
