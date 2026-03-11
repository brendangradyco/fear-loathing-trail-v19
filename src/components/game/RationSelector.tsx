import { RATIONS } from "../../data/rations";
import { useGameStore } from "../../stores/gameStore";
import type { RationType } from "../../types";

export default function RationSelector() {
	const rationTier = useGameStore((s) => s.state?.rationTier);
	const setRation = useGameStore((s) => s.setRation);

	if (rationTier === undefined) return null;

	return (
		<div className="grid grid-cols-2 gap-1.5">
			{RATIONS.map((r) => {
				const selected = rationTier === r.id;
				return (
					<button
						key={r.id}
						type="button"
						onClick={() => setRation(r.id as RationType)}
						style={selected ? { borderColor: r.color, color: r.color } : undefined}
						className={`rounded-lg border-2 bg-surface2 px-2 py-2.5 text-left text-[11px] transition-all ${
							selected ? "font-bold" : "border-border text-dim"
						}`}
					>
						<div className="font-bold leading-tight">{r.label}</div>
						<div className="mt-0.5 text-[10px] opacity-80">
							{r.supplyCost === 0 ? "0 supplies" : `${r.supplyCost} supply/stop`}
							{r.sanityBonus !== 0 && (
								<span className={r.sanityBonus > 0 ? " text-green" : " text-red"}>
									{" "}
									{r.sanityBonus > 0 ? "+" : ""}
									{r.sanityBonus} sanity
								</span>
							)}
						</div>
					</button>
				);
			})}
		</div>
	);
}
