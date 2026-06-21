import React from "react";
import { LucideIcon } from "./LucideIcon";

interface CardPortraitProps {
  cardId: string;
}

export function CardPortrait({ cardId }: CardPortraitProps) {
  // Define default values
  let bgGradient = "from-slate-900 to-slate-800";
  let ringColor = "border-slate-700/50";
  let characterIcon = "User";
  let characterColor = "text-slate-400";
  let auraColor = "bg-slate-400/5";
  let elementTag = "🗡️ הרפתקן";
  let miniCharacterLabel = "דמות";
  let avatarEmoji = "🕵️"; // default character emoji

  // Warrior Starter & Loot Cards
  if (cardId.startsWith("card_w") || cardId.startsWith("w_")) {
    bgGradient = "from-orange-950/40 via-red-950/20 to-slate-900";
    ringColor = "border-orange-500/30";
    characterColor = "text-orange-400";
    auraColor = "bg-orange-500/10";
    elementTag = "🛡️ לוחם פלדה";
    miniCharacterLabel = "סר ואנס";
    avatarEmoji = "💂"; // Knight Avatar

    if (cardId === "card_w1") {
      avatarEmoji = "🛡️";
      miniCharacterLabel = "ואנס המגן";
    } else if (cardId === "card_w2") {
      avatarEmoji = "⚔️";
      miniCharacterLabel = "אביר מתקיף";
    } else if (cardId === "card_w3") {
      avatarEmoji = "🪓";
      miniCharacterLabel = "מוציא להורג";
    } else if (cardId === "card_w4") {
      avatarEmoji = "🧱";
      miniCharacterLabel = "מגן חסין";
    } else if (cardId === "card_w5") {
      avatarEmoji = "💖";
      miniCharacterLabel = "אביר מרפא";
    } else if (cardId.includes("strike")) {
      avatarEmoji = "👊";
      miniCharacterLabel = "ואנס החובט";
    } else if (cardId.includes("defend")) {
      avatarEmoji = "🛡️";
      miniCharacterLabel = "ואנס המתגונן";
    } else if (cardId.includes("bash")) {
      avatarEmoji = "🔨";
      miniCharacterLabel = "ואנס המנפץ";
    } else if (cardId.includes("cry")) {
      avatarEmoji = "🗣️";
      miniCharacterLabel = "ואנס הזועק";
    }
  } 
  // Mage Starter & Loot Cards
  else if (cardId.startsWith("card_m") || cardId.startsWith("m_")) {
    bgGradient = "from-blue-950/50 via-indigo-950/30 to-slate-900";
    ringColor = "border-blue-500/30";
    characterColor = "text-blue-400";
    auraColor = "bg-blue-500/15";
    elementTag = "⚡ שולט לחש";
    miniCharacterLabel = "ליידי אלנה";
    avatarEmoji = "🧙‍♀️"; // Sorceress Avatar

    if (cardId === "card_m1") {
      avatarEmoji = "⚡";
      miniCharacterLabel = "קוסם ברקים";
    } else if (cardId === "card_m2") {
      avatarEmoji = "🔮";
      miniCharacterLabel = "שומר ארקיין";
    } else if (cardId === "card_m3") {
      avatarEmoji = "❄️";
      miniCharacterLabel = "לוחש כפור";
    } else if (cardId === "card_m4") {
      avatarEmoji = "🧪";
      miniCharacterLabel = "קוסם חליטה";
    } else if (cardId.includes("fire")) {
      avatarEmoji = "🔥";
      miniCharacterLabel = "אלנה החורכת";
    } else if (cardId.includes("barrier")) {
      avatarEmoji = "🧊";
      miniCharacterLabel = "אלנה המקפיאה";
    } else if (cardId.includes("intellect")) {
      avatarEmoji = "🧘‍♀️";
      miniCharacterLabel = "אלנה המתרכזת";
    } else if (cardId.includes("pyro")) {
      avatarEmoji = "☄️";
      miniCharacterLabel = "אלנה ההרסנית";
    } else if (cardId.includes("shock")) {
      avatarEmoji = "⚡";
      miniCharacterLabel = "אלנה המחשמלת";
    }
  } 
  // Rogue Starter & Loot Cards
  else if (cardId.startsWith("card_r") || cardId.startsWith("r_")) {
    bgGradient = "from-emerald-950/50 via-teal-950/30 to-slate-900";
    ringColor = "border-emerald-500/30";
    characterColor = "text-emerald-400";
    auraColor = "bg-emerald-500/15";
    elementTag = "🧪 נוכל רעלים";
    miniCharacterLabel = "סליי הצללים";
    avatarEmoji = "🥷"; // Rogue Assassin Avatar

    if (cardId === "card_r1") {
      avatarEmoji = "🧪";
      miniCharacterLabel = "ראש רעלים";
    } else if (cardId === "card_r2") {
      avatarEmoji = "🐍";
      miniCharacterLabel = "רעלן נשיקה";
    } else if (cardId === "card_r3") {
      avatarEmoji = "👟";
      miniCharacterLabel = "נוכל מילוט";
    } else if (cardId === "card_r4") {
      avatarEmoji = "🗡️";
      miniCharacterLabel = "מתנקש צללים";
    } else if (cardId.includes("slash")) {
      avatarEmoji = "🔪";
      miniCharacterLabel = "סליי החותך";
    } else if (cardId.includes("poison")) {
      avatarEmoji = "💀";
      miniCharacterLabel = "סליי המרעיל";
    } else if (cardId.includes("defend")) {
      avatarEmoji = "💨";
      miniCharacterLabel = "סליי המתחמק";
    } else if (cardId.includes("smoke")) {
      avatarEmoji = "🌫️";
      miniCharacterLabel = "סליי המערפל";
    }
  } 
  // Cleric Starter & Loot Cards
  else if (cardId.startsWith("card_c") || cardId.startsWith("c_")) {
    bgGradient = "from-cyan-950/50 via-sky-950/30 to-slate-900";
    ringColor = "border-cyan-500/30";
    characterColor = "text-cyan-400";
    auraColor = "bg-cyan-500/15";
    elementTag = "✨ כוהן קדוש";
    miniCharacterLabel = "אלדר מלכיאור";
    avatarEmoji = "👨‍🦳"; // Cleric / Elder Healer Avatar

    if (cardId === "card_c1") {
      avatarEmoji = "☀️";
      miniCharacterLabel = "כוהן שורף";
    } else if (cardId === "card_c2") {
      avatarEmoji = "⛪";
      miniCharacterLabel = "מקדש קודש";
    } else if (cardId === "card_c3") {
      avatarEmoji = "🧱";
      miniCharacterLabel = "שומר אמונה";
    } else if (cardId === "card_c4") {
      avatarEmoji = "😇";
      miniCharacterLabel = "ניצוץ חיים";
    } else if (cardId.includes("strike")) {
      avatarEmoji = "✨";
      miniCharacterLabel = "אלדר המכה";
    } else if (cardId.includes("prayer")) {
      avatarEmoji = "🙏";
      miniCharacterLabel = "אלדר המתפלל";
    } else if (cardId.includes("shield") || cardId.includes("ward")) {
      avatarEmoji = "🛡️";
      miniCharacterLabel = "אלדר הממגן";
    } else if (cardId.includes("smite")) {
      avatarEmoji = "⚡";
      miniCharacterLabel = "אלדר המצליף";
    } else if (cardId.includes("aura")) {
      avatarEmoji = "🟡";
      miniCharacterLabel = "אלדר המקרין";
    }
  } 
  // Ranger Starter & Loot Cards
  else if (cardId.startsWith("card_ra") || cardId.startsWith("ra_")) {
    bgGradient = "from-yellow-950/50 via-amber-950/30 to-slate-900";
    ringColor = "border-yellow-500/30";
    characterColor = "text-yellow-400";
    auraColor = "bg-yellow-500/15";
    elementTag = "🏹 קשת יערות";
    miniCharacterLabel = "סיירת קירה";
    avatarEmoji = "🧝‍♀️"; // Ranger Swiftbow Avatar

    if (cardId === "card_ra1") {
      avatarEmoji = "🎯";
      miniCharacterLabel = "קלאי מוסמך";
    } else if (cardId === "card_ra2") {
      avatarEmoji = "🍃";
      miniCharacterLabel = "סוואה חרישית";
    } else if (cardId === "card_ra3") {
      avatarEmoji = "⛈️";
      miniCharacterLabel = "מטר חצים";
    } else if (cardId === "card_ra4") {
      avatarEmoji = "🕸️";
      miniCharacterLabel = "צייד מלכודת";
    } else if (cardId.includes("shot")) {
      avatarEmoji = "🏹";
      miniCharacterLabel = "קירה היורה";
    } else if (cardId.includes("dodge")) {
      avatarEmoji = "🍃";
      miniCharacterLabel = "קירה החומקת";
    } else if (cardId.includes("poison")) {
      avatarEmoji = "🦂";
      miniCharacterLabel = "קירה המרעילה";
    } else if (cardId.includes("triple")) {
      avatarEmoji = "🏹";
      miniCharacterLabel = "מטח חצים";
    } else if (cardId.includes("focus")) {
      avatarEmoji = "👁️";
      miniCharacterLabel = "קירה הממוקדת";
    }
  }

  return (
    <div className={`w-full h-12 rounded-xl bg-gradient-to-b ${bgGradient} border ${ringColor} relative flex items-center justify-center overflow-hidden mb-1 shadow-inner`}>
      {/* Visual backdrop grid and runes */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:12px_12px]" />
      
      {/* Decorative color halo behind the virtual portrait */}
      <div className={`absolute w-8 h-8 rounded-full ${auraColor} blur-sm`} />

      {/* Content wrapper */}
      <div className="relative flex flex-col items-center justify-center z-10 space-y-0.5">
        <div className="flex items-center gap-1 font-bold text-white">
          <span className="text-sm select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{avatarEmoji}</span>
          <span className="text-[9px] font-black tracking-wide truncate max-w-[65px] text-slate-200">{miniCharacterLabel}</span>
        </div>
        
        {/* Subtle subtag */}
        <span className="text-[7px] text-slate-400 opacity-90 font-bold">{elementTag}</span>
      </div>
    </div>
  );
}
