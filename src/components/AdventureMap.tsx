import React, { useState } from "react";
import { STAGE_NODES } from "../data/gameData";
import { Hero, NodeType } from "../types";
import { LucideIcon } from "./LucideIcon";
import { motion, AnimatePresence } from "motion/react";
import { getMaxHpBonus, getStageNodeFor } from "../utils/gameHelpers";

interface AdventureMapProps {
  hero: Hero;
  onEnterNode: (nodeIndex: number) => void;
  onOpenInventory: () => void;
  onResetGame: () => void;
  onReturnToSelection?: () => void;
}

export function AdventureMap({
  hero,
  onEnterNode,
  onOpenInventory,
  onResetGame,
  onReturnToSelection,
}: AdventureMapProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const hpBonus = getMaxHpBonus(hero);
  const totalMaxHp = hero.maxHp + hpBonus;

  // Render icon according to node type
  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.COMBAT:
        return "Swords";
      case NodeType.CHEST:
        return "Gift";
      case NodeType.SHOP:
        return "ShoppingCart";
      case NodeType.ELITE:
        return "FlameKindling";
      case NodeType.CAMPFIRE:
        return "Flame";
      case NodeType.BOSS:
        return "Crown";
      default:
        return "HelpCircle";
    }
  };

  // Render color according to node type
  const getNodeStyles = (type: NodeType, isCurrent: boolean, isCompleted: boolean) => {
    if (isCompleted) {
      return {
        bg: "bg-slate-900 text-slate-500 border-slate-800",
        shadow: "",
        accentText: "text-slate-500",
      };
    }
    if (isCurrent) {
      switch (type) {
        case NodeType.BOSS:
          return {
            bg: "bg-red-950/70 text-red-400 border-red-500 animate-pulse",
            shadow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
            accentText: "text-red-400 font-bold",
          };
        case NodeType.ELITE:
          return {
            bg: "bg-orange-950/70 text-orange-400 border-orange-500 animate-pulse",
            shadow: "shadow-[0_0_15px_rgba(249,115,22,0.4)]",
            accentText: "text-orange-400 font-bold",
          };
        case NodeType.CHEST:
          return {
            bg: "bg-amber-950/70 text-amber-400 border-amber-500 duration-1000",
            shadow: "shadow-[0_0_15px_rgba(245,158,11,0.4)]",
            accentText: "text-amber-400 font-bold",
          };
        case NodeType.SHOP:
          return {
            bg: "bg-blue-950/70 text-blue-400 border-blue-500",
            shadow: "shadow-[0_0_15px_rgba(59,130,246,0.3)]",
            accentText: "text-blue-400 font-bold",
          };
        case NodeType.CAMPFIRE:
          return {
            bg: "bg-emerald-950/70 text-emerald-400 border-emerald-500",
            shadow: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
            accentText: "text-emerald-400 font-bold",
          };
        default:
          return {
            bg: "bg-amber-500 text-slate-950 border-white",
            shadow: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
            accentText: "text-amber-500 font-bold",
          };
      }
    }
    // Locked
    return {
      bg: "bg-slate-950 text-slate-650 border-slate-900 opacity-60",
      shadow: "",
      accentText: "text-slate-600",
    };
  };

  const getNodeTypeName = (type: NodeType) => {
    switch (type) {
      case NodeType.COMBAT:
        return "קרב פילוסים";
      case NodeType.CHEST:
        return "תיבת אוצר";
      case NodeType.SHOP:
        return "סוחר וחיזוקים";
      case NodeType.ELITE:
        return "קרב עילית קשה";
      case NodeType.CAMPFIRE:
        return "מדורה ומנוחה";
      case NodeType.BOSS:
        return "קרב בוס סופי";
      default:
        return "אירוע";
    }
  };

  const currentActiveNode = getStageNodeFor(hero.stage);
  const cycleStart = Math.floor((hero.stage - 1) / 10) * 10 + 1;
  const currentStagesList = Array.from({ length: 10 }, (_, i) => getStageNodeFor(cycleStart + i));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* Top Status Bar */}
      <div className="bg-slate-900 border-b border-slate-800 pr-4 pl-16 md:px-6 py-4 flex flex-wrap gap-4 items-center justify-between z-10">
        <div className="flex items-center gap-4">
          {/* Avatar and name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-850 flex items-center justify-center border border-slate-700 text-amber-500">
              <LucideIcon name={hero.classType === "warrior" ? "Shield" : hero.classType === "mage" ? "Sparkles" : hero.classType === "cleric" ? "Heart" : hero.classType === "ranger" ? "Crosshair" : "Skull"} size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm md:text-base leading-tight">{hero.hebrewName}</h2>
              <span className="text-xs text-amber-500">רמה {hero.level} ({hero.xp} / {hero.level * 100} XP)</span>
            </div>
          </div>

          {/* HP Bar */}
          <div className="hidden sm:block">
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-red-400 font-bold">חיים: {hero.currentHp} / {totalMaxHp}</span>
            </div>
            <div className="w-40 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-950">
              <div
                className="bg-red-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(0, Math.min(100, (hero.currentHp / totalMaxHp) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons & Inventory Trigger */}
        <div className="flex items-center gap-3">
          {/* Gold display */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/30 text-sm font-semibold">
            <LucideIcon name="Coins" size={16} />
            <span>{hero.gold} זהב</span>
          </div>

          <button
            onClick={onOpenInventory}
            className="flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all duration-300 text-sm"
          >
            <LucideIcon name="Backpack" size={16} />
            <span>תיק גב וציוד</span>
          </button>

          <button
            onClick={() => setGuideOpen(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-400 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            title="מדריך למשחק ומקרא סמלי המפה"
          >
            <LucideIcon name="BookOpen" size={13} />
            <span>מדריך למשחק 📖</span>
          </button>

          <button
            onClick={onReturnToSelection}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 border border-slate-700 rounded-xl text-xs transition-behaviors transition-colors flex items-center gap-1.5 cursor-pointer select-none"
            title="חזור למסך בחירת הדמויות מבלי למחוק את הגיבור הנוכחי"
          >
            <LucideIcon name="Users" size={13} />
            <span>החלף דמות 👥</span>
          </button>

          <button
            onClick={onResetGame}
            className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/20 hover:text-red-400 border border-slate-700 rounded-xl text-xs transition-colors cursor-pointer select-none"
          >
            התחל מחדש
          </button>
        </div>
      </div>

      {/* Main Map Body split view */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 max-w-7xl w-full mx-auto overflow-hidden">
        {/* Left Side: Dynamic focus card explaining next journey step */}
        <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4"
          >
            <div>
              <span className="text-amber-500 text-xs font-bold uppercase tracking-wider block mb-1">השלב הבא במסע שלך</span>
              {currentActiveNode ? (
                <>
                  <h3 className="text-2xl font-black font-sans text-white">
                    שלב {currentActiveNode.stage}: {currentActiveNode.hebrewName}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 font-semibold text-amber-500/80">
                    סוג שלב: {getNodeTypeName(currentActiveNode.type)}
                  </p>
                </>
              ) : (
                <h3 className="text-2xl font-black font-sans text-white">הושלמו כל השלבים!</h3>
              )}
            </div>

            <div className="p-3 bg-slate-950/55 rounded-xl text-xs text-slate-405 leading-relaxed">
              {currentActiveNode?.type === NodeType.COMBAT && (
                <p>מפלצות רגילות התמקמו בנתיב המעבר. הבס אותן כדי להשיג מטבעות זהב יקרים ושיעור חפיסת קלפים מיומנות מגוונים.</p>
              )}
              {currentActiveNode?.type === NodeType.ELITE && (
                <p>מפלצת חזקה ומסוכנת במיוחד חוסמת את המעבר במערות! קרב קשה שמבטיח סיכוי גבוה במיוחד לקבלת חפצים נדירים מבוססי ציוד.</p>
              )}
              {currentActiveNode?.type === NodeType.CHEST && (
                <p>אוצר חבוי בנקיקי הסלעים. מיצאו מפתח סודי או פתחו את התיבה בבטחה כדי להביא זהב, קלפים וציוד חדש ישר לתיק הגב.</p>
              )}
              {currentActiveNode?.type === NodeType.SHOP && (
                <p>רוכל מסתורי תחת אור הירח מציע לקנות חפצים פשוטים שהשגתם, לרכוש קלפים אגדיים ובקבוקי חיים, או לחשל את הציוד ברמת הדרגה.</p>
              )}
              {currentActiveNode?.type === NodeType.CAMPFIRE && (
                <p>עצור כאן מסביב למדורת היער החמימה. בחר לרפא 35% מחיים שלך או למחוק לחלוטין ולזקק קלף מהחפיסה שלך כדי לשמור על חפיסה רזה ומדויקת.</p>
              )}
              {currentActiveNode?.type === NodeType.BOSS && (
                <p>דרקון האש האדום ממתין לקץ חייך במאורת הלבה. אספו את מירב כוחותיכם, שדרגו את כלי הלחימה שלכם והתמודדו בקרב הקטלני מכולם!</p>
              )}
            </div>

            {currentActiveNode && (
              <button
                onClick={() => onEnterNode(hero.stage - 1)}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-base rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
              >
                <span>הכנס אל: {currentActiveNode.hebrewName}</span>
                <LucideIcon name="ArrowLeft" size={18} />
              </button>
            )}
          </motion.div>
        </div>

        {/* Right Side: Visual connected stage map */}
        <div className="lg:col-span-7 flex flex-col justify-center order-1 lg:order-2">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 overflow-y-auto max-h-[55h] md:max-h-[65vh] pr-4 space-y-4 relative">
            <h3 className="text-base font-bold text-slate-300 pb-3 border-b border-slate-800 mb-2">מפת התקדמות הממלכה</h3>

            {/* Stage connections */}
            <div className="relative space-y-3">
              {currentStagesList.map((node, index) => {
                const isCompleted = hero.stage > node.stage;
                const isCurrent = hero.stage === node.stage;
                const nodeStyle = getNodeStyles(node.type, isCurrent, isCompleted);
                
                return (
                  <div
                    key={node.stage}
                    className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-300 flex-row-reverse ${
                      isCurrent
                        ? `${nodeStyle.bg} bg-slate-900 ${nodeStyle.shadow}`
                        : isCompleted
                        ? "bg-slate-950/40 border-slate-900 border opacity-75"
                        : "bg-slate-950/10 border-slate-900 opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {/* Node Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-bold ${
                        isCurrent
                          ? "bg-amber-400 text-slate-950 border-white"
                          : isCompleted
                          ? "bg-slate-800 text-slate-500 border-slate-700"
                          : "bg-slate-950 text-slate-700 border-slate-900"
                      }`}
                    >
                      {isCompleted ? <LucideIcon name="Check" size={14} className="text-slate-400" /> : node.stage}
                    </div>

                    {/* Node details */}
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <h4 className={`font-bold font-sans text-sm ${isCurrent ? "text-white" : isCompleted ? "text-slate-500" : "text-slate-600"}`}>
                          {node.hebrewName}
                        </h4>
                        <LucideIcon
                          name={getNodeIcon(node.type)}
                          size={15}
                          className={isCurrent ? "text-amber-400" : isCompleted ? "text-slate-600" : "text-slate-750"}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono tracking-wider mt-0.5">
                        {getNodeTypeName(node.type)}
                      </span>
                    </div>

                    {/* Status Label */}
                    <div className="text-left font-semibold text-xs">
                      {isCurrent ? (
                        <span className="text-amber-400 animate-pulse font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                          נוכחי • פעיל
                        </span>
                      ) : isCompleted ? (
                        <span className="text-slate-600 font-medium">עבר בהצלחה</span>
                      ) : (
                        <span className="text-slate-700 flex items-center gap-1">
                          <LucideIcon name="Lock" size={11} /> נעול
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Game Guide / Manual Model */}
      <AnimatePresence>
        {guideOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-right overflow-y-auto max-h-[85vh] relative shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <button
                  onClick={() => setGuideOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <LucideIcon name="X" size={18} />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-amber-400">📖 מדריך קווסט הקלפים ומקרא מפה</h3>
                  <LucideIcon name="BookOpen" size={20} className="text-amber-400" />
                </div>
              </div>

              {/* Node Legend Grid */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-200">📍 מדריך סמלי השלבים בממלכה</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-amber-400">⚔️ קרב פילוסים (COMBAT)</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        מפגש מול מפלצות רגילות. הבסתן מעניקה זהב, נקודות XP וסיכוי לבחור קלף משובח להעשרת החפיסה שלך.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300">
                      <LucideIcon name="Swords" size={14} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-orange-400">🔥 קרב עילית (ELITE)</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        אויב חזק במיוחד. השלמת השלב נותנת כמות זהב מוגברת וסיכוי של 80%-100% לקבל חפץ ציוד נדיר חדש.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-orange-950/30 border border-orange-900/40 flex items-center justify-center text-orange-400">
                      <LucideIcon name="FlameKindling" size={14} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-blue-400">🛒 סוחר הממלכה (SHOP)</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        מאפשר למכור חפצים שאין בכם צורך בזהב, לקנות שיקויי חיים, לרכוש קלפים חזקים, ולפתח את רמת ציוד תיק הגב.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-blue-950/30 border border-blue-900/40 flex items-center justify-center text-blue-400">
                      <LucideIcon name="ShoppingCart" size={14} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-emerald-400">⛺ מדורת היער (CAMPFIRE)</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        מנוחה בטוחה. בחר בין ריפוי מהיר של 35% מנקודות החיים לבין מחיקת קלף חלש או מיושן כדי למקסם את איכות היד.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/30 border border-emerald-900/40 flex items-center justify-center text-emerald-400">
                      <LucideIcon name="Flame" size={14} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-amber-500">🎁 תיבת אוצר (CHEST)</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        אוצר אקראי חינמי המכיל זהב, קלף רנדומלי, ולעיתים קרובות גם חפץ ציוד יקר ערך ללא שום סיכון.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-amber-950/20 border border-amber-900/30 flex items-center justify-center text-amber-500">
                      <LucideIcon name="Gift" size={14} />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                    <div className="flex-1">
                      <h5 className="font-bold text-xs text-red-500">👑 דרקון הבוס (BOSS)</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                        דרקון לבה מוגן המהווה את המבחן האולטימטיבי. הבסתו מעניקה 200 זהב ובונוסים אגדיים קבועים לדמותך.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-900/40 flex items-center justify-center text-red-500">
                      <LucideIcon name="Crown" size={14} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Tips */}
              <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-slate-200 flex items-center justify-end gap-1.5">
                  <span>💡 טיפים טקטיים להשלמת המשימה</span>
                  <LucideIcon name="Lightbulb" size={14} className="text-amber-400" />
                </h4>
                <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1.5 leading-relaxed">
                  <li><strong>חפיסה רזה וממוקדת:</strong> תורת המשחקים מוכיחה כי עדיף להחזיק מעט קלפים חזקים ומשודרגים מאשר חפיסה מרובת קלפים חלשים המקשים על סנכרון היד. השתמש במדורה כדי לנקות קלפי בסיס זולים.</li>
                  <li><strong>שני צידי שריון הגיבור:</strong> שלב בין הגנת מגן (Block) קדמית לקלפי התקפה. מנע נזק ככל האפשר במקום לרפא אותו בדיעבד.</li>
                  <li><strong>שילוב ציוד התיקים:</strong> הצטייד בנשק (Weapon), שריון (Armor) ואביזר נלווה (Accessory). שדרג אותם בזהב אצל הסוחר כדי להעלות את נקודות החיים המרביות של הגיבור ואת עוצמת קלפיו.</li>
                  <li><strong>עבודה סבלנית עם רעלים:</strong> דמות נוכל הרעלים נשענת על נזק מצטבר. קלפי רעל לא מבוטלים עם הגנת אויב, אלא מחלחלים לתורו של היריב ישירות.</li>
                </ul>
              </div>

              <button
                onClick={() => setGuideOpen(false)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl transition cursor-pointer"
              >
                סגור מדריך וחזור למסע ⚔️
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
