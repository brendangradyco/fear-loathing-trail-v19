import { afterEach, describe, expect, it, vi } from "vitest";
import {
	calculateReward,
	checkInput,
	generateSequence,
} from "../../src/engine/buskGame";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("generateSequence", () => {
	it("returns an array of the given round length", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const seq = generateSequence(4);
		expect(seq).toHaveLength(4);
	});

	it("returns an array of values 0-3", () => {
		// random = 0.5 → floor(0.5 * 4) = 2
		vi.spyOn(Math, "random").mockReturnValue(0.5);
		const seq = generateSequence(3);
		expect(seq.every((v) => v >= 0 && v <= 3)).toBe(true);
	});

	it("generates 0s when random returns 0", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);
		const seq = generateSequence(3);
		expect(seq).toEqual([0, 0, 0]);
	});

	it("generates 3s when random returns just below 1", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.99);
		const seq = generateSequence(3);
		expect(seq).toEqual([3, 3, 3]);
	});

	it("returns empty array for round 0", () => {
		const seq = generateSequence(0);
		expect(seq).toEqual([]);
	});

	it("round 1 returns single-element array", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.25);
		const seq = generateSequence(1);
		expect(seq).toHaveLength(1);
	});
});

describe("checkInput", () => {
	it("returns correct=true and complete=false for a correct partial input", () => {
		const sequence = [1, 2, 3, 0];
		const input = [1, 2];
		const result = checkInput(sequence, input);
		expect(result.correct).toBe(true);
		expect(result.complete).toBe(false);
	});

	it("returns correct=true and complete=true when input matches full sequence", () => {
		const sequence = [1, 2, 3];
		const result = checkInput(sequence, [1, 2, 3]);
		expect(result.correct).toBe(true);
		expect(result.complete).toBe(true);
	});

	it("returns correct=false when input deviates", () => {
		const sequence = [1, 2, 3];
		const result = checkInput(sequence, [1, 0]);
		expect(result.correct).toBe(false);
		expect(result.complete).toBe(false);
	});

	it("returns correct=false for empty sequence with non-empty input", () => {
		const result = checkInput([], [1]);
		expect(result.correct).toBe(false);
	});

	it("returns correct=true and complete=true for empty sequence with empty input", () => {
		const result = checkInput([], []);
		expect(result.correct).toBe(true);
		expect(result.complete).toBe(true);
	});

	it("returns correct=false when first element is wrong", () => {
		const sequence = [3, 1, 2];
		const result = checkInput(sequence, [0]);
		expect(result.correct).toBe(false);
	});
});

describe("calculateReward", () => {
	it("win at round 4 returns $100", () => {
		const result = calculateReward(4, true);
		expect(result).toBe(100);
	});

	it("fail returns max(5, round * 8 - 10)", () => {
		// round 3: max(5, 3*8-10) = max(5, 14) = 14
		expect(calculateReward(3, false)).toBe(14);
		// round 1: max(5, 1*8-10) = max(5, -2) = 5
		expect(calculateReward(1, false)).toBe(5);
	});

	it("bail (won=true at early round) returns round * 8", () => {
		// win=true but round < 4 (bail scenario)
		// round 2: 2 * 8 = 16
		expect(calculateReward(2, true)).toBe(16);
	});

	it("bail at round 1 returns 8", () => {
		expect(calculateReward(1, true)).toBe(8);
	});

	it("fail floor is always at least 5", () => {
		// round 0: max(5, 0*8-10) = max(5, -10) = 5
		expect(calculateReward(0, false)).toBe(5);
	});

	it("win at round 4 (full sequence) = $100, not round * 8", () => {
		// round 4, won = true should be the win condition
		expect(calculateReward(4, true)).toBe(100);
	});
});
