import { create } from "zustand";
import type { MessageType, PlayerData } from "../types";

interface ChatMessage {
	sender: string;
	senderName: string;
	text: string;
	system?: boolean;
}

interface PeerInfo {
	name: string;
	player: PlayerData;
}

/** Lightweight interface so networkStore can broadcast without importing peerManager directly. */
interface BroadcastFn {
	(msg: MessageType): void;
}

/** Injected by peerManager after its own module initializes to break the circular dep. */
let _broadcast: BroadcastFn | null = null;

export function injectBroadcast(fn: BroadcastFn): void {
	_broadcast = fn;
}

interface NetworkStore {
	roomId: string | null;
	isHost: boolean;
	status: "disconnected" | "connecting" | "connected" | "error";
	peers: Record<string, PeerInfo>;
	localPlayerId: string;
	localPlayerName: string;
	localStream: MediaStream | null;
	micMuted: boolean;
	camOn: boolean;
	chatMessages: ChatMessage[];
	chatBadge: number;
	chatOpen: boolean;
	shankAlert: { from: string; fromName: string; timestamp: number } | null;

	setRoomId: (roomId: string | null) => void;
	setHost: (isHost: boolean) => void;
	setStatus: (status: NetworkStore["status"]) => void;
	setLocalIdentity: (id: string, name: string) => void;
	addPeer: (id: string, info: PeerInfo) => void;
	removePeer: (id: string) => void;
	setLocalStream: (stream: MediaStream | null) => void;
	toggleMic: () => void;
	toggleCam: () => void;
	addChatMessage: (msg: ChatMessage) => void;
	toggleChat: () => void;
	clearBadge: () => void;
	reset: () => void;
	// Shank PvP actions
	receiveShankAlert: (from: string, fromName: string) => void;
	clearShankAlert: () => void;
	sendShankAlert: (targetPid: string) => void;
	sendShankDodge: () => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
	roomId: null,
	isHost: false,
	status: "disconnected",
	peers: {},
	localPlayerId: "",
	localPlayerName: "",
	localStream: null,
	micMuted: false,
	camOn: true,
	chatMessages: [],
	chatBadge: 0,
	chatOpen: false,
	shankAlert: null,

	setRoomId: (roomId) => {
		set({ roomId });
	},

	setHost: (isHost) => {
		set({ isHost });
	},

	setStatus: (status) => {
		set({ status });
	},

	setLocalIdentity: (id, name) => {
		set({ localPlayerId: id, localPlayerName: name });
	},

	addPeer: (id, info) => {
		set((s) => ({ peers: { ...s.peers, [id]: info } }));
	},

	removePeer: (id) => {
		set((s) => {
			const { [id]: _, ...rest } = s.peers;
			void _;
			return { peers: rest };
		});
	},

	setLocalStream: (stream) => {
		set({ localStream: stream });
	},

	toggleMic: () => {
		const { localStream, micMuted } = get();
		if (localStream) {
			for (const track of localStream.getAudioTracks()) {
				track.enabled = micMuted; // flip: was muted -> now unmuted
			}
		}
		set({ micMuted: !micMuted });
	},

	toggleCam: () => {
		const { localStream, camOn } = get();
		if (localStream) {
			for (const track of localStream.getVideoTracks()) {
				track.enabled = !camOn; // flip: was on -> now off
			}
		}
		set({ camOn: !camOn });
	},

	addChatMessage: (msg) => {
		set((s) => ({
			chatMessages: [...s.chatMessages, msg],
			chatBadge: s.chatOpen ? s.chatBadge : s.chatBadge + 1,
		}));
	},

	toggleChat: () => {
		const { chatOpen } = get();
		set({ chatOpen: !chatOpen, chatBadge: chatOpen ? get().chatBadge : 0 });
	},

	clearBadge: () => {
		set({ chatBadge: 0 });
	},

	reset: () => {
		// Stop all media tracks before dropping the reference
		const { localStream } = get();
		if (localStream) {
			for (const track of localStream.getTracks()) {
				track.stop();
			}
		}
		set({
			roomId: null,
			isHost: false,
			status: "disconnected",
			peers: {},
			localStream: null,
			micMuted: false,
			camOn: true,
			chatMessages: [],
			chatBadge: 0,
			chatOpen: false,
			shankAlert: null,
		});
	},

	// -----------------------------------------------------------
	// Shank PvP actions
	// -----------------------------------------------------------

	receiveShankAlert: (from, fromName) => {
		set({ shankAlert: { from, fromName, timestamp: Date.now() } });
	},

	clearShankAlert: () => {
		set({ shankAlert: null });
	},

	sendShankAlert: (targetPid) => {
		const { localPlayerId, localPlayerName } = get();
		_broadcast?.({
			type: "SHANK_ALERT",
			from: localPlayerId,
			fromName: localPlayerName,
			targetPid,
		});
	},

	sendShankDodge: () => {
		const { localPlayerId } = get();
		_broadcast?.({
			type: "SHANK_DODGE",
			targetPid: localPlayerId,
		});
	},
}));
