import { describe, expect, it } from "vitest";
import { consumeRations } from "../../src/engine/rationEngine";
import type { GameState } from "../../src/types";
import { Phase, RationType } from "../../src/types";

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

describe("consumeRations", () => {
	it("TinyTim: costs 0 supplies, applies -5 sanity", () => {
		const state = makeState({ supplies: 5, sanity: 80, rationTier: RationType.TinyTim });
		const result = consumeRations(state);
		expect(result.supplies).toBe(5); // supplyCost = 0
		expect(result.sanity).toBe(75); // sanityBonus = -5
	});

	it("Normal: costs 1 supply, applies 0 sanity", () => {
		const state = makeState({ supplies: 5, sanity: 80, rationTier: RationType.Normal });
		const result = consumeRations(state);
		expect(result.supplies).toBe(4);
		expect(result.sanity).toBe(80);
	});

	it("Fat: costs 2 supplies, applies +5 sanity", () => {
		const state = makeState({ supplies: 5, sanity: 80, rationTier: RationType.Fat });
		const result = consumeRations(state);
		expect(result.supplies).toBe(3);
		expect(result.sanity).toBe(85);
	});

	it("CholesterolDaddy: costs 3 supplies, applies +10 sanity", () => {
		const state = makeState({ supplies: 5, sanity: 80, rationTier: RationType.CholesterolDaddy });
		const result = consumeRations(state);
		expect(result.supplies).toBe(2);
		expect(result.sanity).toBe(90);
	});

	it("supplies do not go below 0", () => {
		const state = makeState({ supplies: 0, sanity: 80, rationTier: RationType.CholesterolDaddy });
		const result = consumeRations(state);
		expect(result.supplies).toBe(0);
	});

	it("sanity clamped to 100 maximum", () => {
		const state = makeState({ supplies: 5, sanity: 98, rationTier: RationType.CholesterolDaddy });
		const result = consumeRations(state);
		expect(result.sanity).toBe(100);
	});

	it("sanity clamped to 0 minimum (TinyTim at very low sanity)", () => {
		const state = makeState({ supplies: 5, sanity: 3, rationTier: RationType.TinyTim });
		const result = consumeRations(state);
		expect(result.sanity).toBe(0);
	});

	it("does not mutate original state", () => {
		const state = makeState({ supplies: 5, sanity: 80, rationTier: RationType.Fat });
		const origSupplies = state.supplies;
		const origSanity = state.sanity;
		consumeRations(state);
		expect(state.supplies).toBe(origSupplies);
		expect(state.sanity).toBe(origSanity);
	});
});
