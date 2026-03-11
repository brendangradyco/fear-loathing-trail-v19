import type { DrugDef, Fiend, GameState } from "../types";
import { DrugType } from "../types";
import { getDrugPriceModifier } from "../data/drugs";
import { clamp } from "../utils/clamp";

export function buyDrug(state: GameState, drug: DrugDef, qty: number): GameState {
	const modifier = getDrugPriceModifier(state.stopIdx);
	const totalCost = Math.floor(drug.buy * modifier.buy) * qty;
	if (state.cash < totalCost) return state;
	return {
		...state,
		cash: state.cash - totalCost,
		drugInventory: {
			...state.drugInventory,
			[drug.id]: state.drugInventory[drug.id] + qty,
		},
	};
}

export function sellDrug(
	state: GameState,
	drug: DrugDef,
	qty: number,
	fiend: Fiend,
): { newState: GameState; busted: boolean; earnings: number } {
	const actualQty = Math.min(qty, state.drugInventory[drug.id]);
	if (actualQty <= 0) return { newState: state, busted: false, earnings: 0 };

	const modifier = getDrugPriceModifier(state.stopIdx);
	const pricePerUnit = Math.floor(drug.sell * modifier.sell * fiend.mult);
	const earnings = pricePerUnit * actualQty;
	// NOTE: This bust is the quick-sell bust check (fiend risk %).
	// The Drug Deal MINIGAME has its own separate bust mechanic (heat meter).
	const busted = Math.random() < fiend.risk;

	if (busted) {
		const fine = 80 + Math.floor(Math.random() * 120);
		return {
			newState: {
				...state,
				drugInventory: { ...state.drugInventory, [drug.id]: 0 },
				cash: Math.max(0, state.cash - fine),
				sanity: clamp(state.sanity - 15, 0, 100),
			},
			busted: true,
			earnings: 0,
		};
	}

	return {
		newState: {
			...state,
			drugInventory: {
				...state.drugInventory,
				[drug.id]: state.drugInventory[drug.id] - actualQty,
			},
			cash: state.cash + earnings,
		},
		busted: false,
		earnings,
	};
}

export function startGrow(state: GameState): GameState {
	if (state.drugStatus.weedReadyAt >= 0) return state;
	return {
		...state,
		drugStatus: { ...state.drugStatus, weedReadyAt: state.stopIdx + 2 },
	};
}

export function startStill(state: GameState): GameState {
	if (state.drugStatus.shineReadyAt >= 0) return state;
	return {
		...state,
		drugStatus: { ...state.drugStatus, shineReadyAt: state.stopIdx + 1 },
	};
}

export function harvestDrug(state: GameState, type: DrugType.Weed | DrugType.Shine): GameState {
	if (type === DrugType.Weed) {
		if (state.drugStatus.weedReadyAt < 0 || state.stopIdx < state.drugStatus.weedReadyAt) return state;
		const yield_ = 4 + Math.floor(Math.random() * 5); // 4-8
		return {
			...state,
			drugInventory: { ...state.drugInventory, weed: state.drugInventory.weed + yield_ },
			drugStatus: { ...state.drugStatus, weedReadyAt: -1 },
		};
	}
	if (state.drugStatus.shineReadyAt < 0 || state.stopIdx < state.drugStatus.shineReadyAt) return state;
	const yield_ = 5 + Math.floor(Math.random() * 6); // 5-10
	return {
		...state,
		drugInventory: { ...state.drugInventory, shine: state.drugInventory.shine + yield_ },
		drugStatus: { ...state.drugStatus, shineReadyAt: -1 },
	};
}

export function cookDrug(state: GameState, type: DrugType.Meth | DrugType.Coke): GameState {
	if (type === DrugType.Meth) {
		if (state.methCookUsed) return state;
		if (state.cash < 40) return state;
		const yield_ = 2 + Math.floor(Math.random() * 3); // 2-4
		return {
			...state,
			cash: state.cash - 40,
			drugInventory: { ...state.drugInventory, meth: state.drugInventory.meth + yield_ },
			methCookUsed: true,
		};
	}
	if (state.cokeCookUsed) return state;
	if (state.cash < 50) return state;
	const yield_ = 2 + Math.floor(Math.random() * 3); // 2-4
	return {
		...state,
		cash: state.cash - 50,
		drugInventory: { ...state.drugInventory, coke: state.drugInventory.coke + yield_ },
		cokeCookUsed: true,
	};
}
