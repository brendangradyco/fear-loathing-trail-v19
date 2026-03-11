import { useCallback, useEffect, useState } from "react";
import BuskGame from "./components/screens/BuskGame";
import CharCreate from "./components/screens/CharCreate";
import DeathScreen from "./components/screens/DeathScreen";
import DrugDealGame from "./components/screens/DrugDealGame";
import GameMap from "./components/screens/GameMap";
import HuntGame from "./components/screens/HuntGame";
import HustleGame from "./components/screens/HustleGame";
import Lobby from "./components/screens/Lobby";
import LocationSelect from "./components/screens/LocationSelect";
import ShankAlert from "./components/screens/ShankAlert";
import Shop from "./components/screens/Shop";
import SkillReview from "./components/screens/SkillReview";
import TravelCinematic from "./components/screens/TravelCinematic";
import WinScreen from "./components/screens/WinScreen";
import ToastContainer from "./components/shared/Toast";
import ChatPanel from "./components/social/ChatPanel";
import VideoOverlay from "./components/social/VideoOverlay";
import { loadGame, useGameStore } from "./stores/gameStore";
import { useNetworkStore } from "./stores/networkStore";
import { usePlayerStore } from "./stores/playerStore";
import { initAudio, playLoop } from "./audio/chiptune";
import type { Age, Sex } from "./types";
import { Phase, type Region, type Screen } from "./types";

