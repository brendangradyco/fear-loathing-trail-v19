import { afterEach, describe, expect, it, vi } from "vitest";
import { attemptShank } from "../../src/engine/shankEngine";
import type { GameState } from "../../src/types";
import { Phase, RationType } from "../../src/types";

function makeState(overrides: Partial<GameState> = {}): GameState {
	return {
		phase: Phase.TRAVEL,
		stopIdx: 3,
		fuel: 80,
		sanity: 80,
		cash: 300,
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

afterEach(() => {
	vi.restoreAllMocks();
});

describe("attemptShank — dodged", () => {
	it("returns 'dodged' outcome", () => {
		const state = makeState({ sanity: 80 });
		const result = attemptShank(state, true);
		expect(result.outcome).toBe("dodged");
	});

	it("deducts 15 sanity on dodge", () => {
		const state = makeState({ sanity: 80 });
		const result = attemptShank(state, true);
		expect(result.attackerState.sanity).toBe(65);
	});

	it("clamps sanity to 0 when dodge penalty exceeds sanity", () => {
		const state = makeState({ sanity: 10 });
		const result = attemptShank(state, true);
		expect(result.attackerState.sanity).toBe(0);
	});

	it("sets shankCooldown true on dodge", () => {
		const state = makeState();
		const result = attemptShank(state, true);
		expect(result.attackerState.shankCooldown).toBe(true);
	});

	it("steals nothing when dodged", () => {
		const state = makeState();
		const result = attemptShank(state, true);
		expect(result.stolenCash).toBe(0);
		expect(result.stolenSupplies).toBe(0);
	});

	it("does not mutate original state on dodge", () => {
		const state = makeState({ sanity: 80 });
		attemptShank(state, true);
		expect(state.sanity).toBe(80);
		expect(state.shankCooldown).toBe(false);
	});
});

describe("attemptShank — success (random < 0.45)", () => {
	it("returns 'success' outcome when random returns 0.1", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.outcome).toBe("success");
	});

	it("stolen cash is in range [60, 199]", () => {
		// random = 0.1: stolenCash = 60 + floor(0.1 * 140) = 60 + 14 = 74
		vi.spyOn(Math, "random").mockReturnValue(0.1);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.stolenCash).toBe(74);
		expect(result.stolenCash).toBeGreaterThanOrEqual(60);
		expect(result.stolenCash).toBeLessThanOrEqual(199);
	});

	it("steals 1 supply on success", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.stolenSupplies).toBe(1);
	});

	it("sets shankCooldown true on success", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.attackerState.shankCooldown).toBe(true);
	});

	it("does not set shankStunned on success", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.attackerState.shankStunned).toBe(false);
	});

	it("does not mutate original state on success", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1);
		const state = makeState();
		attemptShank(state, false);
		expect(state.shankCooldown).toBe(false);
	});
});

describe("attemptShank — failure (random >= 0.45)", () => {
	it("returns 'failure' outcome when random returns 0.9", () => {
		// random sequence: 0.9 (success check fails), then penalty
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9) // success check: 0.9 >= 0.45, so failure
			.mockReturnValueOnce(0.5) // sanity penalty: 20 + floor(0.5 * 20) = 30
			.mockReturnValueOnce(0.5); // random skill index
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.outcome).toBe("failure");
	});

	it("deducts sanity penalty [20-39] on failure", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9) // failure path
			.mockReturnValueOnce(0.0) // sanity penalty: 20 + floor(0 * 20) = 20
			.mockReturnValueOnce(0.0); // skill index 0
		const state = makeState({ sanity: 80 });
		const result = attemptShank(state, false);
		expect(result.attackerState.sanity).toBe(60); // 80 - 20
	});

	it("reduces a random skill by 25 (min 5) on failure", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9) // failure
			.mockReturnValueOnce(0.0) // sanity penalty = 20
			.mockReturnValueOnce(0.0); // skill index 0 (driving)
		const state = makeState({ skills: { driving: 50, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 } });
		const result = attemptShank(state, false);
		const skillKeys = Object.keys(state.skills);
		const pickedSkill = skillKeys[0] as keyof typeof state.skills;
		// driving was 50, penalty is 25, so 50 - 25 = 25 (above min 5)
		expect(result.attackerState.skills[pickedSkill]).toBe(25);
	});

	it("skill does not drop below 5", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9) // failure
			.mockReturnValueOnce(0.0) // sanity penalty = 20
			.mockReturnValueOnce(0.0); // skill index 0
		const state = makeState({ skills: { driving: 20, navigation: 50, smooth: 50, mechanical: 50, charisma: 50, survival: 50 } });
		const result = attemptShank(state, false);
		// driving was 20 - 25 = -5, clamp to 5
		expect(result.attackerState.skills.driving).toBe(5);
	});

	it("sets shankCooldown true on failure", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.attackerState.shankCooldown).toBe(true);
	});

	it("sets shankStunned true on failure", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.attackerState.shankStunned).toBe(true);
	});

	it("steals nothing on failure", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const state = makeState();
		const result = attemptShank(state, false);
		expect(result.stolenCash).toBe(0);
		expect(result.stolenSupplies).toBe(0);
	});

	it("does not mutate original state on failure", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const state = makeState({ sanity: 80 });
		attemptShank(state, false);
		expect(state.sanity).toBe(80);
		expect(state.shankCooldown).toBe(false);
		expect(state.shankStunned).toBe(false);
	});
});

describe("attemptShank — cooldown always set", () => {
	it("cooldown is true regardless of outcome (dodge)", () => {
		const result = attemptShank(makeState(), true);
		expect(result.attackerState.shankCooldown).toBe(true);
	});

	it("cooldown is true regardless of outcome (success)", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.1);
		const result = attemptShank(makeState(), false);
		expect(result.attackerState.shankCooldown).toBe(true);
	});

	it("cooldown is true regardless of outcome (failure)", () => {
		vi.spyOn(Math, "random")
			.mockReturnValueOnce(0.9)
			.mockReturnValueOnce(0.0)
			.mockReturnValueOnce(0.0);
		const result = attemptShank(makeState(), false);
		expect(result.attackerState.shankCooldown).toBe(true);
	});
});
