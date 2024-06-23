export type PlanetType = {
  index: number;
  name: string;
  sector: string;
  biome: BiomeType;
  hazards: HazardType[];
  hash: number;
  position: {
    x: number;
    y: number;
  };
  waypoints: number[];
  maxHealth: number;
  health: number;
  disabled: boolean;
  initialOwner: string;
  currentOwner: string;
  regenPerSecond: number;
  event?: PlanetEventType;
  statistics: PlanetStatisticsType;
  attacking: number[];
};

export type BiomeType = {
  name: string;
  description: string;
};

export type HazardType = {
  name: string;
  description: string;
};

export type PlanetEventType = {
  eventType: number;
  faction: string;
  health: number;
  maxHealth: number;
  startTime: Date;
  endTime: Date;
  campaignId: number;
  jointOperationIds: number[];
};

export type PlanetStatisticsType = {
  missionsWon: number;
  missionsLost: number;
  missionTime: number;
  terminidKills: number;
  automatonKills: number;
  illuminateKills: number;
  bulletsFired: number;
  bulletsHit: number;
  timePlayed: number;
  deaths: number;
  revives: number;
  friendlies: number;
  missionSuccessRate: number;
  accuracy: number;
  playerCount: number;
};

export type NewsType = {
  id: number;
  /** unix time in seconds */
  published: number;
  type: number;
  message: string;
};
