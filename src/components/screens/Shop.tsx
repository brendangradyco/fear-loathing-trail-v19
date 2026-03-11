import { useCallback, useState } from "react";
import { DRUG_CATALOG, getDrugPriceModifier } from "../../data/drugs";
import { FIENDS } from "../../data/fiends";
import { DRUG_SHOP, MEDICINE_SHOP, SUPPLY_SHOP } from "../../data/shops";
import { useGameStore } from "../../stores/gameStore";
import type { DrugDef, Fiend, ShopItem } from "../../types";
import { DrugType } from "../../types";
import { toast } from "../shared/Toast";

interface ShopProps {
	onLeave: () => void;
	isFirstVisit?: boolean;
	onDrugDeal: () => void;
}

type Tab = "supplies" | "drugs" | "medicine";

const QTY_OPTIONS = [1, 5, 10] as const;

export default function Shop({ onLeave, isFirstVisit = false, onDrugDeal }: ShopProps) {
	const [tab, setTab] = useState<Tab>("supplies");
	const [buyQty, setBuyQty] = useState<Record<string, number>>({});

	const cash = useGameStore((s) => s.state?.cash ?? 0);
	const state = useGameStore((s) => s.state);
	const doBuyItem = useGameStore((s) => s.doBuyItem);
	const buyDrug = useGameStore((s) => s.buyDrug);
	const sellDrug = useGameStore((s) => s.sellDrug);
	const startGrow = useGameStore((s) => s.startGrow);
	const startStill = useGameStore((s) => s.startStill);
	const cookDrug = useGameStore((s) => s.cookDrug);
	const harvestDrug = useGameStore((s) => s.harvestDrug);
	const buyMedicine = useGameStore((s) => s.buyMedicine);

	const stopIdx = state?.stopIdx ?? 0;
	const priceMod = getDrugPriceModifier(stopIdx);
	const drugInventory = state?.drugInventory ?? {} as Record<DrugType, number>;
	const diseases = state?.diseases ?? [];
	const drugStatus = state?.drugStatus;

	const allItems = [...DRUG_SHOP, ...SUPPLY_SHOP];

	const handleBuySupply = useCallback(
		(item: ShopItem) => {
			const ok = doBuyItem(item);
			if (ok) {
				toast(`${item.name} acquired!`);
			} else {
				toast("Not enough cash", true);
			}
		},
		[doBuyItem],
	);

	const getQty = (drugId: string): number => buyQty[drugId] ?? 1;

	const handleBuyDrug = useCallback(
		(drug: DrugDef) => {
			const qty = getQty(drug.id);
			const price = Math.round(drug.buy * priceMod.buy * qty);
			if (cash < price) {
				toast("Not enough cash", true);
				return;
			}
			buyDrug(drug, qty);
			toast(`${drug.name} x${qty} acquired!`);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[buyDrug, cash, priceMod.buy, buyQty],
	);

	const handleSellToDeal = useCallback(
		(drug: DrugDef, fiend: Fiend) => {
			const qty = drugInventory[drug.id] ?? 0;
			if (qty <= 0) {
				toast(`No ${drug.name} to sell`, true);
				return;
			}
			const result = sellDrug(drug, qty, fiend);
			if (result.busted) {
				toast("BUSTED! Cops everywhere!", true);
			} else {
				toast(`Sold to ${fiend.name} for $${result.earnings}`);
			}
			onDrugDeal();
		},
		[sellDrug, drugInventory, onDrugDeal],
	);

	const handleGrow = useCallback(() => {
		startGrow();
		toast("Weed growing... check back in 2 stops.");
	}, [startGrow]);

	const handleStill = useCallback(() => {
		startStill();
		toast("Moonshine stilling... check back in 3 stops.");
	}, [startStill]);

	const handleCookMeth = useCallback(() => {
		if (cash < 40) {
			toast("Need $40 to cook meth", true);
			return;
		}
		cookDrug(DrugType.Meth);
		toast("Crystal cooked. 💎");
	}, [cookDrug, cash]);

	const handleCookCoke = useCallback(() => {
		if (cash < 50) {
			toast("Need $50 to cook coke", true);
			return;
		}
		cookDrug(DrugType.Coke);
		toast("Cocaine cooked. 🤍");
	}, [cookDrug, cash]);

	const handleHarvestWeed = useCallback(() => {
		harvestDrug(DrugType.Weed);
		toast("Weed harvested! 🌿");
	}, [harvestDrug]);

	const handleHarvestShine = useCallback(() => {
		harvestDrug(DrugType.Shine);
		toast("Moonshine ready! 🫙");
	}, [harvestDrug]);

	const handleBuyMedicine = useCallback(
		(medicine: (typeof MEDICINE_SHOP)[0]) => {
			const ok = buyMedicine(medicine);
			if (ok) {
				toast(`${medicine.name} acquired!`);
			} else {
				toast("Not enough cash", true);
			}
		},
		[buyMedicine],
	);

	const weedReady = drugStatus && drugStatus.weedReadyAt >= 0 && stopIdx >= drugStatus.weedReadyAt;
	const shineReady = drugStatus && drugStatus.shineReadyAt >= 0 && stopIdx >= drugStatus.shineReadyAt;
	const weedGrowing = drugStatus && drugStatus.weedReadyAt >= 0 && !weedReady;
	const shineStilling = drugStatus && drugStatus.shineReadyAt >= 0 && !shineReady;
	const methCookUsed = state?.methCookUsed ?? false;
	const cokeCookUsed = state?.cokeCookUsed ?? false;

	return (
		<div className="fixed inset-0 flex flex-col bg-bg">
			{/* Header */}
			<div className="safe-top flex shrink-0 items-center gap-2.5 border-b border-border bg-surface px-3.5 py-2.5">
				<span className="flex-1 text-[15px] font-bold text-orange">{"💊"} THE STASH</span>
				<div className="text-sm font-bold text-yellow">${cash}</div>
			</div>

			{/* Tabs */}
			<div className="flex shrink-0 border-b border-border bg-surface">
				{(["supplies", "drugs", "medicine"] as Tab[]).map((t) => (
					<button
						key={t}
						type="button"
						onClick={() => setTab(t)}
						className={`flex-1 py-2.5 text-[12px] font-bold uppercase tracking-wide transition-colors ${
							tab === t
								? "border-b-2 border-orange text-orange"
								: "text-dim"
						}`}
					>
						{t === "supplies" ? "Supplies" : t === "drugs" ? "Drugs" : "Medicine"}
					</button>
				))}
			</div>

			{/* Tab content */}
			<div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3.5">
				{/* === SUPPLIES TAB === */}
				{tab === "supplies" && (
					<>
						{allItems.map((item) => (
							<div
								key={item.id}
								className="flex items-center gap-2.5 rounded-lg border border-border bg-surface2 px-3 py-2.5"
							>
								<div className="min-w-0 flex-1">
									<div className="font-bold text-orange">{item.name}</div>
									<div className="mt-0.5 text-[11px] text-dim">{item.desc}</div>
								</div>
								<div className="min-w-[52px] text-right font-bold text-yellow">${item.price}</div>
								<button
									type="button"
									onClick={() => handleBuySupply(item)}
									disabled={cash < item.price}
									className="shrink-0 rounded-md bg-orange px-3.5 py-2 text-[13px] font-bold text-black disabled:opacity-40"
								>
									Buy
								</button>
							</div>
						))}
					</>
				)}

				{/* === DRUGS TAB === */}
				{tab === "drugs" && (
					<>
						{/* Buy drugs section */}
						<div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-dim">
							{"🛒"} Buy Drugs
						</div>
						{DRUG_CATALOG.map((drug) => {
							const buyPrice = Math.round(drug.buy * priceMod.buy);
							const qty = getQty(drug.id);
							const totalPrice = buyPrice * qty;
							return (
								<div
									key={drug.id}
									className="rounded-lg border border-border bg-surface2 px-3 py-2.5"
								>
									<div className="flex items-center gap-2">
										<span className="text-[20px]">{drug.emoji}</span>
										<div className="min-w-0 flex-1">
											<div className="font-bold text-orange">{drug.name}</div>
											<div className="text-[10px] text-dim">{drug.desc}</div>
										</div>
										<div className="text-right">
											<div className="font-bold text-yellow">${buyPrice}/unit</div>
											<div className="text-[10px] text-dim">Total: ${totalPrice}</div>
										</div>
									</div>
									<div className="mt-2 flex items-center gap-2">
										<div className="flex gap-1">
											{QTY_OPTIONS.map((q) => (
												<button
													key={q}
													type="button"
													onClick={() => setBuyQty((prev) => ({ ...prev, [drug.id]: q }))}
													className={`rounded px-2.5 py-1 text-[11px] font-bold transition-colors ${
														qty === q
															? "bg-orange text-black"
															: "border border-border text-dim"
													}`}
												>
													{q}
												</button>
											))}
										</div>
										<button
											type="button"
											onClick={() => handleBuyDrug(drug)}
											disabled={cash < totalPrice}
											className="ml-auto rounded-md bg-orange px-3.5 py-1.5 text-[13px] font-bold text-black disabled:opacity-40"
										>
											Buy
										</button>
									</div>
								</div>
							);
						})}

						{/* Make drugs section */}
						<div className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-wider text-dim">
							{"🧪"} Make Drugs
						</div>
						<div className="grid grid-cols-2 gap-2">
							<button
								type="button"
								onClick={weedReady ? handleHarvestWeed : handleGrow}
								disabled={!!weedGrowing}
								className="rounded-lg border border-border bg-surface2 p-3 text-left disabled:opacity-50"
							>
								<div className="font-bold text-green">{"🌿"} Weed</div>
								<div className="mt-0.5 text-[10px] text-dim">
									{weedReady ? "Ready to harvest!" : weedGrowing ? "Growing..." : "Grow (+2 stops)"}
								</div>
							</button>
							<button
								type="button"
								onClick={shineReady ? handleHarvestShine : handleStill}
								disabled={!!shineStilling}
								className="rounded-lg border border-border bg-surface2 p-3 text-left disabled:opacity-50"
							>
								<div className="font-bold text-yellow">{"🫙"} Moonshine</div>
								<div className="mt-0.5 text-[10px] text-dim">
									{shineReady ? "Ready to harvest!" : shineStilling ? "Stilling..." : "Still (+3 stops)"}
								</div>
							</button>
							<button
								type="button"
								onClick={handleCookMeth}
								disabled={methCookUsed || cash < 40}
								className="rounded-lg border border-border bg-surface2 p-3 text-left disabled:opacity-50"
							>
								<div className="font-bold text-blue">{"💎"} Cook Meth</div>
								<div className="mt-0.5 text-[10px] text-dim">
									{methCookUsed ? "Used this stop" : "$40 lab fee"}
								</div>
							</button>
							<button
								type="button"
								onClick={handleCookCoke}
								disabled={cokeCookUsed || cash < 50}
								className="rounded-lg border border-border bg-surface2 p-3 text-left disabled:opacity-50"
							>
								<div className="font-bold text-text">{"🤍"} Cook Coke</div>
								<div className="mt-0.5 text-[10px] text-dim">
									{cokeCookUsed ? "Used this stop" : "$50 lab fee"}
								</div>
							</button>
						</div>

						{/* Sell drugs section */}
						<div className="mb-1 mt-3 text-[11px] font-bold uppercase tracking-wider text-dim">
							{"💰"} Sell to Fiends
						</div>
						{FIENDS.map((fiend) => {
							const preferredDrug = DRUG_CATALOG.find((d) => d.id === fiend.want);
							const haveQty = drugInventory[fiend.want] ?? 0;
							return (
								<div
									key={fiend.name}
									className="rounded-lg border border-border bg-surface2 px-3 py-2.5"
								>
									<div className="flex items-center gap-2">
										<span className="text-[20px]">{fiend.emoji}</span>
										<div className="flex-1">
											<div className="font-bold text-text">{fiend.name}</div>
											<div className="text-[10px] text-dim">
												Wants: {preferredDrug?.name ?? fiend.want} — Risk:{" "}
												<span className={fiend.risk > 0.2 ? "text-red" : fiend.risk > 0.12 ? "text-yellow" : "text-green"}>
													{Math.round(fiend.risk * 100)}%
												</span>
											</div>
										</div>
										<div className="text-right text-[11px] text-dim">
											Have: {haveQty}
										</div>
									</div>
									{preferredDrug && (
										<button
											type="button"
											onClick={() => handleSellToDeal(preferredDrug, fiend)}
											disabled={haveQty <= 0}
											className="mt-2 w-full rounded-md bg-surface px-3 py-1.5 text-[12px] font-bold text-orange ring-1 ring-orange disabled:opacity-40"
										>
											Sell {preferredDrug.emoji} → Drug Deal
										</button>
									)}
								</div>
							);
						})}
					</>
				)}

				{/* === MEDICINE TAB === */}
				{tab === "medicine" && (
					<>
						{diseases.length > 0 && (
							<div className="mb-1 rounded-lg border border-red bg-surface2 px-3 py-2.5">
								<div className="text-[12px] font-bold text-red">{"💀"} Active Conditions</div>
								<div className="mt-1 text-[11px] text-dim">{diseases.join(", ")}</div>
							</div>
						)}
						{MEDICINE_SHOP.map((medicine) => {
							const curesActive = medicine.cures.some((d) => diseases.includes(d));
							return (
								<div
									key={medicine.id}
									className={`flex items-center gap-2.5 rounded-lg border bg-surface2 px-3 py-2.5 ${
										curesActive ? "border-green" : "border-border"
									}`}
								>
									<div className="min-w-0 flex-1">
										<div className={`font-bold ${curesActive ? "text-green" : "text-orange"}`}>
											{curesActive && "{"} {medicine.name} {curesActive && "}"}
										</div>
										<div className="mt-0.5 text-[11px] text-dim">{medicine.desc}</div>
										{curesActive && (
											<div className="mt-0.5 text-[10px] font-bold text-green">
												Treats your condition!
											</div>
										)}
									</div>
									<div className="min-w-[52px] text-right font-bold text-yellow">
										${medicine.price}
									</div>
									<button
										type="button"
										onClick={() => handleBuyMedicine(medicine)}
										disabled={cash < medicine.price}
										className={`shrink-0 rounded-md px-3.5 py-2 text-[13px] font-bold text-black disabled:opacity-40 ${
											curesActive ? "bg-green" : "bg-orange"
										}`}
									>
										Buy
									</button>
								</div>
							);
						})}
					</>
				)}

				<div className="h-2" />

				<button
					type="button"
					onClick={onLeave}
					className={`w-full rounded-lg p-3.5 text-base font-bold active:opacity-75 ${
						isFirstVisit ? "bg-green text-black" : "border border-orange bg-transparent text-orange"
					}`}
				>
					{isFirstVisit ? "HIT THE TRAIL 🚗" : "← Back to Trail"}
				</button>

				<div className="h-20" />
			</div>
		</div>
	);
}
