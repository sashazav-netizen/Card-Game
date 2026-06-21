import React, { useState } from "react";
import { Hero, Item, ItemSlot, ItemRarity } from "../types";
import { LucideIcon } from "./LucideIcon";
import { motion, AnimatePresence } from "motion/react";
import {
  getDamageBonus,
  getBlockBonus,
  getMaxHpBonus,
  getMaxManaBonus,
  getRarityColor,
  getRarityBg,
  getRarityLabel,
  getUpgradeIncrement,
} from "../utils/gameHelpers";

interface InventoryPanelProps {
  hero: Hero;
  onClose: () => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (slot: ItemSlot) => void;
  onUpgradeItem: (item: Item) => void;
  onSellItem: (item: Item) => void;
  onRemoveCard: (cardIndex: number) => void;
  isOpen: boolean;
}

export function InventoryPanel({
  hero,
  onClose,
  onEquipItem,
  onUnequipItem,
  onUpgradeItem,
  onSellItem,
  onRemoveCard,
  isOpen,
}: InventoryPanelProps) {
  const [activeTab, setActiveTab] = useState<"gear" | "deck" | "stats">("gear");
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null);
  
  // Custom Deck Search & Filters states
  const [deckFilter, setDeckFilter] = useState<"all" | "ATTACK" | "SKILL" | "POWER">("all");
  const [deckSearch, setDeckSearch] = useState("");

  if (!isOpen) return null;

  const dmgBonus = getDamageBonus(hero);
  const blkBonus = getBlockBonus(hero);
  const hpBonus = getMaxHpBonus(hero);
  const manaBonus = getMaxManaBonus(hero);

  const totalMaxHp = hero.maxHp + hpBonus;
  const totalMaxMana = hero.maxMana + manaBonus;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-4 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        id="inventory-modal"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md md:max-w-3xl h-[78vh] flex flex-col overflow-hidden text-right shadow-2xl relative"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-850 bg-slate-950 flex flex-row-reverse items-center justify-between select-none">
          <button
            onClick={onClose}
            className="text-slate-405 hover:text-white p-1.5 hover:bg-slate-850 rounded-lg transition-colors cursor-pointer"
          >
            <LucideIcon name="X" size={20} />
          </button>
          
          <h2 className="text-base md:text-lg font-bold font-sans text-amber-100 flex items-center gap-2 flex-row-reverse">
            <LucideIcon name="Briefcase" className="text-amber-500" size={18} />
            מצב הגבור והציוד: {hero.hebrewName} (רמה {hero.level})
          </h2>

          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30 text-xs font-semibold">
            <LucideIcon name="Coins" size={13} />
            <span>{hero.gold} זהב</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-850 bg-slate-950/50">
          <button
            onClick={() => setActiveTab("gear")}
            className={`flex-1 py-2.5 text-center font-bold text-xs md:text-sm transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "gear"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <LucideIcon name="ShieldCheck" size={15} />
            ציוד וחפצים
          </button>
          <button
            onClick={() => setActiveTab("deck")}
            className={`flex-1 py-2.5 text-center font-bold text-xs md:text-sm transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "deck"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <LucideIcon name="Layers" size={15} />
            החפיסה שלי ({hero.deck.length} קלפים)
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-2.5 text-center font-bold text-xs md:text-sm transition-colors border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "stats"
                ? "border-amber-500 text-amber-400 bg-slate-800/40"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <LucideIcon name="Activity" size={15} />
            סטטיסטיקה מורחבת
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-slate-900/60 text-slate-200 custom-scrollbar">
          {activeTab === "gear" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
              {/* Equipped Slots (Left column on RTL = Right visual side) */}
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-sm font-semibold text-amber-500/80 mb-2 uppercase tracking-wide">חפצים מצוידים</h3>

                {/* WEAPON */}
                <div className="bg-slate-950/70 p-4 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <LucideIcon name={hero.equippedItems[ItemSlot.WEAPON]?.icon || "Sword"} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-100 text-sm">
                        {hero.equippedItems[ItemSlot.WEAPON]?.hebrewName || "פנוי"}
                      </h4>
                      <p className="text-xs text-slate-400">נשק התקפי</p>
                    </div>
                  </div>
                  {hero.equippedItems[ItemSlot.WEAPON] ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUnequipItem(ItemSlot.WEAPON)}
                        className="px-2 py-1 bg-slate-800 hover:bg-red-950/50 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded text-xs transition-colors"
                      >
                        הסר ונמדד בגביש
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">רק נשקים</span>
                  )}
                </div>

                {/* ARMOR */}
                <div className="bg-slate-950/70 p-4 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <LucideIcon name={hero.equippedItems[ItemSlot.ARMOR]?.icon || "Shield"} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-100 text-sm">
                        {hero.equippedItems[ItemSlot.ARMOR]?.hebrewName || "פנוי"}
                      </h4>
                      <p className="text-xs text-slate-400">שריון קסדה/חליפה</p>
                    </div>
                  </div>
                  {hero.equippedItems[ItemSlot.ARMOR] ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUnequipItem(ItemSlot.ARMOR)}
                        className="px-2 py-1 bg-slate-800 hover:bg-red-950/50 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded text-xs transition-colors"
                      >
                        הסר שריון
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">רק שריונות</span>
                  )}
                </div>

                {/* ACCESSORY */}
                <div className="bg-slate-950/70 p-4 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <LucideIcon name={hero.equippedItems[ItemSlot.ACCESSORY]?.icon || "Gem"} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-purple-100 text-sm">
                        {hero.equippedItems[ItemSlot.ACCESSORY]?.hebrewName || "פנוי"}
                      </h4>
                      <p className="text-xs text-slate-400">תכשיט / קמיע</p>
                    </div>
                  </div>
                  {hero.equippedItems[ItemSlot.ACCESSORY] ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUnequipItem(ItemSlot.ACCESSORY)}
                        className="px-2 py-1 bg-slate-800 hover:bg-red-950/50 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded text-xs transition-colors"
                      >
                        הסר אביזר
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">רק אביזרים</span>
                  )}
                </div>

                {/* Total Stats Breakdown */}
                <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 pb-1.5 border-b border-slate-800">סיכום בונוסים מהציוד הנוכחי</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded px-3">
                      <span className="text-red-400 font-bold">+{hpBonus} HP</span>
                      <span className="text-slate-400 text-xs">חיים מקסימליים:</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded px-3">
                      <span className="text-orange-400 font-bold">+{dmgBonus} Dmg</span>
                      <span className="text-slate-400 text-xs">תוספת מתקפה:</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded px-3">
                      <span className="text-blue-400 font-bold">+{blkBonus} Block</span>
                      <span className="text-slate-400 text-xs">בונוס הגנה:</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded px-3">
                      <span className="text-purple-400 font-bold">+{manaBonus} Mana</span>
                      <span className="text-slate-400 text-xs">אנרגיה לתור:</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Backpack Inventory (Right column on RTL = Left visual side) */}
              <div className="md:col-span-7 flex flex-col space-y-3">
                <h3 className="text-sm font-semibold text-slate-400">חפצים בתיק הגב ({hero.inventory.length}/10)</h3>
                
                {hero.inventory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center border border-slate-800 border-dashed rounded-xl bg-slate-950/20 p-8 text-center text-slate-500">
                    <LucideIcon name="Backpack" size={36} className="mb-2 text-slate-750" />
                    <p className="text-sm">תיק הגב ריק כרגע.</p>
                    <p className="text-xs mt-1 text-slate-600">ניצחון בקרבות ופתיחת תיבות יעניקו לך חפצים חדשים.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[45vh] md:max-h-full pr-1">
                    {hero.inventory.map((item, index) => {
                      const upgradeInc = getUpgradeIncrement(item);
                      const isUpgradeable = item.level < item.maxLevel;
                      const hasEnoughGoldForUpgrade = hero.gold >= item.upgradeCost;

                      return (
                        <div
                          key={item.id + "_" + index}
                          className={`p-3 rounded-xl border flex flex-col justify-between ${getRarityBg(
                            item.rarity
                          )}`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <span className="text-[10px] uppercase font-bold border rounded px-1.5 py-0.5 line-clamp-1 bg-slate-950/40">
                                {getRarityLabel(item.rarity)} • דרגה {item.level}
                              </span>
                              <span className="text-amber-500 font-mono text-xs flex items-center gap-1">
                                {item.goldValue} <LucideIcon name="Coins" size={12} />
                              </span>
                            </div>
                            
                            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 mt-1">
                              <LucideIcon name={item.icon} size={15} className="text-amber-400" />
                              {item.hebrewName}
                            </h4>

                            {/* Stat details */}
                            <div className="mt-1.5 space-y-0.5">
                              {item.damageBonus > 0 && (
                                <div className="text-xs text-slate-300">
                                  בונוס התקפה: <span className="text-orange-400 font-semibold font-mono">+{item.damageBonus}</span>
                                </div>
                              )}
                              {item.blockBonus > 0 && (
                                <div className="text-xs text-slate-300">
                                  בונוס הגנה: <span className="text-blue-400 font-semibold font-mono">+{item.blockBonus}</span>
                                </div>
                              )}
                              {item.hpBonus > 0 && (
                                <div className="text-xs text-slate-300">
                                  תוספת חיים (HP): <span className="text-red-400 font-semibold font-mono">+{item.hpBonus}</span>
                                </div>
                              )}
                              {item.manaBonus > 0 && (
                                <div className="text-xs text-slate-300">
                                  מנה להתחלת תור: <span className="text-purple-400 font-semibold font-mono">+{item.manaBonus}</span>
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-400 mt-2 bg-slate-950/30 p-1.5 rounded">
                              {item.hebrewDescription}
                            </p>
                          </div>

                          <div className="mt-3 flex gap-2 border-t border-slate-800/40 pt-2 text-xs">
                            <button
                              onClick={() => onEquipItem(item)}
                              className="flex-1 py-1 px-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded transition-colors text-center"
                            >
                              צייד חפץ
                            </button>

                            {isUpgradeable ? (
                              <button
                                onClick={() => onUpgradeItem(item)}
                                disabled={!hasEnoughGoldForUpgrade}
                                className={`flex-1 py-1 px-1.5 border font-semibold rounded transition-colors flex items-center justify-center gap-1 ${
                                  hasEnoughGoldForUpgrade
                                    ? "bg-slate-800 hover:bg-slate-700 border-slate-600 text-amber-300"
                                    : "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed"
                                }`}
                                title={`עלות שדרוג: ${item.upgradeCost} זהב`}
                              >
                                <span>שדרג ({item.upgradeCost})</span>
                                <LucideIcon name="TrendingUp" size={12} />
                              </button>
                            ) : (
                              <span className="flex-1 py-1 text-center bg-slate-950 text-slate-500 rounded font-semibold">
                                שדרוג מקסימלי
                              </span>
                            )}

                            <button
                              onClick={() => onSellItem(item)}
                              className="px-1.5 py-1 bg-red-950/40 text-red-400 border border-red-900/30 hover:bg-red-900 hover:text-white rounded transition-colors"
                            >
                              מכור
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "deck" && (() => {
            const filteredDeckItems = hero.deck
              .map((card, idx) => ({ card, idx }))
              .filter(({ card }) => {
                const searchLower = deckSearch.toLowerCase().trim();
                const matchesSearch = !searchLower ||
                  card.hebrewName.toLowerCase().includes(searchLower) ||
                  card.hebrewDescription.toLowerCase().includes(searchLower);
                const matchesType = deckFilter === "all" || card.type === deckFilter;
                return matchesSearch && matchesType;
              });

            return (
              <div className="space-y-4">
                {/* Search & Filter Header controls */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex items-center gap-1.5 w-full md:w-auto">
                    <span className="text-xs text-slate-400 font-semibold shrink-0">סנן לפי:</span>
                    <div className="flex gap-1">
                      {(["all", "ATTACK", "SKILL", "POWER"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setDeckFilter(type)}
                          className={`px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                            deckFilter === type
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        >
                          {type === "all" ? "הכול" : type === "ATTACK" ? "מתקפה" : type === "SKILL" ? "מיומנות" : "כוח"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-64 max-w-full bg-slate-900 border border-slate-800 px-2 rounded-lg">
                    <LucideIcon name="Search" size={13} className="text-slate-500" />
                    <input
                      type="text"
                      className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1.5 w-full text-right"
                      placeholder="חפש קלף לפי שם או תיאור..."
                      value={deckSearch}
                      onChange={(e) => setDeckSearch(e.target.value)}
                    />
                    {deckSearch && (
                      <button onClick={() => setDeckSearch("")} className="text-slate-500 hover:text-white text-[10px] font-bold">
                        נקה
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl flex items-center justify-between text-xs md:text-sm">
                  <span>חפיסה הנוכחית של הגיבור – שולפים קלפים בכל תור. באפשרותך למחוק קלפים חלשים מאור המדורות!</span>
                  <span className="font-bold text-amber-400">
                    {filteredDeckItems.length !== hero.deck.length ? `נמצאו ${filteredDeckItems.length} מתוך ${hero.deck.length}` : `${hero.deck.length} קלפים סה״כ`}
                  </span>
                </div>

                {filteredDeckItems.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs md:text-sm">
                    לא נמצאו קלפים תואמים למסננים שנבחרו. נסה לשנות את מילות החיפוש.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredDeckItems.map(({ card, idx }) => {
                      const cardDmg = card.damage !== undefined ? card.damage + dmgBonus : undefined;
                      const cardBlk = card.block !== undefined ? card.block + blkBonus : undefined;
                      const isConfirming = confirmDeleteIdx === idx;

                      return (
                        <div
                          key={card.id + "_" + idx}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-slate-600 transition-colors relative min-h-[175px]"
                        >
                          {isConfirming ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-3 py-6 text-center">
                              <span className="text-[11px] text-red-400 font-black leading-tight">למחוק קלף זה לצמיתות מהחפיסה?</span>
                              <div className="flex gap-2 w-full justify-center">
                                <button
                                  onClick={() => {
                                    onRemoveCard(idx);
                                    setConfirmDeleteIdx(null);
                                  }}
                                  className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-black cursor-pointer transition select-none"
                                >
                                  כן, מחק 🗑️
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteIdx(null)}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded text-[10px] font-black cursor-pointer transition select-none"
                                >
                                  בטל
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                {/* Mana cost badge */}
                                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                                  {card.cost}
                                </div>

                                {/* Remove trash trigger */}
                                <button
                                  onClick={() => setConfirmDeleteIdx(idx)}
                                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/90 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/40 flex items-center justify-center transition cursor-pointer select-none"
                                  title="מחק קלף זה מהחפיסה"
                                >
                                  <LucideIcon name="Trash2" size={10} />
                                </button>

                                <div className="pt-5 flex flex-col items-center text-center">
                                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-amber-200 mb-2">
                                    <LucideIcon name={card.icon} size={18} />
                                  </div>
                                  <h4 className="font-bold text-xs text-white truncate max-w-full">{card.hebrewName}</h4>
                                  <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                                    {card.type === "ATTACK" ? "מתקפה" : card.type === "SKILL" ? "מיומנות" : "כוח"}
                                  </span>
                                </div>

                                <p className="text-[10px] text-slate-405 text-center mt-2 leading-relaxed">
                                  {card.hebrewDescription}
                                </p>
                              </div>

                              {/* Display modifiers */}
                              <div className="mt-2.5 border-t border-slate-850 pt-1.5 flex justify-center gap-2 text-[10px] font-mono leading-none">
                                {cardDmg !== undefined && (
                                  <span className="text-orange-400 font-bold flex items-center gap-0.5" title="כולל בונוס נשק">
                                    {cardDmg}⚔️
                                  </span>
                                )}
                                {cardBlk !== undefined && (
                                  <span className="text-blue-400 font-bold flex items-center gap-0.5" title="כולל בונוס שריון">
                                    {cardBlk}🛡️
                                  </span>
                                )}
                                {card.poison !== undefined && (
                                  <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                    {card.poison}🧪
                                  </span>
                                )}
                                {card.heal !== undefined && (
                                  <span className="text-red-400 font-bold flex items-center gap-0.5">
                                    {card.heal}❤️
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === "stats" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-slate-950/60 p-6 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-amber-400 border-b border-slate-850 pb-2">מדדי התקדמות</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 block">חיים (HP) הנוכחיים ומקסימליים</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold font-mono">
                        {hero.currentHp} / {totalMaxHp}
                      </span>
                      {hpBonus > 0 && <span className="text-xs text-red-400">(+{hpBonus} מהציוד)</span>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 block">רמת הגיבור</span>
                    <span className="text-xl font-bold text-amber-500">רמה {hero.level}</span>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>ניסיון (XP) לקראת רמה הבאה ({hero.xp} / {(hero.level * 100)})</span>
                      <span>{Math.min(100, Math.floor((hero.xp / (hero.level * 100)) * 100))}%</span>
                    </div>
                    <div className="w-full bg-slate-850 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (hero.xp / (hero.level * 100)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-6 border border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-lg font-bold text-blue-400 border-b border-slate-850 pb-2">רקורד מסע</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-900/50 rounded-xl">
                    <span className="text-xs text-slate-400 block">שלב נוכחי במסע</span>
                    <span className="text-lg font-bold">שלב {hero.stage} מתוך 10</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-xl">
                    <span className="text-xs text-slate-400 block">כסף בקופה</span>
                    <span className="text-lg font-bold text-amber-500 font-mono">{hero.gold} זהב</span>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-xl col-span-2">
                    <span className="text-xs text-slate-400 block">טיפ שימושי מהמסע</span>
                    <p className="text-xs text-slate-400 mt-1">
                      שפר את הנשק אצל הרוכל או ישירות מתיק הגב כדי להגדיל את כוח ההתקפה שכל קלף מסב לאויב באופן משמעותי.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 text-left">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors text-sm"
          >
            חזור למשחק
          </button>
        </div>
      </motion.div>
    </div>
  );
}
