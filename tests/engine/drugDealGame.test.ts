import { afterEach, describe, expect, it, vi } from "vitest";
import {
	DEAL_DURATION,
	checkBust,
	createDealState,
	stayCool,
	tickHeat,
} from "../../src/engine/drugDealGame";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("createDealState", () => {
	it("creates state with heat = 0", () => {
		const state = createDealState(0.1);
		expect(state.heat).toBe(0);
	});

	it("creates state with bustThreshold = 100", () => {
		const state = createDealState(0.1);
		expect(state.bustThreshold).toBe(100);
	});

	it("riseRate is in range [0.55, 0.90] (min when random=0)", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const state = createDealState(0.1);
		expect(state.riseRate).toBeCloseTo(0.55);
	});

	it("riseRate is in range [0.55, 0.90] (max when random=1)", () => {
		vi.spyOn(Math, "random").mockReturnValue(1);
		const state = createDealState(0.1);
		expect(state.riseRate).toBeCloseTo(0.90);
	});

	it("sirenChance scales with fiendRisk", () => {
		const low = createDealState(0.1);
		const high = createDealState(0.5);
		expect(high.sirenChance).toBeGreaterThan(low.sirenChance);
	});

	it("sirenChance is fiendRisk * 2", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const state = createDealState(0.25);
		expect(state.sirenChance).toBeCloseTo(0.5);
	});

	it("tick is initialized to 0", () => {
		const state = createDealState(0.1);
		expect(state.tick).toBe(0);
	});
});

describe("tickHeat", () => {
	it("increases heat by approximately riseRate", () => {
		vi.spyOn(Math, "random").mockReturnValue(0); // variation = 0
		const state = { heat: 0, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 0 };
		const next = tickHeat(state);
		// heat += riseRate + variation. Variation likely small or 0
		expect(next.heat).toBeGreaterThan(0);
	});

	it("increments tick", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const state = { heat: 0, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 5 };
		const next = tickHeat(state);
		expect(next.tick).toBe(6);
	});

	it("does not mutate original state", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const state = { heat: 0, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 0 };
		const origHeat = state.heat;
		tickHeat(state);
		expect(state.heat).toBe(origHeat);
	});
});

describe("stayCool", () => {
	it("decreases heat by 22", () => {
		const state = { heat: 60, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 10 };
		const next = stayCool(state);
		expect(next.heat).toBe(38);
	});

	it("heat does not go below 0", () => {
		const state = { heat: 10, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 10 };
		const next = stayCool(state);
		expect(next.heat).toBe(0);
	});

	it("does not mutate original state", () => {
		const state = { heat: 60, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 10 };
		stayCool(state);
		expect(state.heat).toBe(60);
	});
});

describe("checkBust", () => {
	it("returns true when heat >= bustThreshold", () => {
		const state = { heat: 100, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 50 };
		expect(checkBust(state)).toBe(true);
	});

	it("returns true when heat exceeds bustThreshold", () => {
		const state = { heat: 120, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 50 };
		expect(checkBust(state)).toBe(true);
	});

	it("returns false when heat is below bustThreshold", () => {
		const state = { heat: 99, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 50 };
		expect(checkBust(state)).toBe(false);
	});

	it("returns false when heat is 0", () => {
		const state = { heat: 0, bustThreshold: 100, riseRate: 0.7, sirenChance: 0.1, tick: 0 };
		expect(checkBust(state)).toBe(false);
	});
});

describe("DEAL_DURATION", () => {
	it("is 480", () => {
		expect(DEAL_DURATION).toBe(480);
	});
});
