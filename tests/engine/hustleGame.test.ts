import { afterEach, describe, expect, it, vi } from "vitest";
import {
	checkHit,
	createHustleState,
	updateMarker,
} from "../../src/engine/hustleGame";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("createHustleState", () => {
	it("creates state with marker at 0", () => {
		const state = createHustleState(50);
		expect(state.marker).toBe(0);
	});

	it("creates state with speed 2.8", () => {
		const state = createHustleState(50);
		expect(state.speed).toBe(2.8);
	});

	it("calculates zone width as 10 + skill * 0.28", () => {
		const state = createHustleState(50);
		expect(state.zoneWidth).toBeCloseTo(10 + 50 * 0.28);
	});

	it("zone width scales with skill (higher skill = wider zone)", () => {
		const lowSkill = createHustleState(10);
		const highSkill = createHustleState(80);
		expect(highSkill.zoneWidth).toBeGreaterThan(lowSkill.zoneWidth);
	});

	it("zone center is 50", () => {
		const state = createHustleState(30);
		expect(state.zoneCenter).toBe(50);
	});

	it("direction is 1 initially", () => {
		const state = createHustleState(50);
		expect(state.direction).toBe(1);
	});
});

describe("updateMarker", () => {
	it("advances marker by speed * direction", () => {
		const state = createHustleState(50);
		// marker = 0, speed = 2.8, direction = 1
		const next = updateMarker(state);
		expect(next.marker).toBeCloseTo(2.8);
	});

	it("bounces at 100 (direction flips)", () => {
		// Set marker near 100 so it would overshoot
		const state = { ...createHustleState(50), marker: 98, direction: 1 as 1 | -1 };
		// After move: 98 + 2.8 = 100.8, bounce → direction = -1, marker clamped
		const next = updateMarker(state);
		expect(next.direction).toBe(-1);
		expect(next.marker).toBeLessThanOrEqual(100);
	});

	it("bounces at 0 (direction flips)", () => {
		const state = { ...createHustleState(50), marker: 1, direction: -1 as 1 | -1 };
		// 1 - 2.8 = -1.8, bounce → direction = 1
		const next = updateMarker(state);
		expect(next.direction).toBe(1);
		expect(next.marker).toBeGreaterThanOrEqual(0);
	});

	it("randomizes speed on bounce", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const state = { ...createHustleState(50), marker: 98, direction: 1 as 1 | -1 };
		const next = updateMarker(state);
		// speed = 2 + random * 3, random = 0.5 → 2 + 1.5 = 3.5
		expect(next.speed).toBeCloseTo(3.5);
	});

	it("does not mutate original state", () => {
		const state = createHustleState(50);
		const origMarker = state.marker;
		updateMarker(state);
		expect(state.marker).toBe(origMarker);
	});
});

describe("checkHit", () => {
	it("returns success when marker is within zone", () => {
		// zone center = 50, skill = 50 → zoneWidth = 24. Zone = [50-12, 50+12] = [38, 62]
		const state = { ...createHustleState(50), marker: 50 };
		vi.spyOn(Math, "random").mockReturnValue(0);
		const result = checkHit(state);
		expect(result.success).toBe(true);
	});

	it("returns failure when marker is outside zone", () => {
		// marker at 0, far outside zone [38, 62]
		const state = { ...createHustleState(50), marker: 0 };
		vi.spyOn(Math, "random").mockReturnValue(0);
		const result = checkHit(state);
		expect(result.success).toBe(false);
	});

	it("success reward is in range [60, 179]", () => {
		const state = { ...createHustleState(50), marker: 50 };
		// reward = 60 + floor(random * 120), random = 0.5 → 60 + 60 = 120
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const result = checkHit(state);
		expect(result.success).toBe(true);
		expect(result.reward).toBe(120);
		expect(result.reward).toBeGreaterThanOrEqual(60);
		expect(result.reward).toBeLessThanOrEqual(179);
	});

	it("failure penalty is in range [20, 49] (returned as negative)", () => {
		const state = { ...createHustleState(50), marker: 0 };
		// penalty = 20 + floor(random * 30), random = 0.5 → 20 + 15 = 35
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const result = checkHit(state);
		expect(result.success).toBe(false);
		expect(result.reward).toBe(-35);
	});

	it("success at zone boundary (exactly at edge)", () => {
		// zone = [50 - 12, 50 + 12] = [38, 62]. Marker at 38 should succeed.
		const state = { ...createHustleState(50), marker: 38 };
		vi.spyOn(Math, "random").mockReturnValue(0);
		const result = checkHit(state);
		expect(result.success).toBe(true);
	});
});
