export function generateSequence(round: number): number[] {
	return Array.from({ length: round }, () => Math.floor(Math.random() * 4));
}

export function checkInput(
	sequence: number[],
	input: number[],
): { correct: boolean; complete: boolean } {
	if (input.length === 0 && sequence.length === 0) {
		return { correct: true, complete: true };
	}
	if (input.length > sequence.length) {
		return { correct: false, complete: false };
	}
	for (let i = 0; i < input.length; i++) {
		if (input[i] !== sequence[i]) {
			return { correct: false, complete: false };
		}
	}
	const complete = input.length === sequence.length;
	return { correct: true, complete };
}

export function calculateReward(round: number, won: boolean): number {
	if (won && round >= 4) {
		return 100; // Full win
	}
	if (won) {
		// Bail early (left before round 4)
		return round * 8;
	}
	// Failed
	return Math.max(5, round * 8 - 10);
}
