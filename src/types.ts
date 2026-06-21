export enum CardType {
  ATTACK = "ATTACK",
  SKILL = "SKILL",
  POWER = "POWER"
}

export enum ItemSlot {
  WEAPON = "WEAPON",
  ARMOR = "ARMOR",
  ACCESSORY = "ACCESSORY"
}

export enum ItemRarity {
  COMMON = "COMMON",
  RARE = "RARE",
  LEGENDARY = "LEGENDARY"
}

export enum NodeType {
  COMBAT = "COMBAT",
  ELITE = "ELITE",
  BOSS = "BOSS",
  CHEST = "CHEST",
  SHOP = "SHOP",
  CAMPFIRE = "CAMPFIRE"
}

export interface Card {
  id: string;
  name: string;
  hebrewName: string;
  cost: number;
  type: CardType;
  damage?: number;
  block?: number;
  poison?: number;
  heal?: number;
  drawCards?: number;
  effectType?: "vulnerable" | "strength" | "shield" | "standard";
  effectValue?: number;
  description: string;
  hebrewDescription: string;
  icon: string; // Lucide icon name
  minLevel?: number;
}

export interface Item {
  id: string;
  name: string;
  hebrewName: string;
  slot: ItemSlot;
  rarity: ItemRarity;
  level: number;
  maxLevel: number;
  hpBonus: number;
  damageBonus: number;
  blockBonus: number;
  manaBonus: number;
  goldValue: number;
  upgradeCost: number;
  icon: string;
  description: string;
  hebrewDescription: string;
}

export interface Hero {
  id: string;
  instanceId?: string;
  name: string;
  hebrewName: string;
  classType: "warrior" | "mage" | "rogue" | "cleric" | "ranger";
  maxHp: number;
  currentHp: number;
  maxMana: number;
  gold: number;
  deck: Card[];
  equippedItems: {
    [ItemSlot.WEAPON]: Item | null;
    [ItemSlot.ARMOR]: Item | null;
    [ItemSlot.ACCESSORY]: Item | null;
  };
  inventory: Item[];
  stage: number; // Current run progress
  xp: number;
  level: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  classType: string;
  classNameHebrew: string;
  level: number;
  stage: number;
  gold: number;
  status: "victory" | "defeated" | "active" | "retired";
  date: string;
}

export interface MonsterIntent {
  type: "ATTACK" | "DEFEND" | "BUFF" | "SPELL" | "STUN";
  value?: number;
  description: string;
  hebrewDescription: string;
}

export interface Monster {
  id: string;
  name: string;
  hebrewName: string;
  maxHp: number;
  currentHp: number;
  block: number;
  intent: MonsterIntent;
  icon: string;
  isBoss: boolean;
  isElite: boolean;
  rewards: {
    gold: number;
    cardsCount: number;
    itemChance: number; // 0 to 100
  };
}

export interface GameEvent {
  title: string;
  hebrewTitle: string;
  description: string;
  hebrewDescription: string;
  options: {
    text: string;
    hebrewText: string;
    action: (hero: Hero) => { updatedHero: Hero; message: string; hebrewMessage: string };
  }[];
}
