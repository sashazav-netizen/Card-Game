import { Hero, ItemSlot, Card, NodeType } from "../types";
import { STAGE_NODES } from "../data/gameData";

export function getDamageBonus(hero: Hero): number {
  let bonus = 0;
  if (hero.equippedItems[ItemSlot.WEAPON]) {
    bonus += hero.equippedItems[ItemSlot.WEAPON]!.damageBonus;
  }
  if (hero.equippedItems[ItemSlot.ARMOR]) {
    bonus += hero.equippedItems[ItemSlot.ARMOR]!.damageBonus;
  }
  if (hero.equippedItems[ItemSlot.ACCESSORY]) {
    bonus += hero.equippedItems[ItemSlot.ACCESSORY]!.damageBonus;
  }
  return bonus;
}

export function getBlockBonus(hero: Hero): number {
  let bonus = 0;
  if (hero.equippedItems[ItemSlot.WEAPON]) {
    bonus += hero.equippedItems[ItemSlot.WEAPON]!.blockBonus;
  }
  if (hero.equippedItems[ItemSlot.ARMOR]) {
    bonus += hero.equippedItems[ItemSlot.ARMOR]!.blockBonus;
  }
  if (hero.equippedItems[ItemSlot.ACCESSORY]) {
    bonus += hero.equippedItems[ItemSlot.ACCESSORY]!.blockBonus;
  }
  return bonus;
}

export function getMaxHpBonus(hero: Hero): number {
  let bonus = 0;
  if (hero.equippedItems[ItemSlot.WEAPON]) {
    bonus += hero.equippedItems[ItemSlot.WEAPON]!.hpBonus;
  }
  if (hero.equippedItems[ItemSlot.ARMOR]) {
    bonus += hero.equippedItems[ItemSlot.ARMOR]!.hpBonus;
  }
  if (hero.equippedItems[ItemSlot.ACCESSORY]) {
    bonus += hero.equippedItems[ItemSlot.ACCESSORY]!.hpBonus;
  }
  return bonus;
}

export function getMaxManaBonus(hero: Hero): number {
  let bonus = 0;
  if (hero.equippedItems[ItemSlot.WEAPON]) {
    bonus += hero.equippedItems[ItemSlot.WEAPON]!.manaBonus;
  }
  if (hero.equippedItems[ItemSlot.ARMOR]) {
    bonus += hero.equippedItems[ItemSlot.ARMOR]!.manaBonus;
  }
  if (hero.equippedItems[ItemSlot.ACCESSORY]) {
    bonus += hero.equippedItems[ItemSlot.ACCESSORY]!.manaBonus;
  }
  return bonus;
}

export function getModifiedCard(card: Card, hero: Hero): Card {
  const dmgBonus = getDamageBonus(hero);
  const blkBonus = getBlockBonus(hero);

  return {
    ...card,
    damage: card.damage !== undefined ? card.damage + dmgBonus : undefined,
    block: card.block !== undefined ? card.block + blkBonus : undefined,
  };
}

export function getRarityColor(rarity: string) {
  switch (rarity) {
    case "COMMON":
      return "text-gray-400 border-gray-400 bg-gray-500/10";
    case "RARE":
      return "text-blue-400 border-blue-400 bg-blue-500/10";
    case "LEGENDARY":
      return "text-amber-400 border-amber-400 bg-amber-500/10";
    default:
      return "text-gray-300 border-gray-300 bg-gray-500/10";
    }
}

export function getRarityBg(rarity: string) {
  switch (rarity) {
    case "COMMON":
      return "bg-slate-800 border-slate-700 text-slate-300";
    case "RARE":
      return "bg-slate-900 border-blue-900 text-blue-100";
    case "LEGENDARY":
      return "bg-slate-950 border-amber-500/40 text-amber-100";
    default:
      return "bg-slate-800 border-slate-700 text-slate-300";
  }
}

export function getRarityLabel(rarity: string): string {
  switch (rarity) {
    case "COMMON":
      return "נפוץ";
    case "RARE":
      return "נדיר";
    case "LEGENDARY":
      return "אגדי";
    default:
      return "נפוץ";
  }
}

export function getUpgradeIncrement(item: any) {
  // Upgrades add +25% stats
  return {
    hpBonus: item.hpBonus > 0 ? Math.ceil(item.hpBonus * 0.4) : 0,
    damageBonus: item.damageBonus > 0 ? Math.max(1, Math.ceil(item.damageBonus * 0.4)) : 0,
    blockBonus: item.blockBonus > 0 ? Math.max(1, Math.ceil(item.blockBonus * 0.4)) : 0,
    manaBonus: 0, // mana shouldn't scale infinitely
  };
}

export function getMonsterScaleMultiplier(stage: number): number {
  const cycleNum = Math.floor((stage - 1) / 10);
  // scaling goes up by 15% every 10 stages
  return 1.0 + (cycleNum * 0.15);
}

export function getStageNodeFor(stage: number) {
  const cycleIndex = (stage - 1) % 10;
  const cycleNum = Math.floor((stage - 1) / 10);
  const template = STAGE_NODES[cycleIndex];
  
  let hebrewName = template.hebrewName;
  if (cycleNum > 0) {
    if (template.type === NodeType.BOSS) {
      hebrewName = `בוס עליון: דרקון האש (שלב ${stage})`;
    } else if (template.type === NodeType.ELITE) {
      hebrewName = `${template.hebrewName} (עילית שלב ${stage})`;
    } else {
      hebrewName = `${template.hebrewName} (שלב ${stage})`;
    }
  }

  return {
    stage,
    name: `${template.name} +${cycleNum}`,
    hebrewName,
    type: template.type,
  };
}
