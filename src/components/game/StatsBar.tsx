import { DRUG_CATALOG } from "../../data/drugs";
import { useGameStore } from "../../stores/gameStore";

export default function StatsBar() {
	const state = useGameStore((s) => s.state);
	if (!state) return null;

	const chips = [
		{
			icon: "⛽",
			value: `${Math.round(state.fuel)}%`,
			color: state.fuel < 25 ? "text-red" : "text-orange",
		},
		{
			icon: "🧠",
			value: `${Math.round(state.sanity)}%`,
			color: state.sanity < 25 ? "text-red" : state.sanity < 50 ? "text-yellow" : "text-green",
		},
		{
			icon: "💵",
			value: `$${state.cash}`,
			color: "text-yellow",
		},
		{
			icon: "🎒",
			value: String(state.supplies),
			color: "text-text",
		},
		{
			icon: "🕵️",
			value: String(state.disguises),
			color: "text-text",
		},
		{
			icon: "🔋",
			value: String(state.laserAmmo),
			color: "text-blue",
		},
	];

	const totalDrugs = DRUG_CATALOG.reduce((sum, d) => sum + (state.drugInventory?.[d.id] ?? 0), 0);
	const diseaseCount = state.diseases?.length ?? 0;

	return (
		<div className="safe-top flex shrink-0 flex-wrap gap-1.5 border-b border-border bg-surface px-2.5 py-2">
			{chips.map((ch) => (
				<div
					key={ch.icon}
					className="flex items-center gap-1 whitespace-nowrap rounded-2xl bg-surface2 px-2.5 py-1.5 text-[12px]"
				>
					<span className="text-[14px]">{ch.icon}</span>
					<span className={`font-bold ${ch.color}`}>{ch.value}</span>
				</div>
			))}

			{/* Disease indicator */}
			{diseaseCount > 0 && (
				<div className="flex items-center gap-1 whitespace-nowrap rounded-2xl bg-red/20 px-2.5 py-1.5 text-[12px] ring-1 ring-red/40">
					<span className="text-[14px]">{"💀"}</span>
					<span className="font-bold text-red">{diseaseCount}</span>
				</div>
			)}

			{/* Drug inventory indicator */}
			{totalDrugs > 0 && (
				<div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-purple/20 px-2.5 py-1.5 text-[12px] ring-1 ring-purple/40">
					<span className="text-[14px]">{"💊"}</span>
					<span className="font-bold text-purple">{totalDrugs}</span>
				</div>
			)}
		</div>
	);
}
