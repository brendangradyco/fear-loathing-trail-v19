import type { GameState } from "../types";
import { type Disease } from "../types";
import { CFG } from "../data/constants";
import { clamp } from "../utils/clamp";

export function applyDiseaseDrain(state: GameState): GameState {
	if (state.diseases.length === 0) return state;
	const drain = state.diseases.length * CFG.DISEASE_SANITY_DRAIN;
	return { ...state, sanity: clamp(state.sanity - drain, 0, 100) };
}

export function contractDisease(state: GameState, disease: Disease): GameState {
	if (state.diseases.includes(disease)) return state;
	return { ...state, diseases: [...state.diseases, disease] };
}

export function cureDisease(state: GameState, disease: Disease): GameState {
	if (!state.diseases.includes(disease)) return state;
	return { ...state, diseases: state.diseases.filter((d) => d !== disease) };
}
