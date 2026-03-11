import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkStore } from "../../stores/networkStore";

export default function ShankAlert() {
	const shankAlert = useNetworkStore((s) => s.shankAlert);
	const clearShankAlert = useNetworkStore((s) => s.clearShankAlert);
	const sendShankDodge = useNetworkStore((s) => s.sendShankDodge);

	const [timeLeft, setTimeLeft] = useState(2000); // ms
	const [shake, setShake] = useState(false);
	const resolvedRef = useRef(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const shakeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Reset and start countdown when a new alert arrives
	useEffect(() => {
		if (!shankAlert) return;

		resolvedRef.current = false;
		setTimeLeft(2000);
		setShake(false);

		// Countdown
		const start = Date.now();
		const TARGET = 2000;
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() - start;
			const remaining = Math.max(0, TARGET - elapsed);
			setTimeLeft(remaining);

			if (remaining <= 0) {
				if (intervalRef.current) clearInterval(intervalRef.current);
				// Timer expired — no dodge sent, just clear alert
				if (!resolvedRef.current) {
					resolvedRef.current = true;
					clearShankAlert();
				}
			}
		}, 50);

		// Screen shake
		shakeIntervalRef.current = setInterval(() => {
			setShake((s) => !s);
		}, 120);

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
		};
	}, [shankAlert?.timestamp, shankAlert, clearShankAlert]);

	const handleDodge = useCallback(() => {
		if (resolvedRef.current) return;
		resolvedRef.current = true;
		if (intervalRef.current) clearInterval(intervalRef.current);
		if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
		sendShankDodge();
		clearShankAlert();
	}, [sendShankDodge, clearShankAlert]);

	if (!shankAlert) return null;

	const progressFraction = timeLeft / 2000;

	// Shake translation
	const shakeX = shake ? (Math.random() > 0.5 ? 4 : -4) : 0;
	const shakeY = shake ? (Math.random() > 0.5 ? 2 : -2) : 0;

	return (
		<div
			className="fixed inset-0 z-50 flex flex-col items-center justify-center"
			style={{ background: "rgba(0,0,0,0.85)" }}
		>
			{/* Red-to-transparent radial overlay */}
			<div
				className="pointer-events-none fixed inset-0"
				style={{
					background: "radial-gradient(ellipse at center, rgba(255,0,0,0.15) 0%, rgba(255,0,0,0.4) 60%, transparent 100%)",
					animation: "shankPulse 0.4s ease-in-out infinite alternate",
				}}
			/>

			{/* Alert card */}
			<div
				className="relative flex w-full max-w-[320px] flex-col items-center gap-4 p-6"
				style={{
					border: "3px solid #ff2222",
					background: "#0d0000",
					boxShadow: "0 0 30px #ff2222, 0 0 60px rgba(255,0,0,0.3)",
					transform: `translate(${shakeX}px, ${shakeY}px)`,
					transition: "transform 0.05s",
					fontFamily: "monospace",
				}}
			>
				{/* Header */}
				<div className="flex flex-col items-center gap-1">
					<p
						className="text-[11px] font-bold tracking-[0.3em] animate-pulse"
						style={{ color: "#ff2222" }}
					>
						INCOMING SHANK
					</p>
					<h2
						className="text-[26px] font-bold tracking-widest"
						style={{ color: "#ffffff", textShadow: "0 0 12px #ff2222" }}
					>
						{shankAlert.fromName}
					</h2>
					<p className="text-[12px]" style={{ color: "#ff8888" }}>
						is coming at you with a shiv!
					</p>
				</div>

				{/* Countdown bar draining right to left */}
				<div className="w-full" style={{ background: "#1a0000", height: 10, border: "1px solid #550000" }}>
					<div
						className="h-full"
						style={{
							width: `${progressFraction * 100}%`,
							background: progressFraction > 0.5 ? "#ff6600" : "#ff2222",
							boxShadow: `0 0 8px ${progressFraction > 0.5 ? "#ff6600" : "#ff2222"}`,
							transition: "width 0.05s linear",
						}}
					/>
				</div>
				<p className="text-[10px]" style={{ color: "#884444" }}>
					{(timeLeft / 1000).toFixed(1)}s to dodge
				</p>

				{/* DODGE button */}
				<button
					type="button"
					onClick={handleDodge}
					className="w-full py-5 text-[22px] font-bold tracking-[0.2em] active:scale-95"
					style={{
						border: "3px solid #ff6600",
						color: "#ffffff",
						background: "#220000",
						boxShadow: "0 0 16px #ff2222",
						textShadow: "0 0 8px #ff6600",
						animation: "dodgePulse 0.5s ease-in-out infinite alternate",
					}}
				>
					DODGE!
				</button>
			</div>

			<style>{`
				@keyframes shankPulse {
					0% { opacity: 0.6; }
					100% { opacity: 1; }
				}
				@keyframes dodgePulse {
					0% { box-shadow: 0 0 16px #ff2222; }
					100% { box-shadow: 0 0 32px #ff6600, 0 0 64px rgba(255,102,0,0.4); }
				}
			`}</style>
		</div>
	);
}
