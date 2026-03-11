import { Disease } from "../types";
import type { GameEvent } from "../types";

export const EVENTS: GameEvent[] = [
	{
		id: "bats",
		title: "BAT COUNTRY",
		text: "The bats are thick tonight. You can hear them breathing.",
		choices: [
			{
				id: "bats_floor",
				label: "Floor it",
				effects: { fuel: -15 },
				flavor: "Floored it through bat country.",
			},
			{
				id: "bats_embrace",
				label: "Embrace the bats",
				effects: { sanity: -10, fuel: 0 },
				flavor: "The bats carry you forward. Somehow 20 miles gained.",
			},
		],
	},
	{
		id: "lizard",
		title: "LIZARD PEOPLE",
		text: "The hotel clerk's face keeps shifting. Scales, man. Scales everywhere.",
		choices: [
			{
				id: "lizard_checkin",
				label: "Check in anyway",
				effects: { sanity: -15 },
				flavor: "You checked in. The scales were real.",
			},
			{
				id: "lizard_camp",
				label: "Camp outside",
				effects: { fuel: 5, sanity: 5 },
				flavor: "Slept under stars. No scales.",
			},
		],
	},
	{
		id: "attorney",
		title: "SAMOAN ATTORNEY",
		text: "A large Samoan man is flagging you down from the roadside.",
		choices: [
			{
				id: "attorney_pickup",
				label: "Pick him up",
				effects: { cash: 200 },
				flavor: "The attorney joins. He knows people.",
			},
			{
				id: "attorney_gun",
				label: "Gun it",
				effects: { sanity: -5 },
				flavor: "His curses echo for miles.",
			},
		],
	},
	{
		id: "river",
		title: "RAGING RIVER",
		text: "The road ends at a swollen river crossing. No bridge. A local with a boat eyes your cash.",
		choices: [
			{
				id: "river_ford",
				label: "Ford it",
				effects: { fuel: -30 },
				skillCheck: {
					skill: "driving",
					threshold: 35,
					passText: "Crossed clean. The Red Shark is amphibious.",
					failEffects: { fuel: -40, sanity: -20 },
					failText: "River wins. Fuel -40, sanity -20.",
				},
				flavor: "Driving check. Fuel -30 regardless.",
			},
			{
				id: "river_guide",
				label: "Pay the guide ($150)",
				effects: {},
				conditionalCheck: {
					resource: "cash",
					minRequired: 150,
					consumeAmount: 150,
					passText: "Guide gets you across. $150 well spent.",
					failEffects: { fuel: -30, sanity: -10 },
					failText: "Broke. Ford it the hard way. Fuel -30, sanity -10.",
				},
				flavor: "Pay $150 or suffer the ford.",
			},
		],
	},
	{
		id: "cards",
		title: "CARD SHARKS",
		text: "A card game in the back of a cantina. The players have the look of men who've seen things.",
		choices: [
			{
				id: "cards_play",
				label: "Play ($75)",
				effects: { cash: -75 },
				skillCheck: {
					skill: "smooth",
					threshold: 40,
					passEffects: { cash: 175 },
					passText: "Read every face. Won $100-299.",
					failText: "Lost the $75. The cards knew.",
				},
				flavor: "Smooth skill check. Win $100-299 or lose $75.",
			},
			{
				id: "cards_drive",
				label: "Drive on",
				effects: {},
				flavor: "Wisdom is knowing when not to play.",
			},
		],
	},
	{
		id: "busker",
		title: "STREET BUSKER",
		text: "A busker with a missing tooth and a full heart. He plays something that hits like a fist.",
		choices: [
			{
				id: "busker_tips",
				label: "Play for tips",
				effects: { cash: 39, fuel: -5 },
				flavor: "Stopped and played. $20-59 in tips. Fuel -5.",
			},
			{
				id: "busker_moving",
				label: "Keep moving",
				effects: {},
				flavor: "The music fades in the mirror.",
			},
		],
	},
	{
		id: "adrenochrome",
		title: "ADRENOCHROME",
		text: "Someone left a vial on the passenger seat. You don't remember buying it.",
		choices: [
			{
				id: "adrenochrome_take",
				label: "Take it",
				effects: { sanity: -25 },
				flavor: "Everything is neon and teeth. Miles blur past.",
			},
			{
				id: "adrenochrome_toss",
				label: "Throw it out",
				effects: { sanity: 5 },
				flavor: "Virtue is fleeting on this road.",
			},
		],
	},
	{
		id: "police",
		title: "HIGHWAY PATROL",
		text: "Flashing lights. The officer peers through your window for a long time.",
		choices: [
			{
				id: "police_disguise",
				label: "Use disguise",
				effects: {},
				conditionalCheck: {
					resource: "disguises",
					minRequired: 1,
					consumeAmount: 1,
					passText: "Disguise worked. Phew.",
					failEffects: { cash: -100 },
					failText: "No disguise. $100 fine.",
				},
				flavor: "Disguise consumed or $100 fine.",
			},
			{
				id: "police_talk",
				label: "Smooth talk",
				effects: {},
				skillCheck: {
					skill: "smooth",
					threshold: 30,
					passText: "Silver tongue saves the day.",
					failEffects: { cash: -150 },
					failText: "The cop is not impressed. $150.",
				},
				flavor: "Smooth skill check. Fail: $150.",
			},
		],
	},
	{
		id: "breakdown",
		title: "GREAT RED SHARK",
		text: "The car makes a sound that no car should make.",
		choices: [
			{
				id: "breakdown_fix",
				label: "Fix it",
				effects: { fuel: -20 },
				skillCheck: {
					skill: "mechanical",
					threshold: 30,
					passText: "Fixed. Barely.",
					failEffects: { fuel: -30 },
					failText: "Made it worse. Additional fuel -30.",
				},
				flavor: "Mechanical check. Fuel -20, fail adds -30.",
			},
			{
				id: "breakdown_drive",
				label: "Drive through it",
				effects: {},
				skillCheck: {
					skill: "driving",
					threshold: 50,
					passText: "Against all odds, it holds.",
					failEffects: { fuel: -50, sanity: -10 },
					failText: "Rough. Very rough. Fuel -50, sanity -10.",
				},
				flavor: "50/50. Fail: fuel -50, sanity -10.",
			},
		],
	},
	{
		id: "casino",
		title: "ROADSIDE CASINO",
		text: "A casino. On a highway. In the middle of nowhere. Naturally.",
		choices: [
			{
				id: "casino_gamble",
				label: "Gamble ($50)",
				effects: { cash: -50 },
				skillCheck: {
					skill: "charisma",
					threshold: 50,
					passEffects: { cash: 170 },
					passText: "You won $120!",
					failText: "Lost $50. The house always wins.",
				},
				flavor: "50/50. Win $120 net or lose $50.",
			},
			{
				id: "casino_drive",
				label: "Keep driving",
				effects: { sanity: 3 },
				flavor: "You drove past. A minor miracle.",
			},
		],
	},
	{
		id: "tuberculosis",
		title: "BLOOD IN THE HANDKERCHIEF",
		text: "You've been coughing for three days. The handkerchief tells the story.",
		choices: [
			{
				id: "tb_push",
				label: "Push through",
				effects: { sanity: -10, diseaseAdd: Disease.TB },
				flavor: "Road medicine. TB acquired. Sanity -10.",
			},
			{
				id: "tb_rest",
				label: "Rest up",
				effects: { fuel: -10, sanity: 5 },
				flavor: "Rested. Fuel -10, sanity +5.",
			},
		],
	},
	{
		id: "measles",
		title: "SPOTS",
		text: "Your skin is doing something unsettling. So is everyone else's in this town.",
		choices: [
			{
				id: "measles_ignore",
				label: "Ignore it",
				effects: { diseaseAdd: Disease.Measles },
				flavor: "Ignored. Measles acquired.",
			},
			{
				id: "measles_pullover",
				label: "Pull over and assess",
				effects: { sanity: -5 },
				flavor: "Assessment complete. Still itchy. Sanity -5.",
			},
		],
	},
	{
		id: "broken_bones",
		title: "THAT SOUND WAS YOUR RIB",
		text: "The crash was minor. The rib situation is not.",
		choices: [
			{
				id: "broken_set",
				label: "Set it yourself",
				effects: { sanity: -15, diseaseAdd: Disease.BrokenBones },
				flavor: "Self-set. Broken bones acquired. Sanity -15.",
			},
			{
				id: "broken_clinic",
				label: "Find a clinic ($200)",
				effects: {},
				conditionalCheck: {
					resource: "cash",
					minRequired: 200,
					consumeAmount: 200,
					passText: "Clinic patches you up. $200.",
					failEffects: { diseaseAdd: Disease.BrokenBones },
					failText: "Broke. Untreated fracture acquired.",
				},
				flavor: "$200 or broken bones disease.",
			},
		],
	},
	{
		id: "aids",
		title: "THE TEST RESULTS",
		text: "A clinic en route offers free testing. The results are in an envelope you didn't open for three days.",
		choices: [
			{
				id: "aids_accept",
				label: "Accept results",
				effects: { diseaseAdd: Disease.AIDS },
				flavor: "Positive. AIDS acquired.",
			},
			{
				id: "aids_retest",
				label: "Get retested ($80)",
				effects: {},
				conditionalCheck: {
					resource: "cash",
					minRequired: 80,
					consumeAmount: 80,
					passText: "Retested. Same result. $80 lighter.",
					failEffects: { diseaseAdd: Disease.AIDS },
					failText: "Broke. Can't retest. AIDS acquired.",
				},
				flavor: "$80 to retest or AIDS disease.",
			},
		],
	},
	{
		id: "mid_dabs",
		title: "MID DABS",
		text: "Someone left a rig in the cupholder. You hit it without thinking. It was not weed.",
		choices: [
			{
				id: "dabs_embrace",
				label: "Embrace the high",
				effects: { sanity: -20, diseaseAdd: Disease.Dabs },
				flavor: "Embraced. Mid dabs acquired. Sanity -20.",
			},
			{
				id: "dabs_pullover",
				label: "Pull over immediately",
				effects: { sanity: -8 },
				flavor: "Pulled over. Breathed. Sanity -8.",
			},
		],
	},
	{
		id: "wolves",
		title: "WOLVES",
		text: "A pack of wolves is blocking the road. They seem... expectant.",
		choices: [
			{
				id: "wolves_honk",
				label: "Honk and floor it",
				effects: {},
				skillCheck: {
					skill: "driving",
					threshold: 30,
					passText: "Wolves disperse. 70% of the time it works every time.",
					failEffects: { supplies: -1, sanity: -8 },
					failText: "One jumped on the car. Supplies -1, sanity -8.",
				},
				flavor: "70% clear, 30% supplies -1 sanity -8.",
			},
			{
				id: "wolves_offer",
				label: "Offer supplies",
				effects: { supplies: -1 },
				flavor: "Wolves nod. They were just hungry.",
			},
		],
	},
	{
		id: "diphtheria",
		title: "DIPHTHERIA",
		text: "The throat. The membrane. You know what this is.",
		choices: [
			{
				id: "diph_power",
				label: "Power through",
				effects: { diseaseAdd: Disease.Diphtheria },
				flavor: "Powered through. Diphtheria acquired.",
			},
			{
				id: "diph_medicine",
				label: "Find medicine ($120)",
				effects: {},
				conditionalCheck: {
					resource: "cash",
					minRequired: 120,
					consumeAmount: 120,
					passText: "Medicine found. $120. Throat clears.",
					failEffects: { diseaseAdd: Disease.Diphtheria },
					failText: "Broke. No medicine. Diphtheria acquired.",
				},
				flavor: "$120 or diphtheria disease.",
			},
		],
	},
	{
		id: "border",
		title: "BORDER CROSSING",
		text: "The border agent asks where you're going. The trunk smells of desperation.",
		choices: [
			{
				id: "border_improvise",
				label: "Improvise wildly",
				effects: {},
				skillCheck: {
					skill: "charisma",
					threshold: 40,
					passText: "They let you through somehow.",
					failEffects: { cash: -80 },
					failText: "Inspection fee. $80.",
				},
				flavor: "Charisma check. Fail: $80.",
			},
			{
				id: "border_truth",
				label: "Tell the truth",
				effects: { sanity: 5 },
				flavor: "Honesty at the border. Sanity +5.",
			},
		],
	},
	{
		id: "feast",
		title: "ROADSIDE FEAST",
		text: "Locals invite you to a barbecue. The meat smells incredible.",
		choices: [
			{
				id: "feast_join",
				label: "Join them",
				effects: { supplies: 2, sanity: 10 },
				flavor: "Best meal of the trip. No questions asked.",
			},
			{
				id: "feast_drive",
				label: "Keep moving",
				effects: { sanity: -5 },
				flavor: "The smell haunts you for 200 miles.",
			},
		],
	},
];
