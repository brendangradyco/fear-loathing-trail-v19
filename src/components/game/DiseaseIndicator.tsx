import { useGameStore } from "../../stores/gameStore";

export default function DiseaseIndicator() {
	const diseases = useGameStore((s) => s.state?.diseases ?? []);

	if (diseases.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-1">
			<span className="text-[13px]">{"💀"}</span>
			{diseases.map((d) => (
				<span
					key={d}
					className="rounded-full bg-red/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red ring-1 ring-red/40"
				>
					{d}
				</span>
			))}
		</div>
	);
}
