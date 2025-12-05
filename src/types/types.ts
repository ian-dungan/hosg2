export interface CharacterClass {
  id: string;
  name: string;
  description: string | null;
  base_health: number;
  base_mana: number;
  base_damage: number;
  base_defense: number;
  abilities: Ability[];
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  damage?: number;
  healing?: number;
  manaCost: number;
  effect?: string;
}

export interface Player {
  id: string;
  character_name: string;
  class_id: string;
  level: number;
  experience: number;
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  damage: number;
  defense: number;
  gold: number;
  position_x: number;
  position_y: number;
  skill_points: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  type: string;
  rarity: string;
  stats: Record<string, number>;
  stackable: boolean;
  max_stack: number;
  icon: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  player_id: string;
  item_id: string;
  quantity: number;
  slot_index: number | null;
  equipped: boolean;
  equipment_slot: string | null;
  created_at: string;
  item?: Item;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  objectives: QuestObjective[];
  rewards: QuestRewards;
  required_level: number;
  prerequisite_quest_id: string | null;
  created_at: string;
}

export interface QuestObjective {
  type: string;
  target: string;
  count: number;
  current: number;
}

export interface QuestRewards {
  experience: number;
  gold: number;
  items: string[];
}

export interface QuestProgress {
  id: string;
  player_id: string;
  quest_id: string;
  status: string;
  progress: Record<string, number>;
  started_at: string;
  completed_at: string | null;
  quest?: Quest;
}

export interface GameSession {
  id: string;
  name: string;
  host_player_id: string;
  max_players: number;
  status: string;
  game_state: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SessionPlayer {
  id: string;
  session_id: string;
  player_id: string;
  joined_at: string;
  is_ready: boolean;
  player?: Player;
}

export interface GameState {
  players: Map<string, PlayerState>;
  enemies: Enemy[];
  projectiles: Projectile[];
}

export interface PlayerState {
  id: string;
  character_name: string;
  class_id: string;
  x: number;
  y: number;
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  level: number;
  isMoving: boolean;
  direction: number;
  animation: string;
}

export interface Enemy {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  health: number;
  max_health: number;
  damage: number;
  experience: number;
  gold: number;
  isAlive: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  damage: number;
  speed: number;
  ownerId: string;
}
