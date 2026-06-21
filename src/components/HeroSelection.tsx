import React, { useState, useEffect } from "react";
import { INITIAL_HEROES, STARTING_DECKS } from "../data/gameData";
import { LucideIcon } from "./LucideIcon";
import { motion } from "motion/react";
import { getLeaderboard, LeaderboardEntry, resetLeaderboard } from "../utils/leaderboard";
import { Hero } from "../types";

interface HeroSelectionProps {
  onSelectHero: (classId: string, customName?: string) => void;
  savedHeroes?: Hero[];
  onContinueHero?: (hero: Hero) => void;
  onDeleteSavedHero?: (instanceId: string) => void;
}

export function HeroSelection({
  onSelectHero,
  savedHeroes = [],
  onContinueHero,
  onDeleteSavedHero,
}: HeroSelectionProps) {
  const [selectedHeroId, setSelectedHeroId] = useState<string>("warrior");
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [confirmResetLeaderboard, setConfirmResetLeaderboard] = useState(false);

  useEffect(() => {
    setLeaderboard(getLeaderboard());
  }, []);

  useEffect(() => {
    if (selectedHeroId && !customNames[selectedHeroId]) {
      const randomName = getRandomName(selectedHeroId);
      setCustomNames((prev) => ({
        ...prev,
        [selectedHeroId]: randomName,
      }));
    }
  }, [selectedHeroId, customNames]);

  const handleResetLeaderboard = () => {
    const fresh = resetLeaderboard();
    setLeaderboard(fresh);
    setConfirmResetLeaderboard(false);
  };

  const getRandomName = (classType: string) => {
    const warriorNames = [
      "סר גדעון המגן", "ברק חומת ברזל", "נמרוד עז-נפש", "גאלד מנפץ", "אלון הלהב", "מרקוס האמיץ", "ויקטור הפלדה", "ראגנאר השואג", "אריאל המנצח", "חגי חרב-אור"
    ];
    const mageNames = [
      "הליידי אלנה", "אשף הקרח מיאל", "מורגנה סופת אש", "זולטאן הלהבה", "לומינארה המאגית", "שרוליק הלחשן", "סולומון הזקן", "לונה ספקטרום", "רונן המכשף", "ענת החוזה"
    ];
    const rogueNames = [
      "סליי הצל", "זאב בודד", "אשר מהיר-הרוח", "סיירס החומק", "בראקן ענן-רעל", "שניאור דקירה", "אלדד הערפל", "לילי השקטה", "בנימין הלהב", "תמר שודדת-ים"
    ];
    const clericNames = [
      "אלדר מלכיאור", "הכוהן סמואל", "אריאל הקדוש", "גבריאל האור", "פיניאס הברוך", "יונתן המרפא", "אלישע השמימי", "דוד המשיח", "מיכל המגוננת"
    ];
    const rangerNames = [
      "קירה מהירת-חץ", "רובין סייר-היער", "גלן עין-הבז", "צלף היערות לוקאס", "דריזט מהיר-רוח", "יערה צלפת-חצים", "רני פחם", "גדעון הקשת", "נדב השקט"
    ];

    let pool = warriorNames;
    if (classType === "mage") pool = mageNames;
    else if (classType === "rogue") pool = rogueNames;
    else if (classType === "cleric") pool = clericNames;
    else if (classType === "ranger") pool = rangerNames;

    const randIdx = Math.floor(Math.random() * pool.length);
    return pool[randIdx];
  };

  const getClassBadgeAndDescription = (classType: string) => {
    switch (classType) {
      case "warrior":
        return {
          icon: "Shield",
          desc: "סר ואנס חסין גוף המשלב מכות פלדה חזקות עם מגני ברזל שסופגים נזקי אויבים וכוח זעם מתפרץ.",
          label: "לוחם פלדה",
          color: "text-orange-400 bg-orange-500/10 border-orange-500/20 hover:border-orange-400 hover:shadow-orange-950/20"
        };
      case "mage":
        return {
          icon: "Sparkles",
          desc: "הליידי אלנה מעוררת את כוחות היסוד מחדש עם ברקים וסופות אש אדירות, ומגנה על עצמה בלחשי קרח מחושבים.",
          label: "שולטת הלחשים",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-400 hover:shadow-blue-950/20"
        };
      case "rogue":
        return {
          icon: "Skull",
          desc: "סליי הצללים תוקף במהירות מסחררת, חומק ממתקפות אויבים ומכניס את מטרותיו למעגל רעלי גמילה ועינויים.",
          label: "נוכל רעלים",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-400 hover:shadow-emerald-950/20"
        };
      case "cleric":
        return {
          icon: "Heart",
          desc: "אלדר מלכיאור מחדיר אור קדוש מרפא, מגביר את כוח הקרנט שלו ומנחית על פולשי השאול מכות שמיים זוהרות.",
          label: "כוהן קדוש",
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-400 hover:shadow-cyan-950/20"
        };
      case "ranger":
        return {
          icon: "Crosshair",
          desc: "קירה מהירת-חץ משלבת ירי מרחוק של מטח חצים קטלני, מגבירה ריכוז חודר שריון וחומקת בזריזות רוחנית.",
          label: "קשת יערות",
          color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-400 hover:shadow-yellow-950/20"
        };
      default:
        return {
          icon: "User",
          desc: "הרפתקן מסתורי.",
          label: "הרפתקן",
          color: "text-slate-400 bg-slate-500/10 border-slate-500/20"
        };
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 md:p-8 relative overflow-x-hidden"
      dir="rtl"
    >
      {/* Visual background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Title Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mb-10 z-10"
      >
        <span className="text-amber-500 text-[11px] md:text-xs font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          מסע הרפתקאות בקלפים • RPG Card Battler
        </span>
        <h1 className="text-3xl md:text-5xl font-black font-sans text-white mt-4 tracking-tight drop-shadow-md">
          בחר את <span className="text-amber-400">הגיבור</span> שלך
        </h1>
        <p className="text-slate-400 text-xs md:text-sm mt-3 leading-relaxed">
          כל גיבור מגיע עם חפיסת קלפים התחלתית ייחודית, משאבי חיים שונים, ואפשרויות לחימה מגוונות. 
          השאר את השם הקיים או הענק לו שם מותאם אישית משלך!
          הבס מפלצות, גלה אוצרות קודש, שדרג נשקים והילחם בדרקון האש האדום!
        </p>
      </motion.div>

      {/* Saved Active Quests */}
      {savedHeroes && savedHeroes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl w-full bg-amber-500/5 border border-amber-500/20 p-5 md:p-6 rounded-2xl shadow-xl z-10 mb-8"
        >
          <h3 className="text-sm md:text-base font-black text-amber-400 font-sans text-right mb-2 flex items-center justify-end gap-2">
            <LucideIcon name="History" size={16} className="text-amber-500 animate-pulse" />
            <span>המשך מסע שמור פעיל ({savedHeroes.length})</span>
          </h3>
          <p className="text-right text-[10px] md:text-xs text-slate-400 mb-4">
            בחר גיבור שכבר התחיל את המסע כדי להמשיך מהשלב והדרגה הנוכחיים שלו! כל ההישגים שמורים.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4" dir="rtl">
            {savedHeroes.map((hInstance, index) => {
              const classDetails = getClassBadgeAndDescription(hInstance.classType);
              return (
                <div
                  key={hInstance.instanceId || hInstance.id + "_" + index}
                  className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-row items-center justify-between hover:border-amber-500/40 transition-all shadow-md group relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-850 shrink-0">
                      <LucideIcon name={classDetails.icon} size={20} className="text-amber-400" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-white text-xs md:text-sm leading-tight">{hInstance.hebrewName}</h4>
                      <p className="text-[9px] md:text-[10px] text-slate-400 mt-1">
                        דרגה {hInstance.level} שלב {hInstance.stage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onContinueHero?.(hInstance)}
                      className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-[10px] md:text-xs flex items-center gap-1 cursor-pointer select-none transition"
                    >
                      <span>המשך</span>
                      <LucideIcon name="Play" size={10} />
                    </button>
                    <button
                      onClick={() => onDeleteSavedHero?.(hInstance.instanceId || "")}
                      className="p-1.5 bg-slate-950 hover:bg-red-900/40 text-slate-500 hover:text-red-400 hover:border-red-500/35 border border-slate-850 rounded-lg cursor-pointer select-none transition"
                      title="מחק שמירה זו"
                    >
                      <LucideIcon name="Trash2" size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl w-full z-10 px-4 mb-8">
        {INITIAL_HEROES.map((hero, idx) => {
          const startingCards = STARTING_DECKS[hero.classType as keyof typeof STARTING_DECKS] || [];
          const classDetails = getClassBadgeAndDescription(hero.classType);
          const isSelected = selectedHeroId === hero.id;

          return (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className={`p-5 bg-slate-900/80 rounded-2xl cursor-pointer flex flex-col justify-between transition-all duration-300 shadow-xl border relative ${
                isSelected
                  ? "border-amber-400 shadow-amber-500/10 bg-slate-900 ring-2 ring-amber-500/20"
                  : "border-slate-800 hover:border-slate-700 hover:shadow-amber-500/5"
              }`}
              onClick={() => setSelectedHeroId(hero.id)}
            >
              {isSelected && (
                <div className="absolute -top-2 -left-2 bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-lg text-[9px] shadow-lg flex items-center gap-0.5 border border-amber-300 z-20">
                  <LucideIcon name="Check" size={10} />
                  <span>נבחר</span>
                </div>
              )}

              <div>
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border bg-slate-950 ${classDetails.color.split(" ")[0]}`}>
                    {classDetails.label}
                  </span>
                  
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                    isSelected ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-slate-950 border-slate-850 text-slate-300"
                  }`}>
                    <LucideIcon name={classDetails.icon} size={20} />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-bold text-white text-sm text-right leading-tight mb-2">
                    {hero.name}
                  </h3>
                </div>
                
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed text-right min-h-[55px]">
                  {classDetails.desc}
                </p>

                {/* Core Stats Overview */}
                <div className="mt-4 space-y-1.5 bg-slate-950/60 p-2.5 rounded-xl text-xs">
                  <div className="flex justify-between flex-row-reverse text-[11px]">
                    <span className="text-slate-400">חיים התחלתיים:</span>
                    <span className="font-bold text-red-400 font-mono flex items-center gap-1 flex-row-reverse">
                      {hero.maxHp} HP ❤️
                    </span>
                  </div>
                  <div className="flex justify-between flex-row-reverse text-[11px]">
                    <span className="text-slate-400">אנרגיה לתור:</span>
                    <span className="font-bold text-blue-400 font-mono flex items-center gap-1 flex-row-reverse">
                      {hero.maxMana} ⚡
                    </span>
                  </div>
                  <div className="flex justify-between flex-row-reverse text-[11px]">
                    <span className="text-slate-400">חפיסת קלפים:</span>
                    <span className="font-bold text-amber-500 font-mono">{startingCards.length} קלפים</span>
                  </div>
                </div>

                {/* Starting Cards preview */}
                <div className="mt-4 border-t border-slate-850/60 pt-3">
                  <h4 className="text-[10px] font-bold text-slate-500 mb-1.5 text-right uppercase">קלפים בולטים</h4>
                  <div className="flex flex-wrap gap-1">
                    {startingCards.slice(0, 3).map((card, i) => (
                      <span
                        key={card.id + "_" + i}
                        className="text-[9px] bg-slate-950/80 border border-slate-850/80 text-slate-300 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-sans"
                      >
                        <LucideIcon name={card.icon} size={8} className="text-slate-500" />
                        {card.hebrewName}
                      </span>
                    ))}
                    {startingCards.length > 3 && (
                      <span className="text-[9px] text-slate-500 self-center mr-1">
                        +{startingCards.length - 3} נוספים...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Naming & confirmation Desk */}
      {selectedHeroId && (() => {
        const selectedHero = INITIAL_HEROES.find(h => h.id === selectedHeroId);
        if (!selectedHero) return null;
        const classDetails = getClassBadgeAndDescription(selectedHero.classType);
        const nameVal = customNames[selectedHeroId] || "";

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/40 p-6 rounded-2xl shadow-2xl z-10 mb-12 text-center relative overflow-hidden"
          >
            {/* Ambient decorative effect */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                <LucideIcon name={classDetails.icon} size={16} />
              </div>
              <h3 className="text-sm md:text-base font-black text-amber-400 font-sans">גיבור נבחר: {classDetails.label}</h3>
            </div>

            <p className="text-[11px] md:text-xs text-slate-400 mb-4 leading-relaxed">
              הענק שם אגדי לגיבור המיועד, או הגרל שם מתוך הארכיון המלכותי!
            </p>

            {/* Custom Input controls */}
            <div className="flex items-center gap-2 max-w-sm mx-auto mb-5 relative">
              <button
                onClick={() => {
                  const rName = getRandomName(selectedHeroId);
                  setCustomNames(prev => ({ ...prev, [selectedHeroId]: rName }));
                }}
                className="p-3 bg-slate-950 hover:bg-slate-850 text-amber-400 hover:text-amber-300 border border-slate-800 hover:border-amber-500/30 rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1 shrink-0 group"
                title="הגרל שם אקראי"
              >
                <LucideIcon name="Dices" size={18} className="group-hover:rotate-12 transition-transform" />
              </button>

              <div className="relative w-full">
                <input
                  type="text"
                  value={nameVal}
                  onChange={(e) => setCustomNames({ ...customNames, [selectedHeroId]: e.target.value })}
                  maxLength={16}
                  placeholder="הקלד שם לגיבור..."
                  className="w-full text-center font-bold text-sm bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-400 text-white rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition text-right"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => onSelectHero(selectedHeroId, nameVal)}
              disabled={!nameVal.trim()}
              className="w-full max-w-xs py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <span>צא למסע כ-{nameVal}! ⚔️</span>
            </button>
          </motion.div>
        );
      })()}

      {/* Leaderboard Section - היכל התהילה */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl w-full bg-slate-900/60 border border-slate-800 p-5 md:p-6 rounded-2xl shadow-2xl z-10"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 flex-row-reverse">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <LucideIcon name="Trophy" size={18} />
            </div>
            <div className="text-right">
              <h3 className="text-lg font-black text-white font-sans">היכל התהילה של הממלכה</h3>
              <p className="text-xs text-slate-400">הגיבורים האגדיים ורמות ההישגים שלהם</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {confirmResetLeaderboard ? (
              <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 px-2.5 py-1 rounded text-right">
                <span className="text-[10px] text-red-400 font-bold ml-1">בטוח?</span>
                <button
                  onClick={handleResetLeaderboard}
                  className="text-[9px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-black transition cursor-pointer"
                >
                  כן, אפס
                </button>
                <button
                  onClick={() => setConfirmResetLeaderboard(false)}
                  className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-black transition cursor-pointer"
                >
                  בטל
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmResetLeaderboard(true)}
                className="text-[10px] bg-slate-950 hover:bg-red-950/20 px-2.5 py-1 rounded border border-slate-800 hover:border-red-900 text-slate-400 hover:text-red-400 font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <LucideIcon name="Trash2" size={11} />
                <span>איפוס שחקנים</span>
              </button>
            )}
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            אין גיבורים רשומים עדיין. צא למסע הראשון שלך והוכח את גבורתך!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 text-[10px] uppercase font-bold">
                  <th className="pb-2.5 font-medium pl-2">מיקום</th>
                  <th className="pb-2.5 font-medium pr-2 text-right">שם הגיבור</th>
                  <th className="pb-2.5 font-medium text-center">מקצוע</th>
                  <th className="pb-2.5 font-medium text-center">רמה</th>
                  <th className="pb-2.5 font-medium text-center">תוצאת ריצה (שלב)</th>
                  <th className="pb-2.5 font-medium text-left">זהב</th>
                  <th className="pb-2.5 font-medium text-left">תאריך</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40">
                {leaderboard.map((entry, index) => {
                  const isTop3 = index < 3;
                  const trophyColor = index === 0 ? "text-yellow-405" : index === 1 ? "text-slate-300" : "text-amber-600";
                  const classLabel = getClassBadgeAndDescription(entry.classType).label;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-850/20 transition-colors">
                      {/* Rank Column */}
                      <td className="py-2.5 font-bold pl-2 text-slate-400 flex items-center gap-1">
                        {isTop3 ? (
                          <span className={trophyColor}>🏆 #{index + 1}</span>
                        ) : (
                          <span>#{index + 1}</span>
                        )}
                      </td>

                      {/* Hero Name Column */}
                      <td className="py-2.5 font-bold text-white pr-2">
                        {entry.heroName}
                      </td>

                      {/* Class Column */}
                      <td className="py-2.5 text-center">
                        <span className="bg-slate-950/80 px-2.5 py-0.5 rounded border border-slate-850 text-slate-300 text-[10px]">
                          {classLabel}
                        </span>
                      </td>

                      {/* Level Column */}
                      <td className="py-2.5 text-center font-mono font-bold text-amber-400">
                        רמה {entry.level}
                      </td>

                      {/* Stage Reached Column */}
                      <td className="py-2.5 text-center">
                        {entry.victory ? (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            👑 ניצחון מוחלט (שלב 10)
                          </span>
                        ) : (
                          <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full text-[10px] font-medium">
                            💀 נפל בשלב {entry.stageReached}
                          </span>
                        )}
                      </td>

                      {/* Gold Column */}
                      <td className="py-2.5 text-left font-mono text-amber-500 font-bold">
                        {entry.gold} זהב 💰
                      </td>

                      {/* Date Column */}
                      <td className="py-2.5 text-left font-mono text-slate-500 text-[10px]">
                        {entry.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
