import { useCallback, useEffect, useRef, useState } from "react";
import { BIOME_CONFIGS } from "../../data/biomes";
import { TRAIL_STOPS } from "../../data/trailStops";
import { useGameStore } from "../../stores/gameStore";
import { Biome } from "../../types";

interface TravelCinematicProps {
	onEnd: () => void;
}

interface Entity {
	type: string;
	x: number;
	y: number;
	speed: number;
	scale: number;
	layer: number;
}

type EasterEggType = "ufo" | "bigfoot" | "godzilla";

function drawCactus(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
	ctx.fillStyle = "#2d6b2d";
	// Main trunk
	ctx.fillRect(x - 4 * scale, y - 30 * scale, 8 * scale, 30 * scale);
	// Left arm
	ctx.fillRect(x - 14 * scale, y - 20 * scale, 10 * scale, 6 * scale);
	ctx.fillRect(x - 14 * scale, y - 28 * scale, 6 * scale, 12 * scale);
	// Right arm
	ctx.fillRect(x + 4 * scale, y - 18 * scale, 10 * scale, 6 * scale);
	ctx.fillRect(x + 8 * scale, y - 26 * scale, 6 * scale, 12 * scale);
}

function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
	// Trunk
	ctx.fillStyle = "#8b6914";
	ctx.fillRect(x - 3 * scale, y - 40 * scale, 6 * scale, 40 * scale);
	// Leaves
	ctx.fillStyle = "#1a6e1a";
	const leaves: [number, number][] = [
		[-15, -5],
		[15, -5],
		[-5, -15],
		[5, -15],
		[-10, -12],
		[10, -12],
	];
	for (const [lx, ly] of leaves) {
		ctx.beginPath();
		ctx.moveTo(x, y - 40 * scale);
		ctx.lineTo(x + lx * scale, y + ly * scale - 40 * scale);
		ctx.lineTo(x + lx * 0.5 * scale, y + (ly - 8) * scale - 40 * scale);
		ctx.closePath();
		ctx.fill();
	}
}

function drawPineTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
	// Trunk
	ctx.fillStyle = "#5a3a1a";
	ctx.fillRect(x - 3 * scale, y - 8 * scale, 6 * scale, 8 * scale);
	// Layers
	const layers: [number, number, number][] = [
		[0, -10, 20],
		[0, -20, 16],
		[0, -28, 12],
		[0, -34, 8],
	];
	ctx.fillStyle = "#1a4a1a";
	for (const [, ly, w] of layers) {
		ctx.beginPath();
		ctx.moveTo(x, y + (ly - 8) * scale);
		ctx.lineTo(x - (w / 2) * scale, y + ly * scale);
		ctx.lineTo(x + (w / 2) * scale, y + ly * scale);
		ctx.closePath();
		ctx.fill();
	}
	// Snow cap
	ctx.fillStyle = "#ddeeff";
	ctx.beginPath();
	ctx.moveTo(x, y - 42 * scale);
	ctx.lineTo(x - 4 * scale, y - 34 * scale);
	ctx.lineTo(x + 4 * scale, y - 34 * scale);
	ctx.closePath();
	ctx.fill();
}

function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
	const h = (20 + Math.floor(x % 5) * 10) * scale;
	const w = (12 + Math.floor(x % 3) * 6) * scale;
	ctx.fillStyle = "#1a1a2a";
	ctx.fillRect(x - w / 2, y - h, w, h);
	// Windows
	ctx.fillStyle = "#ffff88";
	const rows = Math.floor(h / (8 * scale));
	const cols = Math.floor(w / (6 * scale));
	for (let r = 0; r < rows - 1; r++) {
		for (let c = 0; c < cols; c++) {
			if (Math.sin(x * 0.1 + r * 3 + c * 7) > 0) {
				ctx.fillRect(
					x - w / 2 + 2 * scale + c * 6 * scale,
					y - h + 4 * scale + r * 8 * scale,
					3 * scale,
					4 * scale,
				);
			}
		}
	}
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
	ctx.fillStyle = "#5a5050";
	ctx.beginPath();
	ctx.ellipse(x, y - 8 * scale, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
	ctx.fill();
}

