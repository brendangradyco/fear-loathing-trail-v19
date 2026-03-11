import { create } from "zustand";
import { applyEffects, resolveEventChoice } from "../engine/eventResolver";
import { checkDeath, checkWin, createNewGame, rest, travel } from "../engine/gameLoop";
import { contractDisease, cureDisease } from "../engine/diseaseEngine";
import {
	buyDrug,
	cookDrug,
	harvestDrug,
	sellDrug,
	startGrow,
	startStill,
} from "../engine/drugEconomy";
import type { Disease, DrugDef, Fiend, GameEvent, GameState, LogEntry, MedicineItem, ShopItem, SkillSet } from "../types";
import { DrugType, Phase, RationType } from "../types";
import { clearGame, loadGame, saveGame } from "../utils/storage";

interface GameStore {
	state: GameState | null;
	currentEvent: GameEvent | null;
	deathReason: "fuel" | "sanity" | null;

	startGame: (playerId: string, playerName: string, skills: SkillSet) => void;
	resumeGame: (saved: GameState, playerId: string, playerName: string) => void;
	doTravel: () => GameEvent | null;
	doRest: () => void;
	doResolveEvent: (choiceId: string) => string;
	doBuyItem: (item: ShopItem) => boolean;
	addHuntReward: (meat: number, ammoRemaining: number) => void;
	addLog: (txt: string, bad?: boolean, good?: boolean) => void;
	finishGame: () => void;
	clearEvent: () => void;
	resetGame: () => void;
	syncFromNetwork: (remoteState: GameState) => void;
	// Drug economy actions
	buyDrug: (drug: DrugDef, qty: number) => void;
	sellDrug: (drug: DrugDef, qty: number, fiend: Fiend) => { busted: boolean; earnings: number };
	startGrow: () => void;
	startStill: () => void;
	harvestDrug: (type: DrugType.Weed | DrugType.Shine) => void;
	cookDrug: (type: DrugType.Meth | DrugType.Coke) => void;
	// Disease actions
	contractDisease: (disease: Disease) => void;
	cureDisease: (disease: Disease) => void;
	buyMedicine: (medicine: MedicineItem) => boolean;
	// Ration action
	setRation: (tier: RationType) => void;
}

function capLog(log: LogEntry[]): LogEntry[] {
	return log.length > 50 ? log.slice(-50) : log;
}

