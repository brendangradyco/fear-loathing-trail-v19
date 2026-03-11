export interface HustleState {
	marker: number; // 0-100
	speed: number;
	direction: 1 | -1;
	zoneWidth: number;
	zoneCenter: number;
}

export function createHustleState(smoothSkill: number): HustleState {
	return {
		marker: 0,
		speed: 2.8,
		direction: 1,
		zoneWidth: 10 + smoothSkill * 0.28,
		zoneCenter: 50,
	};
}

export function updateMarker(state: HustleState): HustleState {
	let marker = state.marker + state.speed * state.direction;
	let direction = state.direction;
	let speed = state.speed;

	if (marker >= 100 || marker <= 0) {
		direction = direction === 1 ? -1 : 1;
		marker = Math.max(0, Math.min(100, marker));
		speed = 2 + Math.random() * 3;
	}

	return { ...state, marker, direction, speed };
}

export function checkHit(state: HustleState): { success: boolean; reward: number } {
	const half = state.zoneWidth / 2;
	const inZone = state.marker >= state.zoneCenter - half && state.marker <= state.zoneCenter + half;

	if (inZone) {
		const reward = 60 + Math.floor(Math.random() * 120); // 60-179
		return { success: true, reward };
	}

	const penalty = 20 + Math.floor(Math.random() * 30); // 20-49
	return { success: false, reward: -penalty };
}
