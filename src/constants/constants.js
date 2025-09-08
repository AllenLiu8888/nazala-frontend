// Game configuration constants
export const GAME_CONFIG = {
  TOTAL_ROUNDS: 10,
  DECISION_TIME_LIMIT: 60, // seconds
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
};

// World attributes
export const WORLD_ATTRIBUTES = {
  COMMERCIAL_POWER: 'Commercial Power',
  PERSONAL_PRIVACY: 'Personal Privacy',
  TECHNOLOGICAL_DEVELOPMENT: 'Technological Development',
  SOCIAL_EQUALITY: 'Social Equality',
  CULTURAL_DIVERSITY: 'Cultural Diversity',
  MEMORY_INTEGRITY: 'Memory Integrity',
};

// Game states
export const GAME_STATES = {
  WAITING: 'waiting',
  INTRO: 'intro',
  IN_PROGRESS: 'in_progress',
  ROUND_RESULT: 'round_result',
  GAME_OVER: 'game_over',
};

// Player states
export const PLAYER_STATES = {
  JOINING: 'joining',
  READY: 'ready',
  VOTING: 'voting',
  VOTED: 'voted',
};