export const useGameStore = create<GameStore>((set, get) => ({
	state: null,
	currentEvent: null,
	deathReason: null,

	startGame: (playerId, playerName, skills) => {
		const state = createNewGame(skills, playerId, playerName);
		set({ state, currentEvent: null, deathReason: null });
		saveGame(state);
	},

	resumeGame: (saved, playerId, playerName) => {
		const state = {
			...saved,
			players: {
				...saved.players,
				[playerId]: { name: playerName, alive: true },
			},
		};
		set({ state, currentEvent: null, deathReason: null });
		saveGame(state);
	},

	doTravel: () => {
		const { state: current } = get();
		if (!current) return null;

		if (checkWin(current)) {
			const won = { ...current, phase: Phase.WIN };
			set({ state: won });
			saveGame(won);
			return null;
		}

		const { state: next, triggeredEvent } = travel(current);

		const death = checkDeath(next);
		if (death) {
			const dead = { ...next, phase: Phase.DEAD };
			set({ state: dead, deathReason: death });
			saveGame(dead);
			return null;
		}

		set({ state: next, currentEvent: triggeredEvent });
		saveGame(next);
		return triggeredEvent;
	},

	doRest: () => {
		const { state: current } = get();
		if (!current) return;

		const next = rest(current);
		const death = checkDeath(next);
		if (death) {
			const dead = { ...next, phase: Phase.DEAD };
			set({ state: dead, deathReason: death });
			saveGame(dead);
			return;
		}
		set({ state: next });
		saveGame(next);
	},

	doResolveEvent: (choiceId) => {
		const { state: current, currentEvent } = get();
		if (!current || !currentEvent) return "Nothing happened.";

		const { newState, text } = resolveEventChoice(current, currentEvent, choiceId);
		const withPhase = { ...newState, phase: Phase.TRAVEL };

		const death = checkDeath(withPhase);
		if (death) {
			const dead = { ...withPhase, phase: Phase.DEAD };
			set({ state: dead, currentEvent: null, deathReason: death });
			saveGame(dead);
			return text;
		}

		set({ state: withPhase, currentEvent: null });
		saveGame(withPhase);
		return text;
	},

	doBuyItem: (item) => {
		const { state: current } = get();
		if (!current || current.cash < item.price) return false;

		// Deduct cost
		let next: GameState = { ...current, cash: current.cash - item.price };

		// Apply additive effects
		next = applyEffects(next, item.effects);

		// Apply absolute/set effects (e.g., fuel: 100)
		if (item.setEffects) {
			const se = item.setEffects;
			if (se.fuel !== undefined) next = { ...next, fuel: se.fuel };
			if (se.sanity !== undefined) next = { ...next, sanity: se.sanity };
			if (se.cash !== undefined) next = { ...next, cash: se.cash };
			if (se.supplies !== undefined) next = { ...next, supplies: se.supplies };
			if (se.disguises !== undefined) next = { ...next, disguises: se.disguises };
			if (se.laserAmmo !== undefined) next = { ...next, laserAmmo: se.laserAmmo };
			if (se.meat !== undefined) next = { ...next, meat: se.meat };
		}

		// Handle side effects (e.g., adrenochrome bad trip)
		if (item.sideEffect && Math.random() < item.sideEffect.chance) {
			next = applyEffects(next, item.sideEffect.effects);
		}

		set({ state: next });
		saveGame(next);
		return true;
	},

	addHuntReward: (meat, ammoRemaining) => {
		const { state: current } = get();
		if (!current) return;

		const next: GameState = {
			...current,
			meat: current.meat + meat,
			supplies: current.supplies + Math.floor(meat / 2),
			laserAmmo: ammoRemaining,
			phase: Phase.TRAVEL,
		};
		set({ state: next });
		saveGame(next);
	},

	addLog: (txt, bad = false, good = false) => {
		const { state: current } = get();
		if (!current) return;

		const entry: LogEntry = { txt, bad, good };
		const next: GameState = {
			...current,
			log: capLog([...current.log, entry]),
		};
		set({ state: next });
	},

	finishGame: () => {
		const { state: current } = get();
		if (!current) return;

		const next = { ...current, phase: Phase.WIN };
		set({ state: next });
		saveGame(next);
	},

	clearEvent: () => {
		set({ currentEvent: null });
	},

	resetGame: () => {
		set({ state: null, currentEvent: null, deathReason: null });
		clearGame();
	},

	syncFromNetwork: (remoteState) => {
		set({ state: remoteState });
		saveGame(remoteState);
	},

	// -----------------------------------------------------------
	// Drug economy actions
	// -----------------------------------------------------------

	buyDrug: (drug, qty) => {
		const { state: current } = get();
		if (!current) return;
		const next = buyDrug(current, drug, qty);
		set({ state: next });
		saveGame(next);
	},

	sellDrug: (drug, qty, fiend) => {
		const { state: current } = get();
		if (!current) return { busted: false, earnings: 0 };
		const result = sellDrug(current, drug, qty, fiend);
		set({ state: result.newState });
		saveGame(result.newState);
		return { busted: result.busted, earnings: result.earnings };
	},

	startGrow: () => {
		const { state: current } = get();
		if (!current) return;
		const next = startGrow(current);
		set({ state: next });
		saveGame(next);
	},

	startStill: () => {
		const { state: current } = get();
		if (!current) return;
		const next = startStill(current);
		set({ state: next });
		saveGame(next);
	},

	harvestDrug: (type) => {
		const { state: current } = get();
		if (!current) return;
		const next = harvestDrug(current, type);
		set({ state: next });
		saveGame(next);
	},

	cookDrug: (type) => {
		const { state: current } = get();
		if (!current) return;
		const next = cookDrug(current, type);
		set({ state: next });
		saveGame(next);
	},

	// -----------------------------------------------------------
	// Disease actions
	// -----------------------------------------------------------

	contractDisease: (disease) => {
		const { state: current } = get();
		if (!current) return;
		const next = contractDisease(current, disease);
		set({ state: next });
		saveGame(next);
	},

	cureDisease: (disease) => {
		const { state: current } = get();
		if (!current) return;
		const next = cureDisease(current, disease);
		set({ state: next });
		saveGame(next);
	},

	buyMedicine: (medicine) => {
		const { state: current } = get();
		if (!current || current.cash < medicine.price) return false;

		let next: GameState = { ...current, cash: current.cash - medicine.price };

		// Cure each disease this medicine treats
		for (const disease of medicine.cures) {
			next = cureDisease(next, disease);
		}

		// Apply sanity bonus
		if (medicine.sanityBonus) {
			next = { ...next, sanity: Math.min(100, next.sanity + medicine.sanityBonus) };
		}

		set({ state: next });
		saveGame(next);
		return true;
	},

	// -----------------------------------------------------------
	// Ration action
	// -----------------------------------------------------------

	setRation: (tier) => {
		const { state: current } = get();
		if (!current) return;
		const next: GameState = { ...current, rationTier: tier };
		set({ state: next });
		saveGame(next);
	},
}));

// Export loadGame for use by components that need to check for saved games
export { loadGame };