export default function App() {
	const [screen, setScreen] = useState<Screen>("loading");
	const [isFirstShopVisit, setIsFirstShopVisit] = useState(true);

	const playerData = usePlayerStore((s) => s.data);
	const playerId = usePlayerStore((s) => s.id);
	const createCharacter = usePlayerStore((s) => s.createCharacter);
	const loadSavedPlayer = usePlayerStore((s) => s.loadSavedPlayer);
	const resetPlayer = usePlayerStore((s) => s.reset);

	const gameState = useGameStore((s) => s.state);
	const deathReason = useGameStore((s) => s.deathReason);
	const startGame = useGameStore((s) => s.startGame);
	const resumeGame = useGameStore((s) => s.resumeGame);
	const resetGame = useGameStore((s) => s.resetGame);

	const setRoomId = useNetworkStore((s) => s.setRoomId);
	const setHost = useNetworkStore((s) => s.setHost);
	const setStatus = useNetworkStore((s) => s.setStatus);
	const shankAlert = useNetworkStore((s) => s.shankAlert);

	// Init: check for saved player on mount
	useEffect(() => {
		const saved = loadSavedPlayer();
		if (saved) {
			// Check for existing game state
			const savedGame = loadGame();
			if (savedGame) {
				resumeGame(savedGame, playerId, saved.name);
				// Route based on game phase
				if (savedGame.phase === Phase.DEAD) {
					setScreen("dead");
				} else if (savedGame.phase === Phase.WIN) {
					setScreen("win");
				} else {
					setScreen("map");
					setIsFirstShopVisit(false);
				}
			} else {
				setScreen("lobby");
			}
		} else {
			setScreen("char");
		}

		// Generate room code
		const hash = window.location.hash.replace("#", "");
		const code =
			hash && hash.length >= 4
				? hash.toUpperCase()
				: Math.random().toString(36).slice(2, 8).toUpperCase();
		if (!hash || hash.length < 4) {
			window.location.hash = code;
		}
		setRoomId(code);
		setHost(true);
		setStatus("connected");
	}, [loadSavedPlayer, playerId, resumeGame, setHost, setRoomId, setStatus]); // eslint-disable-line react-hooks/exhaustive-deps

	// Init audio on first user interaction
	useEffect(() => {
		const handleFirstInteraction = () => {
			initAudio();
			playLoop();
			window.removeEventListener("click", handleFirstInteraction);
			window.removeEventListener("keydown", handleFirstInteraction);
		};
		window.addEventListener("click", handleFirstInteraction);
		window.addEventListener("keydown", handleFirstInteraction);
		return () => {
			window.removeEventListener("click", handleFirstInteraction);
			window.removeEventListener("keydown", handleFirstInteraction);
		};
	}, []);

	// Watch game phase changes for death/win routing
	useEffect(() => {
		if (!gameState) return;
		if (gameState.phase === Phase.DEAD && screen !== "dead") {
			setScreen("dead");
		} else if (gameState.phase === Phase.WIN && screen !== "win") {
			setScreen("win");
		}
	}, [gameState?.phase, gameState, screen]); // eslint-disable-line react-hooks/exhaustive-deps

	// Character creation complete
	const handleCharComplete = useCallback((name: string, sex: Sex, age: Age, quirks: string[]) => {
		// Store pending char data in sessionStorage, go to location select
		sessionStorage.setItem(
			"__pendingChar",
			JSON.stringify({ name, sex, age, quirks }),
		);
		setScreen("location");
	}, []);

	// Location selected
	const handleLocationComplete = useCallback(
		(region: Region) => {
			const raw = sessionStorage.getItem("__pendingChar");
			if (raw) {
				const pending = JSON.parse(raw) as {
					name: string;
					sex: Sex;
					age: Age;
					quirks: string[];
				};
				createCharacter(pending.name, pending.sex, pending.age, pending.quirks, region);
				sessionStorage.removeItem("__pendingChar");
			}
			setScreen("skills");
		},
		[createCharacter],
	);

	// Skills accepted
	const handleSkillsComplete = useCallback(() => {
		setScreen("lobby");
	}, []);

	// Lobby → start game (go to shop first)
	const handleStartGame = useCallback(() => {
		if (!playerData) return;
		startGame(playerId, playerData.name, playerData.skills);
		setScreen("shop");
		setIsFirstShopVisit(true);
	}, [playerData, playerId, startGame]);

	// Leave shop
	const handleShopLeave = useCallback(() => {
		setScreen("map");
		setIsFirstShopVisit(false);
	}, []);

	// Enter shop from map
	const handleShopOpen = useCallback(() => {
		setScreen("shop");
		setIsFirstShopVisit(false);
	}, []);

	// Hunt start
	const handleHuntStart = useCallback(() => {
		setScreen("hunt");
	}, []);

	// Hunt end
	const handleHuntEnd = useCallback(() => {
		setScreen("map");
	}, []);

	// Travel cinematic
	const handleTravelEnd = useCallback(() => {
		setScreen("map");
	}, []);

	// Hustle minigame
	const handleHustleEnd = useCallback(() => {
		setScreen("map");
	}, []);

	// Busk minigame
	const handleBuskEnd = useCallback(() => {
		setScreen("map");
	}, []);

	// Drug deal minigame
	const handleDrugDealEnd = useCallback(() => {
		setScreen("map");
	}, []);

	// Restart
	const handleRestart = useCallback(() => {
		resetGame();
		resetPlayer();
		setScreen("char");
	}, [resetGame, resetPlayer]);

	// Determine whether to show overlays
	const showOverlays =
		screen === "map" || screen === "shop" || screen === "hunt" || screen === "lobby";

	return (
		<>
			{/* Active screen */}
			{screen === "loading" && (
				<div className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg safe-top">
					<div className="h-10 w-10 animate-spin rounded-full border-3 border-border border-t-orange" />
					<h2 className="font-bold text-orange">We can&apos;t stop here...</h2>
					<p className="text-[12px] text-dim">this is bat country</p>
				</div>
			)}

			{screen === "char" && (
				<div className="animate-fade-in">
					<CharCreate onComplete={handleCharComplete} />
				</div>
			)}

			{screen === "location" && (
				<div className="animate-fade-in">
					<LocationSelect onComplete={handleLocationComplete} />
				</div>
			)}

			{screen === "skills" && (
				<div className="animate-fade-in">
					<SkillReview onComplete={handleSkillsComplete} />
				</div>
			)}

			{screen === "lobby" && (
				<div className="animate-fade-in">
					<Lobby onStartGame={handleStartGame} />
				</div>
			)}

			{screen === "shop" && (
				<div className="animate-fade-in">
					<Shop onLeave={handleShopLeave} isFirstVisit={isFirstShopVisit} onDrugDeal={() => setScreen("drugdeal")} />
				</div>
			)}

			{screen === "map" && (
				<div className="animate-fade-in">
					<GameMap
						onShop={handleShopOpen}
						onHunt={handleHuntStart}
						onHustle={() => setScreen("hustle")}
						onBusk={() => setScreen("busk")}
					/>
				</div>
			)}

			{screen === "hunt" && (
				<div className="animate-fade-in">
					<HuntGame onEnd={handleHuntEnd} />
				</div>
			)}

			{screen === "travel" && (
				<div className="animate-fade-in">
					<TravelCinematic onEnd={handleTravelEnd} />
				</div>
			)}

			{screen === "hustle" && (
				<div className="animate-fade-in">
					<HustleGame onEnd={handleHustleEnd} />
				</div>
			)}

			{screen === "busk" && (
				<div className="animate-fade-in">
					<BuskGame onEnd={handleBuskEnd} />
				</div>
			)}

			{screen === "drugdeal" && (
				<div className="animate-fade-in">
					<DrugDealGame onEnd={handleDrugDealEnd} />
				</div>
			)}

			{screen === "dead" && (
				<div className="animate-fade-in">
					<DeathScreen reason={deathReason} onRestart={handleRestart} />
				</div>
			)}

			{screen === "win" && (
				<div className="animate-fade-in">
					<WinScreen onRestart={handleRestart} />
				</div>
			)}

			{/* ShankAlert overlay — rendered on top of all screens when active */}
			{shankAlert && <ShankAlert />}

			{/* Overlays */}
			{showOverlays && (
				<>
					<VideoOverlay />
					<ChatPanel />
				</>
			)}

			{/* Toast notifications */}
			<ToastContainer />
		</>
	);
}
