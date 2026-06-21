import React, { useState } from "react";
import { Hero, Card, Item } from "../types";
import { LucideIcon } from "./LucideIcon";
import { CardPortrait } from "./CardPortrait";
import { motion, AnimatePresence } from "motion/react";
import { getRarityBg, getRarityLabel } from "../utils/gameHelpers";
import { LOOT_CARDS, ALL_ITEMS } from "../data/gameData";

interface ChestScreenProps {
  hero: Hero;
  onClaimLoot: (gold: number, cards: Card[], items: Item[]) => void;
}

export function ChestScreen({ hero, onClaimLoot }: ChestScreenProps) {
  const [opened, setOpened] = useState(false);
  const [claimableGold, setClaimableGold] = useState(0);
  const [draftCards, setDraftCards] = useState<Card[]>([]);
  const [draftItems, setDraftItems] = useState<Item[]>([]);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

  const handleOpenChest = () => {
    // Generate Gold
    const goldMultiplier = hero.stage * 10;
    const goldGained = Math.floor(Math.random() * 25) + 25 + goldMultiplier;

    // Generate 3 Draft Cards matching hero class or neutral
    // Standard cards + neutral
    const matchedCards = LOOT_CARDS.filter((c) => {
      if (c.minLevel && hero.level < c.minLevel) return false;
      if (hero.classType === "warrior") return c.id.startsWith("card_w") || c.id.startsWith("card_n");
      if (hero.classType === "mage") return c.id.startsWith("card_m") || c.id.startsWith("card_n");
      if (hero.classType === "rogue") return c.id.startsWith("card_r") || c.id.startsWith("card_n");
      if (hero.classType === "cleric") return c.id.startsWith("card_c") || c.id.startsWith("card_n");
      if (hero.classType === "ranger") return c.id.startsWith("card_ra") || c.id.startsWith("card_n");
      return c.id.startsWith("card_n");
    });
    
    // Pick 3 random
    const shuffled = [...matchedCards].sort(() => 0.5 - Math.random());
    const cardsDrafted = shuffled.slice(0, 3);

    // Generate 1 item
    // Chance based on rarity. Later stages get rarer items.
    const itemsGroup = [...ALL_ITEMS];
    // Filter items representing class weapon compatibility
    const filteredItems = itemsGroup.filter((item) => {
      if (item.id.includes("wand") && hero.classType !== "mage") return false;
      if (item.id.includes("sword") && (hero.classType === "mage" || hero.classType === "cleric")) return false;
      if (item.id.includes("mace") && hero.classType !== "cleric") return false;
      if (item.id.includes("bow") && hero.classType !== "ranger") return false;
      return true;
    });

    const randomItemIndex = Math.floor(Math.random() * filteredItems.length);
    const itemDrafted = { ...filteredItems[randomItemIndex], id: filteredItems[randomItemIndex].id + "_" + Date.now() };

    setClaimableGold(goldGained);
    setDraftCards(cardsDrafted);
    setDraftItems([itemDrafted]); // 1 item looted
    setOpened(true);
  };

  const handleClaim = () => {
    const chosenCards: Card[] = [];
    if (selectedCardIdx !== null && draftCards[selectedCardIdx]) {
      chosenCards.push(draftCards[selectedCardIdx]);
    }
    onClaimLoot(claimableGold, chosenCards, draftItems);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-right" dir="rtl">
      {/* Light bursts */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-850 bg-slate-950 flex items-center justify-between flex-row-reverse select-none">
          <div className="flex items-center gap-2 flex-row-reverse">
            <LucideIcon name="Gift" className="text-amber-500 animate-bounce" size={18} />
            <h3 className="text-sm font-black text-amber-100 font-sans">תיבת האוצר של הממלכה</h3>
          </div>
          <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
            שלב {hero.stage} • שלל מיוחד הממתין לגיבור
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 custom-scrollbar">
          <div className="text-center">
            <p className="text-slate-400 text-xs leading-relaxed">
              נקלעת למטמון עתיק המכיל מטבעות זהב יציבים, ציוד לחימה ולחשים קדומים שיחזקו אותך במסע.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="closed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center py-6"
              >
                <div className="w-24 h-24 rounded-full bg-amber-500/5 flex items-center justify-center border border-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.05)] animate-pulse hover:border-amber-500/30 transition-all duration-300">
                  <LucideIcon name="Gift" size={48} className="text-amber-500 hover:scale-105 transition-transform cursor-pointer animate-bounce" onClick={handleOpenChest} />
                </div>
                
                <button
                  onClick={handleOpenChest}
                  className="mt-6 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl transition-all duration-300 shadow-md shadow-amber-500/15 cursor-pointer"
                >
                  פתח את תיבת השלל! 📦
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="opened"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Gold reward display */}
                <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">על פתיחת התיבה קיבלת:</span>
                  <span className="text-base font-bold font-mono text-amber-400 flex items-center gap-1.5 flex-row-reverse">
                    <LucideIcon name="Coins" size={16} />
                    {claimableGold} זהב
                  </span>
                </div>

                {/* Revealed Passive Items / Wearable */}
                {draftItems.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block text-center">חפץ קדוש שנדלה מהתיבה:</span>
                    <div className="flex justify-center">
                      {draftItems.map((item, index) => (
                        <div
                          key={item.id + "_" + index}
                          className={`p-3 rounded-xl border max-w-xs w-full text-right shadow-sm ${getRarityBg(item.rarity)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
                              {getRarityLabel(item.rarity)} • {item.slot === "WEAPON" ? "נשק" : item.slot === "ARMOR" ? "שריון" : "אביזר"}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">רמה {item.level}</span>
                          </div>

                          <h4 className="font-bold text-xs text-white mt-1.5 flex items-center gap-1.5 justify-end">
                            {item.hebrewName}
                            <LucideIcon name={item.icon} size={13} className="text-amber-400" />
                          </h4>

                          <div className="mt-1.5 text-[10px] space-y-0.5 flex flex-wrap gap-x-3 gap-y-0.5 justify-end">
                            {item.damageBonus > 0 && <p className="text-orange-400 font-semibold font-mono">⚔️ +{item.damageBonus} התקפה</p>}
                            {item.blockBonus > 0 && <p className="text-blue-400 font-semibold font-mono">🛡️ +{item.blockBonus} הגנה</p>}
                            {item.hpBonus > 0 && <p className="text-red-400 font-semibold font-mono">❤️ +{item.hpBonus} חיים</p>}
                            {item.manaBonus > 0 && <p className="text-purple-400 font-semibold font-mono">⚡ +{item.manaBonus} מנה</p>}
                          </div>

                          <p className="text-[10px] text-slate-300 mt-1.5 bg-slate-950/40 p-2 rounded leading-snug">
                            {item.hebrewDescription}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Revealed Cards Drafting List */}
                <div className="space-y-2 pt-1 border-t border-slate-850">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">בחר קלף אחד להוסיף לחפיסה שלך:</span>
                    <p className="text-[9px] text-slate-500">לחץ לבחירת קלף המסע המתאים ביותר עבורך</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {draftCards.map((card, idx) => (
                      <div
                        key={card.id + "_" + idx}
                        onClick={() => setSelectedCardIdx(selectedCardIdx === idx ? null : idx)}
                        className={`relative p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-300 min-h-[140px] text-center ${
                          selectedCardIdx === idx
                            ? "border-amber-400 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                            : "border-slate-850 bg-slate-950 hover:border-slate-750"
                        }`}
                      >
                        {/* Cost Circle */}
                        <div className="absolute top-1.5 left-1.5 bg-blue-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] shadow-sm">
                          {card.cost}
                        </div>

                        <div className="pt-2 flex flex-col items-center">
                          <CardPortrait cardId={card.id} />
                          <h4 className="font-bold text-[11px] text-white pb-0.5 mt-1">{card.hebrewName}</h4>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">
                            {card.type === "ATTACK" ? "מתקפה" : card.type === "SKILL" ? "מיומנות" : "אולטימטיבי"}
                          </span>
                        </div>

                        <p className="text-[9px] text-slate-400 leading-normal mt-1.5 max-w-[130px] mx-auto">
                          {card.hebrewDescription}
                        </p>

                        <div className="mt-2.5 flex justify-center text-[9px]">
                          {selectedCardIdx === idx ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <LucideIcon name="CheckCircle" size={10} /> נבחר להוספה!
                            </span>
                          ) : (
                            <span className="text-slate-600 hover:text-slate-400 font-medium transition-colors">בחר קלף זה</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-850 bg-slate-950/70 flex justify-end gap-3.5">
          {opened && (
            <button
              onClick={handleClaim}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-all duration-300 shadow-md shadow-amber-500/10 cursor-pointer text-center"
            >
              {selectedCardIdx !== null ? "אסוף את קלפי הבחירה והשלל" : "המשך ללא קלף (קח זהב וחפצים בלבד)"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
