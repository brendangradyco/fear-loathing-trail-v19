import { useNetworkStore } from "../../stores/networkStore";

export default function ShankAlert() {
	const shankAlert = useNetworkStore((s) => s.shankAlert);
	const clearShankAlert = useNetworkStore((s) => s.clearShankAlert);
	const sendShankDodge = useNetworkStore((s) => s.sendShankDodge);

	if (!shankAlert) return null;

	const handleDodge = () => {
		sendShankDodge();
		clearShankAlert();
	};

	const handleTakeIt = () => {
		clearShankAlert();
	};

	return (
		<div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-6">
			<div className="w-full max-w-[320px] rounded-xl border-2 border-red bg-surface p-5 text-center">
				<div className="mb-2 text-[40px]">{"🔪"}</div>
				<h2 className="mb-1 text-[20px] font-bold text-red">SHANK ALERT</h2>
				<p className="mb-4 text-[13px] text-dim">
					{shankAlert.fromName} is coming at you with a shiv!
				</p>
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleDodge}
						className="flex-1 rounded-lg bg-orange p-3 text-sm font-bold text-black active:opacity-75"
					>
						{"🏃"} DODGE
					</button>
					<button
						type="button"
						onClick={handleTakeIt}
						className="flex-1 rounded-lg border border-red bg-transparent p-3 text-sm font-bold text-red active:opacity-75"
					>
						{"😵"} Take it
					</button>
				</div>
			</div>
		</div>
	);
}
