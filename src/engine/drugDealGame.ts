export interface DealState {
	heat: number;
	bustThreshold: number;
	riseRate: number;
	sirenChance: number;
	tick: number;
}

export const DEAL_DURATION = 480;

export function createDealState(fiendRisk: number): DealState {
	// riseRate range [0.55, 0.90]
	const riseRate = 0.55 + Math.random() * 0.35;
	return {
		heat: 0,
		bustThreshold: 100,
		riseRate,
		sirenChance: fiendRisk * 2,
		tick: 0,
	};
}

export function tickHeat(state: DealState): DealState {
	const variation = (Math.random() - 0.5) * 0.2;
	let heat = state.heat + state.riseRate + variation;
	const tick = state.tick + 1;

	// Every 120 ticks: siren spike chance (+15)
	if (tick % 120 === 0 && Math.random() < state.sirenChance) {
		heat += 15;
	}

	return { ...state, heat, tick };
}

export function stayCool(state: DealState): DealState {
	return { ...state, heat: Math.max(0, state.heat - 22) };
}

export function checkBust(state: DealState): boolean {
	return state.heat >= state.bustThreshold;
}
