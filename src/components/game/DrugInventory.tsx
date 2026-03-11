import { useState } from "react";
import { DRUG_CATALOG } from "../../data/drugs";
import { useGameStore } from "../../stores/gameStore";

export default function DrugInventory() {
	const drugInventory = useGameStore((s) => s.state?.drugInventory);
	const [expanded, setExpanded] = useState(false);

	if (!drugInventory) return null;

	const nonZero = DRUG_CATALOG.filter((d) => (drugInventory[d.id] ?? 0) > 0);

	if (nonZero.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-1">
			{nonZero.map((drug) => (
				<button
					key={drug.id}
					type="button"
					onClick={() => setExpanded((v) => !v)}
					className="flex items-center gap-1 rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-bold text-text ring-1 ring-border"
					title={expanded ? drug.name : undefined}
				>
					<span>{drug.emoji}</span>
					<span className="text-yellow">{drugInventory[drug.id]}</span>
				</button>
			))}
		</div>
	);
}
