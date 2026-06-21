import React, { useState } from "react";
import { Hero, Card } from "../types";
import { LucideIcon } from "./LucideIcon";
import { motion, AnimatePresence } from "motion/react";
import { getMaxHpBonus } from "../utils/gameHelpers";

interface CampfireScreenProps {
  hero: Hero;
  onRest: (healAmount: number) => void;
  onRemoveCard: (cardId: string) => void;
  onSkip: () => void;
}

export function CampfireScreen({ hero, onRest, onRemoveCard, onSkip }: CampfireScreenProps) {
  const [mode, setMode] = useState<"choice" | "remove_card">("choice");
  const [confirmDeleteCard, setConfirmDeleteCard] = useState<Card | null>(null);

  const hpBonus = getMaxHpBonus(hero);
  const totalMaxHp = hero.maxHp + hpBonus;
  const healAmount = Math.ceil(totalMaxHp * 0.35);

  const handleRest = () => {
    onRest(healAmount);
  };


  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 relative overflow-hidden"
      dir="rtl"
    >
      {/* Background fireplace glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="max-w-2xl w-full text-center z-10 space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <span className="text-orange-500 font-bold text-xs uppercase tracking-wider bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1">
            נקודת מנוחה ומפלט • Campfire
          </span>
          <h1 className="text-3xl md:text-4xl font-black font-sans text-amber-100 flex items-center justify-center gap-2.5">
            <LucideIcon name="Flame" className="text-orange-500 animate-bounce" size={32} />
            מדורה ביער החבוי
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
            אור המדורה רוטט על קצוות השאול. עצור לרגע והכן את עצמך לקרבות הבאים, החלט במה להתמקד באור המדורה החמים.
          </p>
        </motion.div>

        {/* Current status bar overlay */}
        <div className="grid grid-cols-2 gap-4 bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs max-w-sm mx-auto">
          <div className="text-right">
            <span className="text-slate-500 block">חיים נוכחיים:</span>
            <span className="font-bold text-red-400 font-mono">
              {hero.currentHp} / {totalMaxHp} HP
            </span>
          </div>
          <div className="text-right border-r border-slate-800 pr-4">
            <span className="text-slate-500 block">גודל חפיסה:</span>
            <span className="font-bold text-amber-500">
              {hero.deck.length} קלפים
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === "choice" ? (
            <motion.div
              key="choice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Option 1: REST */}
              <div
                onClick={handleRest}
                className="bg-slate-900 border border-slate-800/80 hover:border-red-500/50 p-6 rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer hover:shadow-2xl hover:shadow-red-950/10 group transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                    <LucideIcon name="Heart" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white">נוח והתרפא</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    שקע בשינה בריאה ומרגיעה. מרפא <span className="text-red-400 font-bold">+{healAmount} HP</span> מחיים המקסימליים שלך מיידית.
                  </p>
                </div>
                <button className="w-full mt-6 py-2 bg-red-500/20 text-red-300 group-hover:bg-red-500 group-hover:text-slate-950 font-bold rounded-xl transition-all duration-300 text-xs text-center">
                  הירגע ליד האש
                </button>
              </div>

              {/* Option 2: REFINE DECK */}
              <div
                onClick={() => setMode("remove_card")}
                className="bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 p-6 rounded-2xl flex flex-col justify-between items-center text-center cursor-pointer hover:shadow-2xl hover:shadow-amber-950/10 group transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <LucideIcon name="Layers" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white">זקק וצמצם את החפיסה</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    מחק קלף חלש או לא רצוי מחפיסת הקלפים. גורם לחפיסה שלך להיות <span className="text-amber-400 font-bold">יעילה וצפופה יותר</span> לשליפה בקרב.
                  </p>
                </div>
                <button className="w-full mt-6 py-2 bg-amber-500/20 text-amber-300 group-hover:bg-amber-500 group-hover:text-slate-950 font-bold rounded-xl transition-all duration-300 text-xs text-center">
                  סנן קלפים
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="remove_card"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-4 text-right"
            >
              <div className="flex justify-between items-center flex-row-reverse border-b border-slate-800 pb-3 mb-2">
                <button
                  onClick={() => setMode("choice")}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded"
                >
                  <LucideIcon name="ArrowRight" size={12} /> חזור
                </button>
                <h3 className="font-bold text-base text-white">בחר קלף אחד למחיקה לצמיתות</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[30vh] overflow-y-auto pr-1">
                {hero.deck.map((card, idx) => (
                  <div
                    key={card.id + "_" + idx}
                    onClick={() => {
                      setConfirmDeleteCard(card);
                    }}
                    className="bg-slate-950 border border-slate-800 hover:border-red-500 hover:bg-slate-950/80 p-2.5 rounded-xl cursor-pointer text-center relative group min-h-[120px] flex flex-col justify-between"
                  >
                    <div className="absolute top-1 left-2 bg-blue-500/30 text-blue-300 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                      {card.cost}
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="font-bold text-xs text-white group-hover:text-red-400">{card.hebrewName}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
                        {card.hebrewDescription}
                      </p>
                    </div>

                    <div className="text-[9px] text-red-500 font-semibold uppercase group-hover:block hidden mt-2">
                      לחץ למחיקה! 🗑️
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Modal for Card Deletion */}
        <AnimatePresence>
          {confirmDeleteCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-sm text-center space-y-4 shadow-2xl shadow-black"
              >
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto">
                  <LucideIcon name="Trash2" size={24} />
                </div>
                <h3 className="text-lg font-black text-white">מחיקת קלף לצמיתות</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  האם אתה בטוח שברצונך למחוק לצמיתות את הקלף{" "}
                  <span className="font-bold text-white text-sm">"{confirmDeleteCard.hebrewName}"</span> מחפיסת הקלפים של הגיבור שלך?
                  פעולה זו היא סופית לחלוטין ולא ניתנת לביטול.
                </p>

                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => {
                      onRemoveCard(confirmDeleteCard.id);
                      setConfirmDeleteCard(null);
                    }}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    כן, מחק קלף
                  </button>
                  <button
                    onClick={() => setConfirmDeleteCard(null)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    ביטול
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        <div className="pt-4 z-10">
          <button
            onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-1.5 px-4 bg-slate-950 rounded-lg border border-slate-900 hover:border-slate-800"
          >
            דלג על נקודת מנוחה זו
          </button>
        </div>
      </div>
    </div>
  );
}
