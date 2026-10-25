export const MISSIONS = [
  {
    id: 'feed', number: 1, title: 'Operation: Feed Everyone',
    briefing: 'Collect 3 snack parcels and 2 water bottles. A hungry crowd is not a happy crowd!',
    objectives: [{ type: 'deliver', item: 'snack', count: 3 }, { type: 'deliver', item: 'water', count: 2 }],
    reward: 250, unlock: 'barricade'
  },
  {
    id: 'barricade', number: 2, title: 'The Great Barricade Confusion',
    briefing: 'The barricades are facing the snack stall. Push two aside, then dismantle the wonky one.',
    objectives: [{ type: 'barricade', count: 3 }],
    reward: 300, unlock: 'chai'
  },
  {
    id: 'chai', number: 3, title: 'Find the Missing Chai',
    briefing: 'Chai Uncle misplaced his sacred kettle. Find it near the tents and return it before panic boils over.',
    objectives: [{ type: 'collect', item: 'chai', count: 1 }, { type: 'return', target: 'chaiUncle', count: 1 }],
    reward: 350, unlock: 'sleepy'
  },
  {
    id: 'sleepy', number: 4, title: 'Rescue the Sleepy Protester',
    briefing: 'Wake Snoozy near the back tents and escort them safely to the first-aid camp.',
    objectives: [{ type: 'wake', count: 1 }, { type: 'escort', count: 1 }],
    reward: 400, unlock: 'dance'
  },
  {
    id: 'dance', number: 5, title: 'The Accidental Dance Revolution',
    briefing: 'Dance near three different clusters. If they join in, the revolution gets a beat.',
    objectives: [{ type: 'dance', count: 3 }],
    reward: 450, unlock: 'water'
  },
  {
    id: 'water', number: 6, title: 'The Great Water Bottle Shortage',
    briefing: 'Bring four bottles from the coolers to thirsty folks. No dramatic dehydration speeches, please.',
    objectives: [{ type: 'deliver', item: 'water', count: 4 }],
    reward: 500, unlock: 'tourist'
  },
  {
    id: 'tourist', number: 7, title: 'The Confused Tourist',
    briefing: 'A tourist thinks this is a parade. Guide them past the barricades to the Metro exit.',
    objectives: [{ type: 'guide', count: 1 }],
    reward: 550, unlock: 'banner'
  },
  {
    id: 'banner', number: 8, title: 'Banner Emergency',
    briefing: 'Rescue the runaway banner before it becomes a tent roof. Return it to the stage.',
    objectives: [{ type: 'collect', item: 'banner', count: 1 }, { type: 'return', target: 'stage', count: 1 }],
    reward: 600, unlock: 'cleanup'
  },
  {
    id: 'cleanup', number: 9, title: 'The Cleanup Conundrum',
    briefing: 'Collect 5 scattered placards. A tidy protest is still a protest.',
    objectives: [{ type: 'collect', item: 'placard', count: 5 }],
    reward: 650, unlock: 'final'
  },
  {
    id: 'final', number: 10, title: 'The Final Chaos Challenge',
    briefing: 'Reach 80 chaos, dodge a patrol, then make a grand dance circle at the stage!',
    objectives: [{ type: 'chaos', count: 80 }, { type: 'evade', count: 1 }, { type: 'dance', count: 1 }],
    reward: 1000
  }
];

export const findMission = (id) => MISSIONS.find((mission) => mission.id === id);
