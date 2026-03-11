import type { GameState } from "../types";
import { RATIONS } from "../data/rations";
import { clamp } from "../utils/clamp";

export function consumeRations(state: GameState): GameState {
	const ration = RATIONS.find((r) => r.id === state.rationTier);
	if (!ration) return state;
	return {
		...state,
		supplies: Math.max(0, state.supplies - ration.supplyCost),
		sanity: clamp(state.sanity + ration.sanityBonus, 0, 100),
	};
}
