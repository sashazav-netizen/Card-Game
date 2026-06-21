import React, { useState, useEffect } from "react";
import { Hero, Card, Item, ItemSlot, ItemRarity } from "../types";
import { LucideIcon } from "./LucideIcon";
import { CardPortrait } from "./CardPortrait";
import { motion } from "motion/react";
import { getRarityBg, getRarityLabel, getMaxHpBonus } from "../utils/gameHelpers";
import { LOOT_CARDS, ALL_ITEMS } from "../data/gameData";

interface ShopScreenProps {
  hero: Hero;
  onBuyCard: (card: Card, cost: number) => void;
  onBuyItem: (item: Item, cost: number) => void;
  onHealPotion: (restoreAmount: number, cost: number) => void;
  onLeave: () => void;
}

interface ShopOffer<T> {
  id: string;
  data: T;
  cost: number;
  sold: boolean;
}

export function ShopScreen({ hero, onBuyCard, onBuyItem, onHealPotion, onLeave }: ShopScreenProps) {
  const [cardOffers, setCardOffers] = useState<ShopOffer<Card>[]>([]);
  const [itemOffers, setItemOffers] = useState<ShopOffer<Item>[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  
  const potionCost = 40;
  const hpBonus = getMaxHpBonus(hero);
  const totalMaxHp = hero.maxHp + hpBonus;
  const restoreAmount = Math.ceil(totalMaxHp * 0.45);

  // Initialize shop offers once when mounting the component
  useEffect(() => {
    // Generate 3 random cards for sale (matched to hero class or neutral)
    const validCards = LOOT_CARDS.filter((c) => {
      if (c.minLevel && hero.level < c.minLevel) return false;
      if (hero.classType === "warrior") return c.id.startsWith("card_w") || c.id.startsWith("card_n");
      if (hero.classType === "mage") return c.id.startsWith("card_m") || c.id.startsWith("card_n");
      if (hero.classType === "rogue") return c.id.startsWith("card_r") || c.id.startsWith("card_n");
      if (hero.classType === "cleric") return c.id.startsWith("card_c") || c.id.startsWith("card_n");
      if (hero.classType === "ranger") return c.id.startsWith("card_ra") || c.id.startsWith("card_n");
      return c.id.startsWith("card_n");
    });
    const shuffledCards = [...validCards].sort(() => 0.5 - Math.random());
    const cardsOnSale: ShopOffer<Card>[] = shuffledCards.slice(0, 3).map((card, i) => ({
      id: "sale_c_" + card.id + "_" + i + "_" + Date.now(),
      data: card,
      cost: card.cost === 0 ? 30 : card.cost === 1 ? 45 : card.cost === 2 ? 60 : 75,
      sold: false,
    }));

    // Generate 3 items compatible for sale
    const validItems = ALL_ITEMS.filter((item) => {
      if (item.id.includes("wand") && hero.classType !== "mage") return false;
      if (item.id.includes("sword") && (hero.classType === "mage" || hero.classType === "cleric")) return false;
      if (item.id.includes("mace") && hero.classType !== "cleric") return false;
      if (item.id.includes("bow") && hero.classType !== "ranger") return false;
      return true;
    });
    const shuffledItems = [...validItems].sort(() => 0.5 - Math.random());
    const itemsOnSale: ShopOffer<Item>[] = shuffledItems.slice(0, 3).map((item, i) => {
      let calcCost = item.goldValue;
      if (item.rarity === ItemRarity.RARE) calcCost = Math.ceil(calcCost * 1.1);
      if (item.rarity === ItemRarity.LEGENDARY) calcCost = Math.ceil(calcCost * 1.25);
      
      return {
        id: "sale_i_" + item.id + "_" + i + "_" + Date.now(),
        data: item,
        cost: calcCost,
        sold: false,
      };
    });

    setCardOffers(cardsOnSale);
    setItemOffers(itemsOnSale);
  }, [hero.classType]);

  const handleBuyCard = (offer: ShopOffer<Card>) => {
    if (hero.gold < offer.cost) return;
    onBuyCard(offer.data, offer.cost);
    setCardOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, sold: true } : o)));
  };

  const handleBuyItem = (offer: ShopOffer<Item>) => {
    if (hero.gold < offer.cost) return;
    if (hero.inventory.length >= 10) {
      setWarningMessage("תיק הגב שלך מלא! פנה מקום לפני רכישת חפצים חדשים.");
      return;
    }
    onBuyItem(offer.data, offer.cost);
    setItemOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, sold: true } : o)));
  };

  const handleBuyPotion = () => {
    if (hero.gold < potionCost) return;
    if (hero.currentHp >= totalMaxHp) {
      setWarningMessage("מד החיים שלך כבר מלא לחלוטין!");
      return;
    }
    onHealPotion(restoreAmount, potionCost);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top bar same as map */}
      <div className="bg-slate-900 border-b border-slate-800 pr-4 pl-16 md:px-6 py-4 flex flex-wrap gap-4 items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center border border-slate-700 text-amber-500">
            <LucideIcon name="ShoppingCart" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">הרוכל הנודד של הממלכה</h2>
            <p className="text-xs text-slate-400">"הזהב שלך קונה כאן איכות, הרפתקן!"</p>
          </div>
        </div>

        {/* Hero status overview */}
        <div className="flex items-center gap-4">
          <div className="text-xs text-right hidden sm:block">
            <span className="text-slate-400">חיים: </span>
            <span className="font-bold text-red-400 font-mono">
              {hero.currentHp} / {totalMaxHp} HP
            </span>
          </div>

          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 px-4 py-1.5 rounded-full border border-amber-500/30 text-sm font-semibold">
            <LucideIcon name="Coins" size={16} />
            <span>{hero.gold} זהב</span>
          </div>

          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-850 hover:bg-slate-800 text-white font-bold rounded-xl border border-slate-700 transition"
          >
            <span>חזור למפה</span>
            <LucideIcon name="ArrowLeft" size={15} />
          </button>
        </div>
      </div>

      {/* Main shop grid */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8 overflow-y-auto">
        {/* Row 1: Equipment items on sale */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-amber-500/80 uppercase tracking-wider flex items-center gap-1.5 justify-end flex-row-reverse border-b border-slate-900 pb-2">
            <LucideIcon name="ShieldCheck" size={15} /> חפצי ציוד קדושים (נשקים, מגינים ואביזרים)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {itemOffers.map((offer) => {
              const item = offer.data;
              const hasEnoughGold = hero.gold >= offer.cost;

              return (
                <div
                  key={offer.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 relative ${
                    offer.sold
                      ? "bg-slate-950/20 border-slate-900 opacity-40 cursor-not-allowed"
                      : `${getRarityBg(item.rarity)} hover:border-slate-600`
                  }`}
                >
                  {offer.sold && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10 font-bold text-amber-400 uppercase tracking-widest text-sm">
                      נרכש • SOLD OUT
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800">
                        {getRarityLabel(item.rarity)} • {item.slot === ItemSlot.WEAPON ? "נשק" : item.slot === ItemSlot.ARMOR ? "שריון" : "אביזר"}
                      </span>
                      <span className="text-amber-400 font-mono text-xs font-bold flex items-center gap-1">
                        {offer.cost} <LucideIcon name="Coins" size={12} />
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white mt-3 flex items-center gap-1.5 justify-end">
                      {item.hebrewName}
                      <LucideIcon name={item.icon} size={15} className="text-amber-400" />
                    </h4>

                    {/* Stats details */}
                    <div className="mt-2 text-xs space-y-0.5">
                      {item.damageBonus > 0 && <p className="text-orange-400 font-semibold font-mono">⚔️ +{item.damageBonus} כוח התקפה</p>}
                      {item.blockBonus > 0 && <p className="text-blue-400 font-semibold font-mono">🛡️ +{item.blockBonus} כוח הגנה</p>}
                      {item.hpBonus > 0 && <p className="text-red-400 font-semibold font-mono">❤️ +{item.hpBonus} חיים מקסימליים</p>}
                      {item.manaBonus > 0 && <p className="text-purple-400 font-semibold font-mono">⚡ +{item.manaBonus} מנה לתור</p>}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-2 bg-slate-950/40 p-2 rounded leading-snug">
                      {item.hebrewDescription}
                    </p>
                  </div>

                  <button
                    disabled={offer.sold || !hasEnoughGold}
                    onClick={() => handleBuyItem(offer)}
                    className={`mt-4 py-2 text-center font-bold text-xs rounded-lg transition-all ${
                      offer.sold
                        ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                        : !hasEnoughGold
                        ? "bg-slate-950/50 border border-slate-900 text-slate-600 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black cursor-pointer shadow-sm shadow-amber-500/10"
                    }`}
                  >
                    {!hasEnoughGold ? `חסר זהב (${offer.cost})` : `רכוש חפץ (${offer.cost} זהב)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Cards and Potion */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
          {/* Cards for sale (Left) */}
          <div className="md:col-span-8 space-y-3">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 justify-end flex-row-reverse border-b border-slate-900 pb-2">
              <LucideIcon name="Layers" size={15} /> קלפי לחש מיוחדים (להוספה ישירה לחפיסה)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cardOffers.map((offer) => {
                const card = offer.data;
                const hasEnoughGold = hero.gold >= offer.cost;

                return (
                  <div
                    key={offer.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-300 relative ${
                      offer.sold
                        ? "bg-slate-950/20 border-slate-900 opacity-40 cursor-not-allowed"
                        : "border-slate-850 bg-slate-950 hover:border-slate-700"
                    }`}
                  >
                    {offer.sold && (
                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-10 font-bold text-blue-400 uppercase tracking-widest text-xs">
                        נרכש • SOLD
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px]">
                          {card.cost}
                        </span>
                        <span className="text-amber-400 font-mono text-[11px] font-bold flex items-center gap-0.5">
                          {offer.cost} <LucideIcon name="Coins" size={10} />
                        </span>
                      </div>

                      <div className="pt-2 flex flex-col items-center text-center">
                        <CardPortrait cardId={card.id} />
                        <h4 className="font-bold text-xs text-white mt-1">{card.hebrewName}</h4>
                        <span className="text-[9px] text-slate-500 uppercase font-mono mt-0.5">
                          {card.type === "ATTACK" ? "מתקפה" : card.type === "SKILL" ? "מיומנות" : "כוח אולטימטיבי"}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed text-center">
                        {card.hebrewDescription}
                      </p>
                    </div>

                    <button
                      disabled={offer.sold || !hasEnoughGold}
                      onClick={() => handleBuyCard(offer)}
                      className={`mt-4 py-1.5 text-center font-bold text-[10px] rounded transition-colors ${
                        offer.sold
                          ? "bg-slate-900 text-slate-600 cursor-not-allowed"
                          : !hasEnoughGold
                          ? "bg-slate-950/50 border border-slate-900 text-slate-600 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                      }`}
                    >
                      {!hasEnoughGold ? `חסר זהב` : `קנה קלף (${offer.cost})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Consumable Potion (Right) */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5 justify-end flex-row-reverse border-b border-slate-900 pb-2">
              <LucideIcon name="GlassWater" size={15} /> שיקויים בריאותיים
            </h3>

            <div className="bg-slate-905 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-[180px] hover:border-slate-750 transition-colors">
              <div>
                <div className="flex justify-between items-center flex-row-reverse pb-2">
                  <span className="text-amber-500 font-mono text-sm font-bold flex items-center gap-1">
                    {potionCost} <LucideIcon name="Coins" size={13} />
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                      <LucideIcon name="FlaskConical" size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">שיקוי חיים אדום</h4>
                      <p className="text-[10px] text-slate-400">שיקוי חליטה מרוכז</p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pr-1.5 mt-2 bg-slate-950/30 p-2 rounded">
                  מרפא <span className="text-red-400 font-bold">+{restoreAmount} HP</span> מחיים המקסימליים שלך מיידית (45% ריפוי כבד).
                </p>
              </div>

              <button
                onClick={handleBuyPotion}
                disabled={hero.gold < potionCost || hero.currentHp >= totalMaxHp}
                className={`py-2 text-center font-bold text-xs rounded-xl transition-all ${
                  hero.gold < potionCost
                    ? "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed"
                    : hero.currentHp >= totalMaxHp
                    ? "bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white cursor-pointer font-bold"
                }`}
              >
                {hero.currentHp >= totalMaxHp
                  ? "מד חיים מלא!"
                  : hero.gold < potionCost
                  ? "חסר זהב"
                  : `שתה שיקוי (${potionCost} זהב)`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Warning Modal/Notification */}
      {warningMessage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <LucideIcon name="AlertTriangle" size={24} />
            </div>
            <h3 className="text-lg font-black text-white">אזהרת סוחר</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {warningMessage}
            </p>
            <button
              onClick={() => setWarningMessage(null)}
              className="w-full py-2 bg-slate-850 hover:bg-amber-500 hover:text-slate-950 text-white hover:border-amber-500 font-bold rounded-xl transition-all duration-300 border border-slate-700 text-xs cursor-pointer"
            >
              הבנתי, תודה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