function drawUFO(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, tick: number) {
	// Saucer body
	ctx.fillStyle = "#8888aa";
	ctx.beginPath();
	ctx.ellipse(x, y, 20 * scale, 8 * scale, 0, 0, Math.PI * 2);
	ctx.fill();
	// Dome
	ctx.fillStyle = "#aaddaa";
	ctx.beginPath();
	ctx.ellipse(x, y - 4 * scale, 10 * scale, 8 * scale, 0, Math.PI, 0);
	ctx.fill();
	// Beam
	ctx.fillStyle = `rgba(150,255,150,${0.3 + Math.sin(tick * 0.1) * 0.2})`;
	ctx.beginPath();
	ctx.moveTo(x - 6 * scale, y + 8 * scale);
	ctx.lineTo(x + 6 * scale, y + 8 * scale);
	ctx.lineTo(x + 16 * scale, y + 50 * scale);
	ctx.lineTo(x - 16 * scale, y + 50 * scale);
	ctx.closePath();
	ctx.fill();
}

function drawBigfoot(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
	// Body
	ctx.fillStyle = "#5a3a1a";
	ctx.fillRect(x - 8 * scale, y - 36 * scale, 16 * scale, 36 * scale);
	// Head
	ctx.beginPath();
	ctx.arc(x, y - 42 * scale, 10 * scale, 0, Math.PI * 2);
	ctx.fill();
	// Eyes
	ctx.fillStyle = "#ff2222";
	ctx.beginPath();
	ctx.arc(x - 4 * scale, y - 44 * scale, 2 * scale, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x + 4 * scale, y - 44 * scale, 2 * scale, 0, Math.PI * 2);
	ctx.fill();
}

function drawGodzilla(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
	ctx.fillStyle = "#1a5a1a";
	// Body
	ctx.fillRect(x - 15 * scale, y - 70 * scale, 30 * scale, 70 * scale);
	// Head
	ctx.fillRect(x - 10 * scale, y - 95 * scale, 20 * scale, 30 * scale);
	// Spikes
	ctx.fillStyle = "#2a8a2a";
	for (let i = 0; i < 5; i++) {
		ctx.beginPath();
		ctx.moveTo(x - 3 * scale + i * 6 * scale, y - 70 * scale);
		ctx.lineTo(x - 6 * scale + i * 6 * scale, y - 88 * scale);
		ctx.lineTo(x + i * 6 * scale, y - 70 * scale);
		ctx.closePath();
		ctx.fill();
	}
	// Eyes
	ctx.fillStyle = "#ff4444";
	ctx.beginPath();
	ctx.arc(x - 5 * scale, y - 85 * scale, 3 * scale, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x + 5 * scale, y - 85 * scale, 3 * scale, 0, Math.PI * 2);
	ctx.fill();
}

