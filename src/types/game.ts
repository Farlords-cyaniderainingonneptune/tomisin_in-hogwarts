export type HouseId = 'gryffindor' | 'ravenclaw' | 'hufflepuff' | 'slytherin';

export interface HouseInfo {
  id: HouseId;
  name: string;
  crest: string;
  tagline: string;
  color: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  baseHp: number;
  baseMp: number;
  baseSp: number;
  specialAbility: SpecialAbility;
  description: string;
  traits: string[];
}

export interface SpecialAbility {
  id: string;
  name: string;
  houseId: HouseId;
  description: string;
  mpCost: number;
  cooldownTurns: number;
  iconName: string;
  effectType: 'damage_buff' | 'mana_crit' | 'party_heal_shield' | 'poison_drain';
  value: number;
}

export type TargetType = 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self';

export interface Spell {
  id: string;
  name: string;
  houseAffinity?: HouseId | 'universal';
  tier: 1 | 2 | 3;
  costSp: number;
  mpCost: number;
  damage?: number;
  healing?: number;
  shield?: number;
  targetType: TargetType;
  description: string;
  runeSymbol: string;
  element: 'fire' | 'lightning' | 'earth' | 'shadow' | 'holy_sparkle' | 'ice';
  icon: string;
  color: string;
}

export type ItemType = 'potion' | 'wand' | 'relic' | 'scroll' | 'birthday_gift';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  description: string;
  effectDescription: string;
  hpRestore?: number;
  mpRestore?: number;
  atkBonus?: number;
  defBonus?: number;
  mpBonus?: number;
  value: number; // Galleons
  icon: string;
  usableInCombat: boolean;
  quantity: number;
}

export interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'poison' | 'shield' | 'stun';
  duration: number; // in turns
  value: number;
  icon: string;
}

export interface PlayerStats {
  str: number;
  int: number;
  agi: number;
  def: number;
}

export interface Player {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  isReady: boolean;
  house: HouseId | null;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  sp: number; // Spell points for store
  gold: number;
  stats: PlayerStats;
  specialAbility: SpecialAbility | null;
  abilityCooldown: number;
  spells: Spell[];
  inventory: InventoryItem[];
  equipped: {
    wand?: InventoryItem;
    relic?: InventoryItem;
  };
  statusEffects: StatusEffect[];
  currentAction?: string;
  isDefending?: boolean;
  partyName?: string;
  partyLink?: string;
  sortingQuestions?: SortingHatQuestion[];
}

export interface EnemyAbility {
  name: string;
  description: string;
  damage?: number;
  targetType: TargetType;
  appliesStatus?: StatusEffect;
  cooldown?: number;
  currentCooldown?: number;
}

export interface Enemy {
  id: string;
  name: string;
  type: 'wild_dog' | 'forest_spider' | 'evil_babalawo';
  title?: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attackPower: number;
  defense: number;
  speed: number;
  avatarUrl?: string;
  iconName: string;
  isBoss: boolean;
  statusEffects: StatusEffect[];
  abilities: EnemyAbility[];
  dialogue?: string[];
  color: string;
}

export interface BattleLogEntry {
  id: string;
  timestamp: number;
  turnNumber: number;
  actorName: string;
  actorType: 'player' | 'enemy' | 'system';
  actionName: string;
  targetName?: string;
  description: string;
  damage?: number;
  healing?: number;
  isCritical?: boolean;
  d20Roll?: number;
  icon?: string;
  color?: string;
}

export interface CombatState {
  wave: 1 | 2 | 3;
  maxWaves: 3;
  waveName: string;
  phase: 'initiative' | 'player_turn' | 'enemy_turn' | 'animating' | 'wave_cleared' | 'victory' | 'defeat';
  turnOrder: string[]; // List of entity IDs (players & enemies) in order of action
  currentTurnIndex: number;
  currentActorId: string;
  enemies: Enemy[];
  turnCount: number;
  battleLog: BattleLogEntry[];
  lastDiceRoll?: {
    rollerName: string;
    roll: number;
    modifier: number;
    total: number;
    isCrit: boolean;
    purpose: string;
  };
  pendingLoot?: InventoryItem[];
}

export interface SortingHatAnswer {
  text: string;
  house: HouseId;
  flavor: string;
}

export interface SortingHatQuestion {
  id: number;
  question: string;
  context: string;
  answers: SortingHatAnswer[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderHouse?: HouseId | null;
  text: string;
  timestamp: number;
  type: 'chat' | 'system' | 'roll' | 'loot';
}

export type GameStage = 'lobby' | 'sorting' | 'common_room' | 'quest_forest' | 'victory';

export interface GameRoom {
  code: string;
  name: string;
  hostId: string;
  maxPlayers: number;
  stage: GameStage;
  players: Record<string, Player>;
  combatState: CombatState | null;
  messages: ChatMessage[];
  createdAt: number;
  partyName?: string;
  partyLink?: string;
  sortingQuestions?: SortingHatQuestion[];
}
