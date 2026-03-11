import { describe, expect, it } from "vitest";
import { CFG } from "../../src/data/constants";
import {
	applyDiseaseDrain,
	contractDisease,
	cureDisease,
} from "../../src/engine/diseaseEngine";
import type { GameState } from "../../src/types";
import { Disease, Phase, RationType } from "../../src/types";

function makeState(overrides: Partial<GameState> = {}): GameState {
	return {
		phase: Phase.TRAVEL,
		stopIdx: 0,
		fuel: 80,
		sanity: 80,
		cash: 500,
		supplies: 5,
		disguises: 2,
		laserAmmo: 10,
		meat: 0,
		skills: { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 },
		log: [],
		players: {},
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
		...overrides,
	};
}

describe("applyDiseaseDrain", () => {
	it("returns state unchanged when no diseases", () => {
		const state = makeState({ sanity: 80, diseases: [] });
		const result = applyDiseaseDrain(state);
		expect(result).toBe(state);
	});

	it("drains 8 sanity per disease (1 disease)", () => {
		const state = makeState({ sanity: 80, diseases: [Disease.TB] });
		const result = applyDiseaseDrain(state);
		expect(result.sanity).toBe(80 - CFG.DISEASE_SANITY_DRAIN);
	});

	it("drains 16 sanity for 2 diseases", () => {
		const state = makeState({ sanity: 80, diseases: [Disease.TB, Disease.Measles] });
		const result = applyDiseaseDrain(state);
		expect(result.sanity).toBe(80 - 2 * CFG.DISEASE_SANITY_DRAIN);
	});

	it("drains 24 sanity for 3 diseases and clamps to 0 when sanity low", () => {
		const state = makeState({ sanity: 20, diseases: [Disease.TB, Disease.Measles, Disease.AIDS] });
		const result = applyDiseaseDrain(state);
		// 20 - 24 = -4, clamped to 0
		expect(result.sanity).toBe(0);
	});

	it("clamps sanity to 0 minimum", () => {
		const state = makeState({ sanity: 5, diseases: [Disease.TB] });
		const result = applyDiseaseDrain(state);
		expect(result.sanity).toBe(0);
	});

	it("does not mutate original state", () => {
		const state = makeState({ sanity: 80, diseases: [Disease.TB] });
		const origSanity = state.sanity;
		applyDiseaseDrain(state);
		expect(state.sanity).toBe(origSanity);
	});
});

describe("contractDisease", () => {
	it("adds a disease to the diseases array", () => {
		const state = makeState({ diseases: [] });
		const result = contractDisease(state, Disease.TB);
		expect(result.diseases).toContain(Disease.TB);
		expect(result.diseases).toHaveLength(1);
	});

	it("does not add a duplicate disease", () => {
		const state = makeState({ diseases: [Disease.TB] });
		const result = contractDisease(state, Disease.TB);
		expect(result).toBe(state); // same reference
	});

	it("adds multiple distinct diseases", () => {
		const state = makeState({ diseases: [Disease.TB] });
		const result = contractDisease(state, Disease.Measles);
		expect(result.diseases).toContain(Disease.TB);
		expect(result.diseases).toContain(Disease.Measles);
		expect(result.diseases).toHaveLength(2);
	});

	it("does not mutate original state", () => {
		const state = makeState({ diseases: [] });
		contractDisease(state, Disease.TB);
		expect(state.diseases).toHaveLength(0);
	});
});

describe("cureDisease", () => {
	it("removes an existing disease", () => {
		const state = makeState({ diseases: [Disease.TB, Disease.Measles] });
		const result = cureDisease(state, Disease.TB);
		expect(result.diseases).not.toContain(Disease.TB);
		expect(result.diseases).toContain(Disease.Measles);
	});

	it("returns state unchanged if disease not present", () => {
		const state = makeState({ diseases: [Disease.Measles] });
		const result = cureDisease(state, Disease.TB);
		expect(result).toBe(state); // same reference
	});

	it("returns empty diseases array after curing last disease", () => {
		const state = makeState({ diseases: [Disease.TB] });
		const result = cureDisease(state, Disease.TB);
		expect(result.diseases).toHaveLength(0);
	});

	it("does not mutate original state", () => {
		const state = makeState({ diseases: [Disease.TB] });
		const origDiseases = [...state.diseases];
		cureDisease(state, Disease.TB);
		expect(state.diseases).toEqual(origDiseases);
	});
});