function drawCar(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, tick: number) {
	const bounce = Math.sin(tick * 0.2) * 1.5;
	const yy = y + bounce;
	// Body
	ctx.fillStyle = "#cc2222";
	ctx.fillRect(x - 20 * scale, yy - 12 * scale, 40 * scale, 12 * scale);
	// Roof
	ctx.fillStyle = "#aa1111";
	ctx.fillRect(x - 12 * scale, yy - 22 * scale, 24 * scale, 10 * scale);
	// Windows
	ctx.fillStyle = "#88ccff";
	ctx.fillRect(x - 10 * scale, yy - 21 * scale, 8 * scale, 8 * scale);
	ctx.fillRect(x + 2 * scale, yy - 21 * scale, 8 * scale, 8 * scale);
	// Wheels
	ctx.fillStyle = "#222";
	ctx.beginPath();
	ctx.arc(x - 13 * scale, yy, 5 * scale, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(x + 13 * scale, yy, 5 * scale, 0, Math.PI * 2);
	ctx.fill();
}

function drawMountain(
	ctx: CanvasRenderingContext2D,
	x: number,
	baseY: number,
	W: number,
	color: string,
	snowColor: string | null,
) {
	// Generate a simple mountain range with noise-like variation
	ctx.fillStyle = color;
	ctx.beginPath();
	ctx.moveTo(0, baseY);
	const points = 12;
	for (let i = 0; i <= points; i++) {
		const px = (i / points) * W;
		const seed = Math.sin(px * 0.03 + x * 0.001) * 0.5 + 0.5;
		const py = baseY - 30 - seed * 60;
		ctx.lineTo(px, py);
	}
	ctx.lineTo(W, baseY);
	ctx.closePath();
	ctx.fill();

	if (snowColor) {
		ctx.fillStyle = snowColor;
		ctx.beginPath();
		ctx.moveTo(0, baseY - 50);
		for (let i = 0; i <= points; i++) {
			const px = (i / points) * W;
			const seed = Math.sin(px * 0.03 + x * 0.001) * 0.5 + 0.5;
			const py = baseY - 30 - seed * 60;
			if (py < baseY - 60) {
				ctx.lineTo(px, py);
			} else {
				ctx.lineTo(px, baseY - 50);
			}
		}
		ctx.lineTo(W, baseY - 50);
		ctx.closePath();
		ctx.fill();
	}
}

function drawEntity(ctx: CanvasRenderingContext2D, entity: Entity, tick: number) {
	const { type, x, y, scale } = entity;
	switch (type) {
		case "cactus":
			drawCactus(ctx, x, y, scale);
			break;
		case "palm":
			drawPalmTree(ctx, x, y, scale);
			break;
		case "pine":
			drawPineTree(ctx, x, y, scale);
			break;
		case "building":
			drawBuilding(ctx, x, y, scale);
			break;
		case "rock":
		case "boulder":
			drawRock(ctx, x, y, scale);
			break;
		case "ufo":
			drawUFO(ctx, x, y, scale, tick);
			break;
		case "bigfoot":
			drawBigfoot(ctx, x, y, scale);
			break;
		case "godzilla":
			drawGodzilla(ctx, x, y, scale);
			break;
		case "tumbleweed":
			ctx.fillStyle = "#8b6914";
			ctx.beginPath();
			ctx.arc(x, y - 6 * scale, 6 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
		case "wave":
			ctx.strokeStyle = "#44aaff";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(x - 12 * scale, y - 4 * scale);
			ctx.bezierCurveTo(
				x - 6 * scale,
				y - 10 * scale,
				x + 6 * scale,
				y + 2 * scale,
				x + 12 * scale,
				y - 4 * scale,
			);
			ctx.stroke();
			break;
		case "sign":
			ctx.fillStyle = "#ffff00";
			ctx.fillRect(x - 10 * scale, y - 20 * scale, 20 * scale, 12 * scale);
			ctx.fillStyle = "#222";
			ctx.fillRect(x - 1 * scale, y - 8 * scale, 2 * scale, 8 * scale);
			break;
		case "vine":
			ctx.strokeStyle = "#1a5a1a";
			ctx.lineWidth = 2;
			for (let i = 0; i < 3; i++) {
				ctx.beginPath();
				ctx.moveTo(x + i * 4 * scale, y);
				ctx.bezierCurveTo(
					x + i * 4 * scale - 5 * scale,
					y - 10 * scale,
					x + i * 4 * scale + 5 * scale,
					y - 20 * scale,
					x + i * 4 * scale,
					y - 30 * scale,
				);
				ctx.stroke();
			}
			break;
		case "car":
			ctx.fillStyle = "#4488ff";
			ctx.fillRect(x - 14 * scale, y - 10 * scale, 28 * scale, 10 * scale);
			ctx.fillStyle = "#3366cc";
			ctx.fillRect(x - 8 * scale, y - 18 * scale, 16 * scale, 8 * scale);
			ctx.fillStyle = "#222";
			ctx.beginPath();
			ctx.arc(x - 9 * scale, y, 4 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.beginPath();
			ctx.arc(x + 9 * scale, y, 4 * scale, 0, Math.PI * 2);
			ctx.fill();
			break;
		case "snow":
			ctx.fillStyle = "#ddeeff";
			for (let i = 0; i < 5; i++) {
				ctx.beginPath();
				ctx.arc(x + (i - 2) * 5 * scale, y - 3 * scale, 2 * scale, 0, Math.PI * 2);
				ctx.fill();
			}
			break;
		case "seagull":
			ctx.strokeStyle = "#ffffff";
			ctx.lineWidth = 1.5;
			ctx.beginPath();
			ctx.moveTo(x - 8 * scale, y);
			ctx.quadraticCurveTo(x - 4 * scale, y - 5 * scale, x, y);
			ctx.quadraticCurveTo(x + 4 * scale, y - 5 * scale, x + 8 * scale, y);
			ctx.stroke();
			break;
		case "parrot":
			ctx.fillStyle = "#ff4444";
			ctx.beginPath();
			ctx.arc(x, y - 6 * scale, 5 * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillStyle = "#44ff44";
			ctx.fillRect(x - 8 * scale, y - 4 * scale, 6 * scale, 4 * scale);
			ctx.fillRect(x + 2 * scale, y - 4 * scale, 6 * scale, 4 * scale);
			break;
	}
}

export default function TravelCinematic({ onEnd }: TravelCinematicProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const state = useGameStore((s) => s.state);

	const tickRef = useRef(0);
	const activeRef = useRef(true);
	const rafRef = useRef<number>(0);
	const entitiesRef = useRef<Entity[]>([]);
	const scrollOffsetRef = useRef(0);
	const [fadeOut, setFadeOut] = useState(false);
	const endCalledRef = useRef(false);

	const stopIdx = state?.stopIdx ?? 0;
	const currentStop = TRAIL_STOPS[stopIdx];
	const nextStop = TRAIL_STOPS[Math.min(stopIdx + 1, TRAIL_STOPS.length - 1)];
	const biomeId: Biome = (nextStop?.biome ?? currentStop?.biome ?? Biome.Desert) as Biome;
	const biomeConfig = BIOME_CONFIGS[biomeId] ?? BIOME_CONFIGS[Biome.Desert];

	// Total stops for progress
	const totalStops = TRAIL_STOPS.length - 1;
	const progressFraction = stopIdx / totalStops;

	const spawnEntity = useCallback(
		(W: number, H: number): Entity | null => {
			const roadY = H * 0.75;
			const groundY = H * 0.85;

			// Easter egg chance
			const isEasterEgg = Math.random() < 0.05;
			if (isEasterEgg && biomeConfig.easterEggs.length > 0) {
				const eggType = biomeConfig.easterEggs[
					Math.floor(Math.random() * biomeConfig.easterEggs.length)
				] as EasterEggType;
				if (eggType === "ufo") {
					return {
						type: "ufo",
						x: W + 40,
						y: H * 0.2 + Math.random() * H * 0.2,
						speed: 3.5,
						scale: 1.0,
						layer: 2,
					};
				}
				if (eggType === "bigfoot") {
					return {
						type: "bigfoot",
						x: W + 40,
						y: groundY,
						speed: 1.8,
						scale: 1.0,
						layer: 3,
					};
				}
				if (eggType === "godzilla") {
					return {
						type: "godzilla",
						x: W + 60,
						y: groundY,
						speed: 1.5,
						scale: 1.5,
						layer: 2,
					};
				}
			}

			// Normal entity from biome
			const entityTypes = biomeConfig.entities;
			const type = entityTypes[Math.floor(Math.random() * entityTypes.length)];
			if (!type) return null;

			// Layer and speed assignment
			let y: number;
			let speed: number;
			let scale: number;
			let layer: number;

			if (type === "car") {
				y = roadY - 4;
				speed = 4.5 + Math.random() * 3;
				scale = 0.7 + Math.random() * 0.3;
				layer = 4;
			} else if (type === "building" || type === "sign") {
				y = groundY;
				speed = 2.0;
				scale = 0.8 + Math.random() * 0.5;
				layer = 3;
			} else if (type === "wave" || type === "seagull" || type === "parrot") {
				y = H * 0.55 + Math.random() * 50;
				speed = 1.2 + Math.random() * 0.6;
				scale = 0.8;
				layer = 2;
			} else {
				y = groundY + Math.random() * 10;
				speed = 1.5 + Math.random() * 1.5;
				scale = 0.7 + Math.random() * 0.5;
				layer = 3;
			}

			return {
				type,
				x: W + 50,
				y,
				speed,
				scale,
				layer,
			};
		},
		[biomeConfig],
	);

	useEffect(() => {
		function loop() {
			if (!activeRef.current) return;
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const W = canvas.offsetWidth || 360;
			const H = canvas.offsetHeight || 240;
			canvas.width = W;
			canvas.height = H;

			const tick = tickRef.current;
			tickRef.current++;
			scrollOffsetRef.current += 2;
			const scroll = scrollOffsetRef.current;

			// ----- LAYER 1: Sky gradient -----
			const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
			skyGrad.addColorStop(0, biomeConfig.bgGradient[0]);
			skyGrad.addColorStop(1, biomeConfig.bgGradient[1]);
			ctx.fillStyle = skyGrad;
			ctx.fillRect(0, 0, W, H);

			// Stars / atmosphere (desert, mountain, city)
			if (biomeId === Biome.Desert || biomeId === Biome.Mountain || biomeId === Biome.City) {
				ctx.fillStyle = "rgba(255,255,255,0.7)";
				const starCount = 30;
				for (let i = 0; i < starCount; i++) {
					const sx = ((Math.sin(i * 13.7) * 0.5 + 0.5) * W) | 0;
					const sy = ((Math.sin(i * 7.3) * 0.5 + 0.5) * H * 0.55) | 0;
					const blink = Math.sin(tick * 0.05 + i) > 0.7 ? 2 : 1;
					ctx.fillRect(sx, sy, blink, blink);
				}
			}

			// ----- LAYER 2: Far terrain (mountains/hills) speed 0.5 -----
			const terrainOffset = scroll * 0.5;
			const groundTopY = H * 0.6;
			const groundBotY = H * 0.75;

			if (biomeId === Biome.Mountain) {
				drawMountain(ctx, terrainOffset, groundTopY, W, "#3a3a5a", "#ddeeff");
			} else if (biomeId === Biome.Desert) {
				// Sand dunes
				ctx.fillStyle = "#c4a35a";
				ctx.beginPath();
				ctx.moveTo(0, groundBotY);
				for (let x = 0; x <= W; x += 20) {
					const py = groundTopY + Math.sin((x + terrainOffset) * 0.015) * 20;
					ctx.lineTo(x, py);
				}
				ctx.lineTo(W, groundBotY);
				ctx.closePath();
				ctx.fill();
			} else if (biomeId === Biome.Jungle || biomeId === Biome.Coast) {
				drawMountain(ctx, terrainOffset, groundTopY, W, biomeConfig.groundColor, null);
			} else if (biomeId === Biome.City) {
				// City skyline silhouette
				ctx.fillStyle = "#111122";
				for (let bx = (((-terrainOffset * 0.4) % 80) | 0) - 80; bx < W + 80; bx += 50) {
					const bh = (40 + (Math.sin(bx * 0.07) * 0.5 + 0.5) * 60) | 0;
					ctx.fillRect(
						bx,
						groundTopY - bh,
						(30 + (Math.sin(bx * 0.1) * 0.5 + 0.5) * 20) | 0,
						bh + 40,
					);
				}
			}

			// ----- LAYER 3: Ground -----
			ctx.fillStyle = biomeConfig.groundColor;
			ctx.fillRect(0, H * 0.72, W, H * 0.28);

			// ----- LAYER 4: Road -----
			const roadY = H * 0.75;
			const roadH = H * 0.18;
			ctx.fillStyle = biomeConfig.roadColor;
			ctx.fillRect(0, roadY, W, roadH);

			// Animated road dashes
			const dashSpeed = scroll * 2;
			ctx.fillStyle = "#ffdd00";
			const dashW = 30;
			const dashGap = 50;
			const dashTotal = dashW + dashGap;
			const dashY = roadY + roadH * 0.45;
			const dashOffset = dashSpeed % dashTotal;
			for (let dx = -dashTotal + dashOffset; dx < W + dashTotal; dx += dashTotal) {
				ctx.fillRect(dx, dashY, dashW, 3);
			}

			// Road edge lines
			ctx.fillStyle = "#888";
			ctx.fillRect(0, roadY, W, 2);
			ctx.fillRect(0, roadY + roadH, W, 2);

			// ----- Mid-ground entities (layers 2-3) -----
			for (const ent of entitiesRef.current) {
				if (ent.layer <= 3) {
					drawEntity(ctx, ent, tick);
				}
			}

			// ----- Player car sprite -----
			drawCar(ctx, W * 0.25, roadY + roadH * 0.5, 1.0, tick);

			// ----- Foreground entities (layer 4) -----
			for (const ent of entitiesRef.current) {
				if (ent.layer === 4) {
					drawEntity(ctx, ent, tick);
				}
			}

			// Move and clean up entities
			const speedMultiplier = 1.0;
			entitiesRef.current = entitiesRef.current
				.map((e) => ({ ...e, x: e.x - e.speed * speedMultiplier }))
				.filter((e) => e.x > -100);

			// Spawn new entities
			if (tick % 55 === 0) {
				const ent = spawnEntity(W, H);
				if (ent) {
					entitiesRef.current = [...entitiesRef.current, ent];
				}
			}

			// ----- Progress bar -----
			const barH = 6;
			const barW = W - 32;
			ctx.fillStyle = "#1a1a1a";
			ctx.fillRect(16, H - 16, barW, barH);
			ctx.fillStyle = "#ff6600";
			ctx.fillRect(16, H - 16, barW * progressFraction, barH);
			ctx.fillStyle = "#ff6600";
			ctx.beginPath();
			ctx.arc(16 + barW * progressFraction, H - 13, 4, 0, Math.PI * 2);
			ctx.fill();

			// Current/next stop labels
			ctx.fillStyle = "#ff6600";
			ctx.font = "bold 9px monospace";
			ctx.textAlign = "left";
			ctx.fillText(currentStop?.name ?? "", 16, H - 22);
			ctx.textAlign = "right";
			ctx.fillStyle = "#888";
			ctx.fillText(nextStop?.name ?? "", W - 16, H - 22);

			// Auto-end after ~4 seconds (240 frames)
			if (tick >= 240 && !endCalledRef.current) {
				endCalledRef.current = true;
				activeRef.current = false;
				setFadeOut(true);
				setTimeout(() => {
					onEnd();
				}, 500);
				return;
			}

			rafRef.current = requestAnimationFrame(loop);
		}

		rafRef.current = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(rafRef.current);
		};
	}, [biomeConfig, biomeId, spawnEntity, onEnd, progressFraction, currentStop, nextStop]);

	// Cleanup
	useEffect(() => {
		return () => {
			activeRef.current = false;
			cancelAnimationFrame(rafRef.current);
		};
	}, []);

	return (
		<div
			className="fixed inset-0 flex flex-col bg-black"
			style={{
				opacity: fadeOut ? 0 : 1,
				transition: "opacity 0.5s ease-out",
			}}
		>
			{/* Destination header */}
			<div
				className="safe-top flex shrink-0 items-center justify-between px-4 py-2"
				style={{ background: "rgba(0,0,0,0.6)" }}
			>
				<span className="text-[12px] font-bold text-orange" style={{ fontFamily: "monospace" }}>
					{currentStop?.emoji ?? ""} {currentStop?.name ?? ""}
				</span>
				<span className="text-[11px] text-[#888]" style={{ fontFamily: "monospace" }}>
					{"→ "}
					{nextStop?.emoji ?? ""} {nextStop?.name ?? ""}
				</span>
			</div>

			{/* Canvas */}
			<canvas
				ref={canvasRef}
				className="block flex-1 w-full"
				style={{ imageRendering: "pixelated" }}
			/>

			{/* Skip button */}
			<div className="safe-bottom shrink-0 px-4 py-2" style={{ background: "rgba(0,0,0,0.6)" }}>
				<button
					type="button"
					onClick={() => {
						if (!endCalledRef.current) {
							endCalledRef.current = true;
							activeRef.current = false;
							setFadeOut(true);
							setTimeout(onEnd, 300);
						}
					}}
					className="w-full py-2 text-[12px] font-bold tracking-widest active:opacity-75"
					style={{
						border: "1px solid #444",
						color: "#666",
						background: "transparent",
						fontFamily: "monospace",
					}}
				>
					SKIP
				</button>
			</div>
		</div>
	);
}
