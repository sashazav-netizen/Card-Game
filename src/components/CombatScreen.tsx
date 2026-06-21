import React, { useState, useEffect } from "react";
import { Hero, Card, Monster, NodeType, MonsterIntent, CardType, Item } from "../types";
import { LucideIcon } from "./LucideIcon";
import { CardPortrait } from "./CardPortrait";
import { motion, AnimatePresence } from "motion/react";
import {
  getModifiedCard,
  getDamageBonus,
  getBlockBonus,
  getMaxHpBonus,
  getMaxManaBonus,
  getRarityBg,
  getRarityLabel,
  getMonsterScaleMultiplier,
} from "../utils/gameHelpers";
import { MONSTER_INTENTS, MONSTERS, LOOT_CARDS, ALL_ITEMS } from "../data/gameData";
import { gameAudio } from "../utils/audioEngine";

interface CombatScreenProps {
  hero: Hero;
  nodeType: NodeType;
  onVictory: (goldReward: number, lootedCards: Card[], lootedItems: Item[], newHp: number, xpReward: number) => void;
  onDefeat: () => void;
}

export function CombatScreen({ hero, nodeType, onVictory, onDefeat }: CombatScreenProps) {
  // Stat modifiers from items
  const dmgBonus = getDamageBonus(hero);
  const blkBonus = getBlockBonus(hero);
  const hpBonus = getMaxHpBonus(hero);
  const manaBonus = getMaxManaBonus(hero);

  const totalMaxHp = hero.maxHp + hpBonus;
  const totalMaxMana = hero.maxMana + manaBonus;

  // -- Combat State --
  const [playerHp, setPlayerHp] = useState(hero.currentHp);
  const [playerBlock, setPlayerBlock] = useState(0);
  const [playerStrength, setPlayerStrength] = useState(0);
  const [playerVulnerable, setPlayerVulnerable] = useState(0); // If > 0, takes 1.5x damage

  const [monster, setMonster] = useState<Monster | null>(null);
  const [monsterVulnerable, setMonsterVulnerable] = useState(0);
  const [monsterPoison, setMonsterPoison] = useState(0);

  // Deck mechanics
  const [drawPile, setDrawPile] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [energy, setEnergy] = useState(totalMaxMana);
  const [turn, setTurn] = useState(1);

  // Floating Combat Texts (FCT)
  const [fctList, setFctList] = useState<{ id: string; text: string; color: string; isPlayer: boolean }[]>([]);

  const addFloatingText = (text: string, color: string, isPlayer: boolean) => {
    const id = "fct_" + Math.random().toString(36).substring(2, 9);
    setFctList((prev) => [...prev, { id, text, color, isPlayer }]);
    setTimeout(() => {
      setFctList((prev) => prev.filter((item) => item.id !== id));
    }, 1500);
  };

  // General UI
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [combatOver, setCombatOver] = useState(false);
  const [victoryState, setVictoryState] = useState(false);
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);

  // Randomized rewards
  const [goldEarned, setGoldEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [cardLootOffers, setCardLootOffers] = useState<Card[]>([]);
  const [itemLootOffers, setItemLootOffers] = useState<Item[]>([]);
  
  const [selectedLootCardIdx, setSelectedLootCardIdx] = useState<number | null>(null);
  const [lootClaimed, setLootClaimed] = useState(false);

  // Flash animations state cues
  const [playerShake, setPlayerShake] = useState(false);
  const [monsterShake, setMonsterShake] = useState(false);

  const [manaWarning, setManaWarning] = useState(false);

  useEffect(() => {
    if (manaWarning) {
      const timer = setTimeout(() => {
        setManaWarning(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [manaWarning]);

  // Clean intent resolution helper
  const getIntentsPool = (monsterId: string): MonsterIntent[] => {
    if (monsterId.includes("goblin")) return MONSTER_INTENTS.goblin;
    if (monsterId.includes("slime")) return MONSTER_INTENTS.slime;
    if (monsterId.includes("skeleton")) return MONSTER_INTENTS.skeleton;
    if (monsterId.includes("orc")) return MONSTER_INTENTS.orc;
    if (monsterId.includes("golem")) return MONSTER_INTENTS.golem;
    if (monsterId.includes("dragon")) return MONSTER_INTENTS.dragon;
    return [{ type: "ATTACK", value: 6, description: "Stabs you.", hebrewDescription: "דוקר אותך בנזק 6." }];
  };

  // Scaling helpers
  const scaleMultiplier = getMonsterScaleMultiplier(hero.stage);

  const getScaledIntent = (intent: MonsterIntent): MonsterIntent => {
    if (intent.value === undefined || scaleMultiplier <= 1.0) return intent;
    const scaledVal = Math.ceil(intent.value * scaleMultiplier);
    
    // Replace the numeric values inside descriptions with the scaled value
    const valString = String(intent.value);
    const newValString = String(scaledVal);
    const scaledHebrew = intent.hebrewDescription.replace(valString, newValString);
    const scaledEnglish = intent.description ? intent.description.replace(valString, newValString) : "";

    return {
      ...intent,
      value: scaledVal,
      hebrewDescription: scaledHebrew,
      description: scaledEnglish,
    };
  };

  const addToLog = (msg: string) => {
    setCombatLog((prev) => [msg, ...prev].slice(0, 15));
  };

  // 1. Initialize Monster and shuffle deck on Mount
  useEffect(() => {
    // Determine monster pool
    let list = MONSTERS.normal;
    if (nodeType === NodeType.ELITE) list = MONSTERS.elite;
    if (nodeType === NodeType.BOSS) list = MONSTERS.boss;

    const chosenTemplate = list[Math.floor(Math.random() * list.length)];
    
    // Pick first intent
    const intentsPool = getIntentsPool(chosenTemplate.id);
    const rawInitialIntent = intentsPool[Math.floor(Math.random() * intentsPool.length)];
    const initialIntent = getScaledIntent(rawInitialIntent);

    const mult = getMonsterScaleMultiplier(hero.stage);
    const scaledMaxHp = Math.ceil(chosenTemplate.maxHp * mult);

    const spawnedMonster: Monster = {
      ...chosenTemplate,
      maxHp: scaledMaxHp,
      currentHp: scaledMaxHp,
      block: 0,
      intent: initialIntent,
    };

    setMonster(spawnedMonster);

    // Initialize Draw Pile (Shuffled upgraded clone of starting deck)
    const formattedDeck = hero.deck.map((c) => getModifiedCard(c, hero));
    const shuffled = [...formattedDeck].sort(() => 0.5 - Math.random());
    
    // Draw 5 starting cards immediately in one batch to avoid timing/lifecycle bugs
    let draw = [...shuffled];
    let drawn: Card[] = [];
    for (let i = 0; i < 5; i++) {
      if (draw.length > 0) {
        drawn.push(draw.pop()!);
      }
    }

    setHand(drawn);
    setDrawPile(draw);
    setDiscardPile([]);
    setEnergy(totalMaxMana);
    setTurn(1);

    // Start battle simulation log
    addToLog(`⚔️ הקרב התחיל! מולך ניצב: ${spawnedMonster.hebrewName}`);
    addToLog(`💡 רמז: האויב מתכנן ${spawnedMonster.intent.hebrewDescription}`);
  }, [nodeType, hero, totalMaxMana]);

  // Turn resetting for player
  const startPlayerTurn = (nextTurn: number, remDiscard: Card[], remHand: Card[], remDraw: Card[]) => {
    addToLog(`🔄 תור מספר ${nextTurn} של קלפים מתחיל...`);
    setTurn(nextTurn);
    setEnergy(totalMaxMana);
    setPlayerBlock(0); // Block decays at start of turn

    // Tick down player vulnerable
    if (playerVulnerable > 0) {
      setPlayerVulnerable((v) => v - 1);
    }

    // Discard any remaining cards in hand to discard
    const newDiscard = [...remDiscard, ...remHand];
    let draw = [...remDraw];
    let discard = [...newDiscard];
    let drawn: Card[] = [];

    // Draw 5 new cards
    for (let i = 0; i < 5; i++) {
      if (draw.length === 0) {
        draw = [...discard].sort(() => 0.5 - Math.random());
        discard = [];
      }
      if (draw.length > 0) {
        drawn.push(draw.pop()!);
      }
    }

    setHand(drawn);
    setDrawPile(draw);
    setDiscardPile(discard);
  };

  // Activate Card Trigger
  const handlePlayCard = (card: Card, index: number) => {
    if (combatOver || !monster) return;
    if (energy < card.cost) {
      setManaWarning(true);
      return;
    }

    // Deduct cost and remove card from hand
    setEnergy((e) => e - card.cost);
    const newHand = hand.filter((_, i) => i !== index);
    setHand(newHand);
    setDiscardPile((d) => [...d, card]);

    let logMsg = `🃏 שיחקת בקלף ${card.hebrewName} (עלות: ${card.cost} מנה)`;

    // Calculate attack modifiers
    if (card.damage !== undefined) {
      let finalDmg = card.damage + playerStrength;
      if (monsterVulnerable > 0) {
        finalDmg = Math.floor(finalDmg * 1.5);
      }
      
      const prevHp = monster.currentHp;
      const finalHpAfterBlock = Math.max(0, finalDmg - monster.block);
      const finalShield = Math.max(0, monster.block - finalDmg);
      
      const actualHpLost = prevHp - (monster.currentHp - finalHpAfterBlock);

      setMonsterShake(true);
      setTimeout(() => setMonsterShake(false), 200);

      // Play impact sound (heavy or simple)
      gameAudio.playImpactSound(finalDmg > 12);

      // Floating battle numbers for monster
      if (monster.block > 0) {
        const blockedAmount = Math.min(monster.block, finalDmg);
        addFloatingText(`-${blockedAmount} 🛡️`, "text-blue-400 font-bold", false);
        if (finalHpAfterBlock > 0) {
          addFloatingText(`-${finalHpAfterBlock} 💥`, "text-red-500 font-extrabold", false);
        }
      } else {
        addFloatingText(`-${finalDmg} 💥`, "text-red-500 font-extrabold", false);
      }

      setMonster((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          block: finalShield,
          currentHp: Math.max(0, prev.currentHp - finalHpAfterBlock),
        };
      });

      logMsg += ` -> גורם ${finalDmg} נזק לאויב (מתוכו ${finalHpAfterBlock} לחיים).`;

      // Trigger poison multiplier accessories/abilities if any
      // Resolve direct death if dead inside function
      if (monster.currentHp - finalHpAfterBlock <= 0) {
         triggerVictory();
         return;
      }
    }

    if (card.block !== undefined) {
      setPlayerBlock((b) => b + card.block!);
      gameAudio.playBlockSound();
      addFloatingText(`+${card.block} 🛡️`, "text-blue-400 font-bold", true);
      logMsg += ` -> מעניק לך +${card.block} נקודות הגנה לתור הנוכחי.`;
    }

    if (card.poison !== undefined) {
      setMonsterPoison((p) => p + card.poison!);
      gameAudio.playImpactSound(false);
      addFloatingText(`+${card.poison} 🧪 רעל`, "text-emerald-400 font-bold", false);
      logMsg += ` -> מטיל +${card.poison} רעל קטלני המתקדם בשקט.`;
    }

    if (card.heal !== undefined) {
      setPlayerHp((hp) => Math.min(totalMaxHp, hp + card.heal!));
      gameAudio.playHealSound();
      addFloatingText(`+${card.heal} ❤️`, "text-green-400 font-bold", true);
      logMsg += ` -> מרפא את הגיבור ב-+${card.heal} נקודות חיים.`;
    }

    if (card.drawCards !== undefined) {
      gameAudio.playDrawSound();
      addFloatingText(`+${card.drawCards} 🃏`, "text-amber-400 font-semibold", true);
      let draw = [...drawPile];
      let discard = [...discardPile];
      let newlyDrawn: Card[] = [];

      for (let i = 0; i < card.drawCards; i++) {
        if (draw.length === 0) {
          draw = [...discard].sort(() => 0.5 - Math.random());
          discard = [];
        }
        if (draw.length > 0) {
          newlyDrawn.push(draw.pop()!);
        }
      }

      setHand((h) => [...h, ...newlyDrawn]);
      setDrawPile(draw);
      setDiscardPile(discard);
      logMsg += ` -> שולף עוד +${card.drawCards} קלפים ישר ליד.`;
    }

    if (card.effectType === "strength" && card.effectValue) {
      setPlayerStrength((s) => s + card.effectValue!);
      logMsg += ` -> תגבור כוח! כל שאר המתקפות שלך יסבו +${card.effectValue} נזק תמידי בקרב זה שוטף.`;
    }

    if (card.effectType === "vulnerable" && card.effectValue) {
      setMonsterVulnerable((v) => v + card.effectValue!);
      logMsg += ` -> האויב נפגע! מופעל מצב פגיע ל-${card.effectValue} תורות הבאים (נזק פי 1.5).`;
    }

    addToLog(logMsg);
  };

  // End Turn Execution
  const handleEndTurn = () => {
    if (combatOver || !monster) return;

    addToLog("⌛ סיימת את התור שלך. מגיע תור האויב...");

    // -- Resolve monster poison first --
    let activeMonsterHp = monster.currentHp;
    if (monsterPoison > 0) {
      activeMonsterHp = Math.max(0, activeMonsterHp - monsterPoison);
      addToLog(`🧪 הרעל ממיס את האויב ומוריד ${monsterPoison} חיים!`);
      
      // Poison tick FX and sound
      gameAudio.playImpactSound(false);
      addFloatingText(`-${monsterPoison} 🧪`, "text-emerald-400 font-extrabold", false);

      setMonsterPoison((p) => Math.max(0, p - 1));

      setMonster((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentHp: activeMonsterHp,
        };
      });

      if (activeMonsterHp <= 0) {
        triggerVictory();
        return;
      }
    }

    // -- Execute Enemy Intent --
    const intent = monster.intent;
    let nextMonsterBlock = monster.block;

    if (intent.type === "ATTACK" && intent.value !== undefined) {
      let enemyDmg = intent.value;
      if (playerVulnerable > 0) {
        enemyDmg = Math.floor(enemyDmg * 1.5);
      }

      // Shield blocks damage
      const dmgAbsorbed = Math.min(playerBlock, enemyDmg);
      const remainingDmg = enemyDmg - dmgAbsorbed;

      setPlayerBlock((b) => Math.max(0, b - enemyDmg));
      
      const newPlayerHp = Math.max(0, playerHp - remainingDmg);
      setPlayerHp(newPlayerHp);

      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 200);

      // Play audio feedback for hero hit
      gameAudio.playImpactSound(true);

      // FCT for hero block and body hit
      if (dmgAbsorbed > 0) {
        addFloatingText(`-${dmgAbsorbed} 🛡️`, "text-blue-400 font-bold", true);
      }
      if (remainingDmg > 0) {
        addFloatingText(`-${remainingDmg} 💔`, "text-red-500 font-extrabold", true);
      }

      addToLog(
        `💥 האויב ביצע ${intent.hebrewDescription} (נזק סופי: ${enemyDmg} מתוכו ${remainingDmg} מוריד מחיבורי הגבור).`
      );

      if (newPlayerHp <= 0) {
        triggerDefeat();
        return;
      }
    } else if (intent.type === "DEFEND" && intent.value !== undefined) {
      nextMonsterBlock = monster.block + intent.value;
      
      gameAudio.playBlockSound();
      addFloatingText(`+${intent.value} 🛡️`, "text-blue-400 font-bold", false);

      setMonster((prev) => {
        if (!prev) return null;
        return { ...prev, block: nextMonsterBlock };
      });
      addToLog(`🛡️ האויב מתמגן ומקבל שריון קשיח של +${intent.value} נקודות הגנה היטב.`);
    } else if (intent.type === "BUFF" && intent.value !== undefined) {
      gameAudio.playImpactSound(false);
      addFloatingText(`+${intent.value} ⚔️ כוח`, "text-orange-400 font-bold", false);

      addToLog(`🔥 האויב רועם בזעם ומקבל +${intent.value} כוח מתקפה מוגבר לכל המשך הקרב.`);
    } else if (intent.type === "STUN") {
      addFloatingText("💫 מגומגם", "text-amber-400 font-medium animate-pulse", false);
      addToLog(`💫 האויב מבולבל ונראה מנוקה זמנית ולא פעל התור.`);
    }

    // Tick down monster vulnerable status
    if (monsterVulnerable > 0) {
      setMonsterVulnerable((v) => v - 1);
    }

    // Redraw next intentions of Monster
    const intentsPool = getIntentsPool(monster.id);
    const rawNextIntent = intentsPool[Math.floor(Math.random() * intentsPool.length)];
    const nextIntent = getScaledIntent(rawNextIntent);

    setMonster((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        block: nextMonsterBlock,
        intent: nextIntent,
      };
    });

    addToLog(`💡 תוכנית פעולה הבאה של האויב: ${nextIntent.hebrewDescription}`);

    // Trigger next turn cards replenish
    startPlayerTurn(turn + 1, discardPile, hand, drawPile);
  };

  // Victory Resolution
  const triggerVictory = () => {
    setCombatOver(true);
    setVictoryState(true);
    addToLog("🏆 ניצחת בקרב! כל הכבוד, שלל רב ממתין לך.");

    // Gold reward scales with stage and elite status
    const isElite = nodeType === NodeType.ELITE;
    const isBoss = nodeType === NodeType.BOSS;
    const baseGold = isBoss ? 100 : isElite ? 45 : 18;
    const randomizedGold = Math.floor(Math.random() * 15) + baseGold;
    
    const xpReward = isBoss ? 200 : isElite ? 100 : 40;

    setGoldEarned(randomizedGold);
    setXpEarned(xpReward);

    // Generate Draft rewards (3 cards matched, 1 item drop chance)
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
    setCardLootOffers(shuffledCards.slice(0, 3));

    // Item chance (100% on Boss & Elite, 40% on normal monsters)
    const itemRoll = Math.random() * 100;
    const itemChanceThreshold = isBoss ? 100 : isElite ? 80 : 35;
    
    if (itemRoll <= itemChanceThreshold) {
      const validItems = ALL_ITEMS.filter((item) => {
        if (item.id.includes("wand") && hero.classType !== "mage") return false;
        if (item.id.includes("sword") && (hero.classType === "mage" || hero.classType === "cleric")) return false;
        if (item.id.includes("mace") && hero.classType !== "cleric") return false;
        if (item.id.includes("bow") && hero.classType !== "ranger") return false;
        return true;
      });
      const chosenItem = { ...validItems[Math.floor(Math.random() * validItems.length)], id: "loot_item_" + Date.now() };
      setItemLootOffers([chosenItem]);
    }
  };

  // Defeat Resolution
  const triggerDefeat = () => {
    setCombatOver(true);
    setVictoryState(false);
    addToLog("💀 הובסת בקרב! מד החיים שלך התרוקן לחלוטין ונפלת חלל.");
  };

  // Monitor monster and player HP for battle completion (guards against stale closures and simultaneous overkill)
  useEffect(() => {
    if (monster && monster.currentHp <= 0 && !combatOver) {
      triggerVictory();
    }
  }, [monster?.currentHp, combatOver]);

  useEffect(() => {
    if (playerHp <= 0 && !combatOver) {
      triggerDefeat();
    }
  }, [playerHp, combatOver]);

  const handleClaimVictoryRewards = () => {
    const lootedCards: Card[] = [];
    if (selectedLootCardIdx !== null && cardLootOffers[selectedLootCardIdx]) {
      lootedCards.push(cardLootOffers[selectedLootCardIdx]);
    }

    onVictory(goldEarned, lootedCards, itemLootOffers, playerHp, xpEarned);
    setLootClaimed(true);
  };

  if (!monster) return <div className="text-center text-slate-100 p-8">טוען קרב...</div>;

  return (
    <div className="h-screen max-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-hidden" dir="rtl">
      {/* Top Header info bar */}
      <div className="bg-slate-900 border-b border-slate-800 pr-4 pl-16 md:px-6 py-2 md:py-3 flex items-center justify-between z-10 text-xs text-slate-400 h-10 md:h-12 shrink-0">
        <div>
          <span>שלב {hero.stage} במסע • ⚔️ {nodeType === NodeType.BOSS ? "קרב בוס אפי" : nodeType === NodeType.ELITE ? "עילית אימתנית" : "קרב רגיל"}</span>
        </div>
        <div className="flex gap-4">
          <span className="font-mono text-amber-500 font-bold">חפיסה בשליפה: {drawPile.length} קלפים</span>
          <span className="font-mono text-slate-500 text-slate-400 font-bold">חבילת השלכה: {discardPile.length}</span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-2 flex flex-col justify-between overflow-hidden relative min-h-0 gap-2 md:gap-3">
        {/* Visual arena battlefield - Horizontal side-by-side layout for perfect viewport fitting */}
        <div className="grid grid-cols-2 gap-4 items-center justify-center py-1 shrink-0 h-auto">
          {/* Player character column */}
          <motion.div
            animate={playerShake ? { x: [0, -10, 10, -8, 8, 0] } : {}}
            className="flex flex-col items-center text-center space-y-1 relative"
          >
            {/* Player FCT List */}
            <div className="absolute top-0 pointer-events-none flex flex-col items-center gap-1.5 z-30" style={{ transform: "translateY(-45px)" }}>
              <AnimatePresence>
                {fctList.filter(f => f.isPlayer).map(f => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: -25, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className={`${f.color} md:text-sm text-xs font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]`}
                  >
                    {f.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Health indicators */}
            <div className="space-y-1 w-full max-w-[190px] md:max-w-xs bg-slate-900 p-2.5 border border-slate-800/80 rounded-xl relative min-h-[120px] md:min-h-[150px] flex flex-col justify-between shadow-xl">
              <div>
                <div className="text-right flex items-center justify-between text-[10px] md:text-xs">
                  {/* Hero class tag matching monster badge style */}
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[8px] md:text-[9px] uppercase rounded px-1.5 py-0.5 flex items-center gap-0.5">
                    גיבור: {hero.classType === "warrior" ? "לוחם פלדה" : hero.classType === "mage" ? "קוסם ארקיין" : hero.classType === "cleric" ? "כוהן קדוש" : hero.classType === "ranger" ? "קשת יער" : "נוכל רעלים"}
                  </span>

                  <div className="text-right">
                    <h4 className="font-bold text-white text-[11px] md:text-xs">{hero.hebrewName}</h4>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-red-400 text-[10px] md:text-xs mt-1 flex justify-between items-center" dir="rtl">
                  <span className="text-slate-500 text-[9px] md:text-[10px]">נקודות חיים</span>
                  <span dir="ltr" className="inline-block font-mono text-red-400">{playerHp} / {totalMaxHp} HP</span>
                </div>
                <div className="w-full bg-slate-850 rounded-full h-2.5 overflow-hidden border border-slate-950 mt-1">
                  <div
                     className="bg-red-500 h-full rounded-full transition-all duration-300"
                     style={{ width: `${Math.max(0, (playerHp / totalMaxHp) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                {/* Matches "צפי תור" block precisely for identical card height */}
                <div className="text-right text-[8px] md:text-[10px] text-slate-400 font-medium py-0.5 px-1 bg-slate-950/40 rounded mt-1">
                  סטטוס: תורך לשחק קלפים ומתקפות
                </div>

              {/* Status details icons */}
              <div className="flex justify-start gap-1 text-[8px] md:text-[10px] mt-1 font-mono flex-wrap">
                {playerBlock > 0 && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold">
                    <LucideIcon name="Shield" size={8} /> {playerBlock} שריון
                  </span>
                )}
                {playerStrength > 0 && (
                  <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold animate-pulse">
                    <LucideIcon name="ArrowUp" size={8} /> +{playerStrength} כוח
                  </span>
                )}
                {playerVulnerable > 0 && (
                  <span className="bg-purple-900/20 text-purple-300 border border-purple-500/30 px-1 py-0.5 rounded flex items-center gap-0.5 leading-none">
                    💔 {playerVulnerable} פגיע
                  </span>
                )}
              </div>
            </div>
          </div>
          </motion.div>

          {/* Enemy monster column */}
          <motion.div
            animate={monsterShake ? { x: [0, 10, -10, 8, -8, 0] } : {}}
            className="flex flex-col items-center text-center space-y-1 relative"
          >
            {/* Enemy FCT List */}
            <div className="absolute top-0 pointer-events-none flex flex-col items-center gap-1.5 z-30" style={{ transform: "translateY(-45px)" }}>
              <AnimatePresence>
                {fctList.filter(f => !f.isPlayer).map(f => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: -25, scale: 1.2 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className={`${f.color} md:text-sm text-xs font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]`}
                  >
                    {f.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Monster Health bar info */}
            <div className="space-y-1 w-full max-w-[190px] md:max-w-xs bg-slate-900 p-2.5 border border-slate-800/80 rounded-xl relative min-h-[120px] md:min-h-[150px] flex flex-col justify-between shadow-xl">
              <div>
                <div className="text-right flex items-center justify-between text-[10px] md:text-xs">
                  {/* Intent prediction badge */}
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-[8px] md:text-[9px] uppercase rounded px-1.5 py-0.5 flex items-center gap-0.5">
                    כוונות: <LucideIcon name={monster.intent.type === "ATTACK" ? "Swords" : monster.intent.type === "DEFEND" ? "Shield" : "Activity"} size={8} />
                    {monster.intent.value !== undefined ? ` ${monster.intent.value}` : null}
                  </span>

                  <div className="text-right">
                    <h4 className="font-bold text-white text-[11px] md:text-xs">{monster.hebrewName}</h4>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-red-400 text-[10px] md:text-xs mt-1 flex justify-between items-center" dir="rtl">
                  <span className="text-slate-500 text-[9px] md:text-[10px]">נקודות חיים</span>
                  <span dir="ltr" className="inline-block font-mono text-red-400">{monster.currentHp} / {monster.maxHp} HP</span>
                </div>
                <div className="w-full bg-slate-850 rounded-full h-2.5 overflow-hidden border border-slate-950 mt-1">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(0, (monster.currentHp / monster.maxHp) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                {/* Description of active target's intent */}
                <div className="text-right text-[8px] md:text-[10px] text-slate-400 font-medium py-0.5 px-1 bg-slate-950/40 rounded mt-1">
                  צפי תור: {monster.intent.hebrewDescription}
                </div>

              {/* Status details monster icons */}
              <div className="flex justify-start gap-1 text-[8px] md:text-[10px] mt-1 font-mono flex-wrap">
                {monster.block > 0 && (
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold">
                    🛡️ {monster.block} הגנה
                  </span>
                )}
                {monsterPoison > 0 && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold animate-pulse">
                    🧪 {monsterPoison} רעל
                  </span>
                )}
                {monsterVulnerable > 0 && (
                  <span className="bg-purple-900/20 text-purple-300 border border-purple-500/30 px-1 py-0.5 rounded flex items-center gap-0.5 font-bold leading-none">
                    💔 {monsterVulnerable} פגיע
                  </span>
                )}
              </div>
            </div>
          </div>
          </motion.div>
        </div>

        {/* Hand Cards controls representing inventory actions */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0 gap-1.5 relative">
          <AnimatePresence>
            {manaWarning && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 15 }}
                className="absolute bottom-16 md:bottom-28 left-1/2 -translate-x-1/2 z-50 bg-red-600/95 border border-red-500/80 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl text-[11px] md:text-sm whitespace-nowrap"
              >
                <LucideIcon name="AlertTriangle" size={14} className="text-white animate-pulse" />
                <span>שגיאה: אין מספיק מנה להטלת קלף זה! ⚠️</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between flex-row-reverse pb-1 border-b border-slate-850 shrink-0">
            {/* Mana indicator */}
            <div className="flex items-center gap-2 flex-row-reverse">
              <span className="text-[10px] md:text-xs text-slate-400">מנה / אנרגיה זמינה:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-xs md:text-sm">
                <LucideIcon name="Zap" size={12} className="text-blue-400 animate-pulse" />
                <span>{energy} / {totalMaxMana}</span>
              </div>
            </div>

            <button
              onClick={handleEndTurn}
              disabled={combatOver}
              className={`px-4 py-1.5 text-slate-100 font-bold rounded-xl text-[10px] md:text-xs transition border cursor-pointer ${
                combatOver
                  ? "bg-slate-900 cursor-not-allowed text-slate-500 border-slate-800"
                  : "bg-slate-800 hover:bg-slate-750 border-slate-700 hover:text-white"
              }`}
            >
              סיים תור ⌛
            </button>
          </div>

          {/* Cards Tray (horizontal scroll scrollbar layout) */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden px-2 py-1 flex items-center justify-start md:justify-center min-h-[145px] md:min-h-[175px] max-w-full">
            <div className="flex flex-row flex-nowrap gap-2 md:gap-3.5 items-center justify-start md:justify-center mx-auto py-1">
              <AnimatePresence>
                {hand.map((card, idx) => {
                  const cardCostValid = energy >= card.cost;
                  const cardDmg = card.damage !== undefined ? card.damage + playerStrength : undefined;
                  const cardBlk = card.block !== undefined ? card.block : undefined;

                  return (
                    <motion.div
                      key={card.id + "_" + idx}
                      initial={{ opacity: 0, y: 25, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: hoveredCardIdx === idx ? 1.05 : 1 }}
                      exit={{ opacity: 0, y: -15, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={() => setHoveredCardIdx(idx)}
                      onMouseLeave={() => setHoveredCardIdx(null)}
                      onClick={() => {
                        if (cardCostValid) {
                           handlePlayCard(card, idx);
                        }
                      }}
                      className={`relative w-24 h-36 md:w-28 md:h-40 bg-slate-900 border rounded-xl p-2 flex flex-col justify-between transition-all duration-200 relative select-none shrink-0 ${
                        cardCostValid
                          ? "border-slate-800 hover:border-amber-500 cursor-pointer shadow-md hover:shadow-amber-500/5 hover:-translate-y-2"
                          : "border-slate-950 bg-slate-900/50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {/* Mana cost absolute badge top left */}
                      <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px]">
                        {card.cost}
                      </div>

                      <div className="pt-1.5 flex flex-col items-center justify-center text-center">
                        <CardPortrait cardId={card.id} />
                        <h4 className="font-bold text-[10px] md:text-[11px] text-white leading-none line-clamp-1 mt-1">{card.hebrewName}</h4>
                        <span className="text-[7px] text-slate-500 uppercase mt-0.5 tracking-wide">
                          {card.type === CardType.ATTACK ? "מתקפה" : card.type === CardType.SKILL ? "מיומנות" : "סגול"}
                        </span>
                      </div>

                      <p className="text-[8px] md:text-[9.5px] text-slate-400 text-center leading-tight font-medium line-clamp-2 md:line-clamp-3">
                        {card.hebrewDescription}
                      </p>

                      {/* Stats overlay values */}
                      <div className="border-t border-slate-850/60 pt-1 flex justify-center gap-1.5 text-[8px] md:text-[9px] font-mono leading-none shrink-0">
                        {cardDmg !== undefined && (
                          <span className="text-orange-450 font-bold flex items-center gap-0.5">
                            {cardDmg}⚔️
                          </span>
                        )}
                        {cardBlk !== undefined && (
                          <span className="text-blue-450 font-bold flex items-center gap-0.5">
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
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {hand.length === 0 && (
                <div className="text-slate-600 text-[10px] md:text-xs font-semibold py-4 bg-slate-950/20 border border-slate-900 border-dashed w-full text-center rounded-xl">
                  אין קלפים ביד הנוכחית. סיים תור כדי לשלוף קלפים חדשים לחפיסה.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-time battle feed history log (Tucked BELOW skills and hand as requested!) */}
        <div className="bg-slate-950/60 border border-slate-900 p-2 rounded-xl text-center text-[10px] md:text-xs text-slate-400 max-h-[60px] overflow-y-auto mt-2 mb-1 font-mono leading-snug space-y-0.5 shrink-0 w-full">
          {combatLog.length === 0 ? (
            <span className="text-slate-600">אין פקודות קרב שבוצעו עדיין.</span>
          ) : (
            combatLog.slice(0, 2).map((log, idx) => (
              <p key={idx} className={idx === 0 ? "text-amber-300 font-semibold" : "text-slate-550"}>
                {log}
              </p>
            ))
          )}
        </div>
      </div>

      {/* --- OVERLAYS: Victory or Defeat overlays --- */}
      <AnimatePresence>
        {combatOver && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 overflow-y-auto flex items-start md:items-center justify-center p-3 py-6 md:p-4 md:py-12" dir="rtl">
            {victoryState ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl w-full max-w-lg shadow-2xl text-center space-y-4 md:space-y-5 my-auto"
              >
                <div>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-bounce mb-2">
                    <LucideIcon name="Award" size={24} className="md:w-8 md:h-8" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-black text-amber-400">ניצחון גדול בממלכה!</h2>
                  <p className="text-slate-400 text-[10px] md:text-xs mt-1">מפלצת הובסה בהצלחה. השטח כעת בטוח לחקור, אסוף את השלל:</p>
                </div>

                {/* Gained stats summary */}
                <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-sm mx-auto">
                  <div className="bg-slate-950 border border-slate-850 p-2 md:p-3 rounded-xl">
                    <span className="text-slate-500 text-[9px] md:text-[10px] block relative">מטבעות זהב שנמצאו:</span>
                    <span className="font-bold text-amber-500 text-sm md:text-lg font-mono flex items-center justify-center gap-1">
                      {goldEarned} <LucideIcon name="Coins" size={12} className="md:w-3.5 md:h-3.5" />
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-2 md:p-3 rounded-xl">
                    <span className="text-slate-500 text-[9px] md:text-[10px] block">נקודות ניסיון (XP):</span>
                    <span className="font-bold text-blue-400 text-sm md:text-lg font-mono">
                      +{xpEarned} XP
                    </span>
                  </div>
                </div>

                {/* Items looted? */}
                {itemLootOffers.length > 0 && (
                  <div className="bg-slate-950 p-2.5 md:p-3 border border-slate-850/80 rounded-xl space-y-1.5">
                    <span className="text-[9px] md:text-[10px] font-bold text-amber-500/80 uppercase tracking-widest block">חפץ חדש שנמצא בשטח!</span>
                    {itemLootOffers.map((item, idx) => (
                      <div key={idx} className={`p-2 rounded border inline-block max-w-xs text-right text-xs ${getRarityBg(item.rarity)}`}>
                        <h4 className="font-bold text-white flex items-center gap-1 justify-end text-xs">
                          {item.hebrewName}
                          <LucideIcon name={item.icon} size={12} className="text-amber-400" />
                        </h4>
                        <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5">{item.hebrewDescription}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cards chosen drafting with portraits! */}
                <div className="space-y-1.5 border-t border-slate-850 pt-3">
                  <h4 className="text-[11px] md:text-xs font-bold text-slate-350">בחר קלף אחד נוסף להוסיף לחפיסה</h4>
                  <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                    {cardLootOffers.map((card, idx) => (
                      <div
                        key={card.id + "_" + idx}
                        onClick={() => setSelectedLootCardIdx(selectedLootCardIdx === idx ? null : idx)}
                        className={`p-1.5 md:p-2 rounded-lg border text-center cursor-pointer transition flex flex-col justify-between ${
                          selectedLootCardIdx === idx
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-slate-800 bg-slate-950 hover:border-slate-705"
                        }`}
                      >
                        <CardPortrait cardId={card.id} />
                        <h5 className="font-bold text-[9px] md:text-[10px] text-white truncate mt-1 leading-tight">{card.hebrewName}</h5>
                        <p className="text-[8px] md:text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-none">{card.hebrewDescription}</p>
                        <div className="text-[8px] md:text-[10px] text-blue-400 mt-1 font-semibold font-mono leading-none">עלות: {card.cost}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleClaimVictoryRewards}
                  className="w-full py-2.5 md:py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs md:text-sm rounded-xl transition cursor-pointer"
                >
                  {selectedLootCardIdx !== null ? "אסוף קלף ואת השלל" : "המשך למפה בלבד (אסוף זהב וחפצים)"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center space-y-6"
              >
                <div>
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto animate-pulse mb-3">
                    💀
                  </div>
                  <h2 className="text-2xl font-black text-red-500">הובסת בקרב...</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    נפלת חלל מול חיות החושך. אל תדאג, אתה שומר שדרוג של החפצים שלך ושל הזהב שלך, אבל עליך להתחיל את המסע מחדש בנחישות גדולה יותר!
                  </p>
                </div>

                <button
                  onClick={onDefeat}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl transition cursor-pointer"
                >
                  נסה שוב! לקראת ניצחון
                </button>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
