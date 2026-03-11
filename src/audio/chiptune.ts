const MELODY = [392,440,494,523,587,659,784,880,784,659,523,440,523,587,659,523,440,392,440,523];
const BASS = [196,196,220,261,294,330,392,440,392,330,261,220,261,294,330,261,220,196,220,261];
const TEMPO = 0.12;

let audioCtx: AudioContext | null = null;
let playing = false;
let muted = false;
let loopTimer: number | null = null;

export function initAudio(): void {
	if (audioCtx) return;
	audioCtx = new AudioContext();
}

export function playLoop(): void {
	if (!audioCtx || playing || muted) return;
	playing = true;
	scheduleLoop();
}

function scheduleLoop(): void {
	if (!audioCtx || !playing) return;
	const now = audioCtx.currentTime;

	for (let i = 0; i < MELODY.length; i++) {
		const t = now + i * TEMPO;
		const mOsc = audioCtx.createOscillator();
		const mGain = audioCtx.createGain();
		mOsc.type = "square";
		mOsc.frequency.value = MELODY[i]!;
		mGain.gain.setValueAtTime(0.12, t);
		mGain.gain.exponentialRampToValueAtTime(0.001, t + TEMPO * 0.85);
		mOsc.connect(mGain).connect(audioCtx.destination);
		mOsc.start(t);
		mOsc.stop(t + TEMPO);

		const bOsc = audioCtx.createOscillator();
		const bGain = audioCtx.createGain();
		bOsc.type = "square";
		bOsc.frequency.value = BASS[i]!;
		bGain.gain.setValueAtTime(0.07, t);
		bGain.gain.exponentialRampToValueAtTime(0.001, t + TEMPO * 0.9);
		bOsc.connect(bGain).connect(audioCtx.destination);
		bOsc.start(t);
		bOsc.stop(t + TEMPO);
	}

	const loopDuration = MELODY.length * TEMPO * 1000;
	loopTimer = window.setTimeout(scheduleLoop, loopDuration - 50);
}

export function stopLoop(): void {
	playing = false;
	if (loopTimer) clearTimeout(loopTimer);
}

export function toggleMute(): boolean {
	muted = !muted;
	if (muted) stopLoop();
	else playLoop();
	return muted;
}

export function playSfx(freq: number, duration: number): void {
	if (!audioCtx || muted) return;
	const osc = audioCtx.createOscillator();
	const gain = audioCtx.createGain();
	osc.type = "square";
	osc.frequency.value = freq;
	gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
	osc.connect(gain).connect(audioCtx.destination);
	osc.start();
	osc.stop(audioCtx.currentTime + duration);
}

export function playToast(): void { playSfx(880, 0.1); }
export function playAlert(): void { playSfx(440, 0.3); }
