import { CFG } from "../data/constants";
import { EVENTS } from "../data/events";
import { RATIONS } from "../data/rations";
import { TRAIL_STOPS } from "../data/trailStops";
import type { GameEvent, GameState, SkillSet } from "../types";
import { Phase, RationType } from "../types";
import { clamp } from "../utils/clamp";

export function createNewGame(skills: SkillSet, playerId: string, playerName: string): GameState {
	return {
		phase: Phase.TRAVEL,
		stopIdx: 0,
		fuel: CFG.STARTING_FUEL,
		sanity: CFG.STARTING_SANITY,
		cash: CFG.STARTING_CASH,
		supplies: CFG.STARTING_SUPPLIES,
		disguises: CFG.STARTING_DISGUISES,
		laserAmmo: CFG.STARTING_LASER_AMMO,
		meat: 0,
		skills,
		log: [],
		players: { [playerId]: { name: playerName, alive: true } },
		drugInventory: { weed: 0, coke: 0, meth: 0, shine: 0, pills: 0 },
		drugStatus: { weedReadyAt: -1, shineReadyAt: -1 },
		diseases: [],
		rationTier: RationType.Normal,
		shankCooldown: false,
		shankStunned: false,
		hustleDone: false,
		buskDone: false,
		methCookUsed: false,
		cokeCookUsed: false,
	};
}

export function travel(state: GameState): { state: GameState; triggeredEvent: GameEvent | null } {
	if (state.stopIdx >= TRAIL_STOPS.length - 1) {
		return { state, triggeredEvent: null };
	}

	const fuelVariance = CFG.FUEL_PER_LEG_MAX - CFG.FUEL_PER_LEG_MIN;
	const fuelCost = CFG.FUEL_PER_LEG_MIN + Math.floor(Math.random() * (fuelVariance + 1));

	// Consume rations
	const rationDef = RATIONS.find((r) => r.id === state.rationTier);
	const suppliesAfterRation = rationDef ? Math.max(0, state.supplies - rationDef.supplyCost) : state.supplies;
	const sanityAfterRation = rationDef ? state.sanity + rationDef.sanityBonus : state.sanity;

	// Apply disease drain: -8 sanity per disease
	const diseaseDrain = state.diseases.length * CFG.DISEASE_SANITY_DRAIN;
	const sanityAfterDiseases = sanityAfterRation - diseaseDrain;

	const next: GameState = {
		...state,
		stopIdx: state.stopIdx + 1,
		fuel: clamp(state.fuel - fuelCost, 0, 100),
		supplies: suppliesAfterRation,
		sanity: clamp(sanityAfterDiseases, 0, 100),
		// Reset per-stop cooldowns
		shankCooldown: false,
		shankStunned: false,
		hustleDone: false,
		buskDone: false,
		methCookUsed: false,
		cokeCookUsed: false,
	};

	// Random event chance
	if (Math.random() < CFG.EVENT_CHANCE) {
		const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
		if (ev) {
			next.phase = Phase.EVENT;
			return { state: next, triggeredEvent: ev };
		}
	}

	next.phase = Phase.TRAVEL;
	return { state: next, triggeredEvent: null };
}

export function rest(state: GameState): GameState {
	return {
		...state,
		sanity: clamp(state.sanity + CFG.REST_SANITY_GAIN, 0, 100),
		fuel: Math.max(0, state.fuel - CFG.REST_FUEL_COST),
	};
}

export function checkDeath(state: GameState): "fuel" | "sanity" | null {
	if (state.fuel <= 0) return "fuel";
	if (state.sanity <= 0) return "sanity";
	return null;
}

export function checkWin(state: GameState): boolean {
	return state.stopIdx >= TRAIL_STOPS.length - 1;
}
