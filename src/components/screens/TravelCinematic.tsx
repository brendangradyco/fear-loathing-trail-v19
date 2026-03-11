import { useGameStore } from "../../stores/gameStore";

interface TravelCinematicProps {
	onEnd: () => void;
}

export default function TravelCinematic({ onEnd }: TravelCinematicProps) {
	const state = useGameStore((s) => s.state);

	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg">
			<div className="text-[40px]">{"🚗"}</div>
			<h2 className="font-bold text-orange">TRAVEL CINEMATIC</h2>
			<p className="text-[12px] text-dim">Stop {state?.stopIdx ?? 0}</p>
			<button
				type="button"
				onClick={onEnd}
				className="rounded-lg border border-orange bg-transparent px-6 py-2.5 text-sm text-orange active:opacity-75"
			>
				{"← "}Back
			</button>
		</div>
	);
}
