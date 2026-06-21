import React, { useState, useEffect } from "react";
import { Hero, Item, ItemSlot, Card, NodeType, ItemRarity } from "./types";
import { HeroSelection } from "./components/HeroSelection";
import { AdventureMap } from "./components/AdventureMap";
import { CombatScreen } from "./components/CombatScreen";
import { ShopScreen } from "./components/ShopScreen";
import { CampfireScreen } from "./components/CampfireScreen";
import { ChestScreen } from "./components/ChestScreen";
import { InventoryPanel } from "./components/InventoryPanel";
import { STARTING_DECKS, INITIAL_HEROES } from "./data/gameData";
import { getMaxHpBonus, getUpgradeIncrement, getStageNodeFor } from "./utils/gameHelpers";
import { addLeaderboardEntry } from "./utils/leaderboard";
import { gameAudio } from "./utils/audioEngine";
import { LucideIcon } from "./components/LucideIcon";
import { motion, AnimatePresence } from "motion/react";

const LOCAL_STORAGE_KEY = "card_quest_adventure_hero_save_v1";

export default function App() {
  const [hero, setHero] = useState<Hero | null>(null);
  const [screen, setScreen] = useState<"class_selection" | "map" | "combat" | "shop" | "campfire" | "chest">("class_selection");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState<string | null>(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [appAlertMessage, setAppAlertMessage] = useState<string | null>(null);
  const [showVictoryLap, setShowVictoryLap] = useState(true);

  useEffect(() => {
    setMusicPlaying(gameAudio.getIsPlaying());
  }, []);

  const toggleMusic = () => {
    const nextState = gameAudio.toggle();
    setMusicPlaying(nextState);
  };

  const LIST_LOCAL_STORAGE_KEY = "card_quest_adventure_heroes_list_v1";
  const [savedHeroes, setSavedHeroes] = useState<Hero[]>([]);

  // 1. Load active save and saved list from localStorage on startup
  useEffect(() => {
    let listSavedHeroes: Hero[] = [];
    const listSaved = localStorage.getItem(LIST_LOCAL_STORAGE_KEY);
    if (listSaved) {
      try {
        listSavedHeroes = JSON.parse(listSaved) as Hero[];
        setSavedHeroes(listSavedHeroes);
      } catch (e) {
        console.error("Error loading heroes list:", e);
      }
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Hero;
        
        // Ensure instanceId is present
        if (!parsed.instanceId) {
          parsed.instanceId = "active_h_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        }
        
        setHero(parsed);
        
        // Ensure it is in the list of saved heroes so the user can see/manage it
        const existingIdx = listSavedHeroes.findIndex((h) => h.instanceId === parsed.instanceId);
        let updatedList = [...listSavedHeroes];
        if (existingIdx !== -1) {
          updatedList[existingIdx] = parsed;
        } else {
          updatedList.unshift(parsed);
        }
        
        setSavedHeroes(updatedList);
        localStorage.setItem(LIST_LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        
        setScreen("map");
      } catch (e) {
        console.error("Error loading local storage hero data:", e);
      }
    }
  }, []);

  // 2. Auto-save hero progress when stats or stages change
  const saveHeroState = (updatedHero: Hero | null) => {
    // If we are wiping/resetting the current hero
    if (!updatedHero) {
      if (hero && hero.instanceId) {
        setSavedHeroes((prev) => {
          const newList = prev.filter((h) => h.instanceId !== hero.instanceId);
          localStorage.setItem(LIST_LOCAL_STORAGE_KEY, JSON.stringify(newList));
          return newList;
        });
      }
      setHero(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      // Ensure instanceId is present
      if (!updatedHero.instanceId) {
        updatedHero.instanceId = "active_h_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      }
      setHero(updatedHero);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHero));

      // Sync with list of saves
      setSavedHeroes((prev) => {
        const existingIdx = prev.findIndex((h) => h.instanceId === updatedHero.instanceId);
        let newList = [...prev];
        if (existingIdx !== -1) {
          newList[existingIdx] = updatedHero;
        } else {
          newList.unshift(updatedHero);
        }
        localStorage.setItem(LIST_LOCAL_STORAGE_KEY, JSON.stringify(newList));
        return newList;
      });
    }
  };

  // Delete saved hero completely
  const handleDeleteSavedHero = (instanceId: string) => {
    // If deleted hero is current active, clear current active Hero state
    if (hero && hero.instanceId === instanceId) {
      setHero(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setScreen("class_selection");
    }

    setSavedHeroes((prev) => {
      const newList = prev.filter((h) => h.instanceId !== instanceId);
      localStorage.setItem(LIST_LOCAL_STORAGE_KEY, JSON.stringify(newList));
      return newList;
    });
  };

  // Continue with a saved character
  const handleContinueHero = (hInstance: Hero) => {
    setHero(hInstance);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hInstance));
    setScreen("map");
  };

  // Select Hero Class and generate initial deck & empty slots
  const handleSelectHero = (heroClassId: string, customName?: string) => {
    const template = INITIAL_HEROES.find((h) => h.id === heroClassId);
    if (!template) return;

    const newInstId = "active_h_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

    const initialHeroState: Hero = {
      ...template,
      instanceId: newInstId,
      hebrewName: customName && customName.trim() ? customName.trim() : template.hebrewName,
      currentHp: template.maxHp,
      deck: STARTING_DECKS[heroClassId as keyof typeof STARTING_DECKS] || [],
      equippedItems: {
        [ItemSlot.WEAPON]: null,
        [ItemSlot.ARMOR]: null,
        [ItemSlot.ACCESSORY]: null,
      },
      inventory: [], // Empty backpack bags to start
    };

    saveHeroState(initialHeroState);
    setShowVictoryLap(true);
    setScreen("map");
  };

  // Node navigation
  const handleEnterNode = (nodeIndex: number) => {
    if (!hero) return;
    
    const node = getStageNodeFor(hero.stage);
    switch (node.type) {
      case NodeType.CHEST:
        setScreen("chest");
        break;
      case NodeType.SHOP:
        setScreen("shop");
        break;
      case NodeType.CAMPFIRE:
        setScreen("campfire");
        break;
      case NodeType.COMBAT:
      case NodeType.ELITE:
      case NodeType.BOSS:
      default:
        setScreen("combat");
        break;
    }
  };

  // Equip backpack item to slotted active deck boosts
  const handleEquipItem = (item: Item) => {
    if (!hero) return;

    const slot = item.slot;
    const currentlyEquipped = hero.equippedItems[slot];
    
    // Filter equipped item out of inventory, inject current slot item to inventory if exists
    let newInventory = hero.inventory.filter((i) => i.id !== item.id);
    if (currentlyEquipped) {
      newInventory.push(currentlyEquipped);
    }

    const updatedHero: Hero = {
      ...hero,
      equippedItems: {
        ...hero.equippedItems,
        [slot]: item,
      },
      inventory: newInventory,
    };

    // Make sure HP doesn't overflow
    const maxHpBonus = getMaxHpBonus(updatedHero);
    const totalMaxHp = updatedHero.maxHp + maxHpBonus;
    if (updatedHero.currentHp > totalMaxHp) {
      updatedHero.currentHp = totalMaxHp;
    }

    saveHeroState(updatedHero);
  };

  // Unequip item
  const handleUnequipItem = (slot: ItemSlot) => {
    if (!hero) return;

    const item = hero.equippedItems[slot];
    if (!item) return;

    if (hero.inventory.length >= 10) {
      setAppAlertMessage("תיק הגב שלך מלא! פנה מקום לפני השלכת או החלפת חפצים.");
      return;
    }

    const updatedEquipped = { ...hero.equippedItems, [slot]: null };
    const updatedHero: Hero = {
      ...hero,
      equippedItems: updatedEquipped,
      inventory: [...hero.inventory, item],
    };

    // Recalculate maxHp safely
    const maxHpBonus = getMaxHpBonus(updatedHero);
    const totalMaxHp = updatedHero.maxHp + maxHpBonus;
    if (updatedHero.currentHp > totalMaxHp) {
      updatedHero.currentHp = totalMaxHp;
    }

    saveHeroState(updatedHero);
  };

  // Upgrade item in bag using gold
  const handleUpgradeItem = (item: Item) => {
    if (!hero || hero.gold < item.upgradeCost) return;

    const upgradeIncrements = getUpgradeIncrement(item);
    
    const upgradedItem: Item = {
      ...item,
      level: item.level + 1,
      hpBonus: item.hpBonus + upgradeIncrements.hpBonus,
      damageBonus: item.damageBonus + upgradeIncrements.damageBonus,
      blockBonus: item.blockBonus + upgradeIncrements.blockBonus,
      upgradeCost: Math.ceil(item.upgradeCost * 1.5),
      goldValue: Math.ceil(item.goldValue * 1.3),
    };

    // Swap upgraded item inside inventory
    const updatedInventory = hero.inventory.map((invItem) =>
      invItem.id === item.id ? upgradedItem : invItem
    );

    const updatedHero: Hero = {
      ...hero,
      gold: hero.gold - item.upgradeCost,
      inventory: updatedInventory,
    };

    saveHeroState(updatedHero);
  };

  // Sell Item to Merchant
  const handleSellItem = (item: Item) => {
    if (!hero) return;

    const updatedHero: Hero = {
      ...hero,
      gold: hero.gold + item.goldValue,
      inventory: hero.inventory.filter((invItem) => invItem.id !== item.id),
    };

    saveHeroState(updatedHero);
  };

  // Remove Card from Deck manually from inside inventory screen
  const handleRemoveCard = (cardIndex: number) => {
    if (!hero) return;

    const updatedDeck = hero.deck.filter((_, idx) => idx !== cardIndex);
    const updatedHero: Hero = {
      ...hero,
      deck: updatedDeck,
    };

    saveHeroState(updatedHero);
  };

  // Handle combat victory
  const handleCombatResultVictory = (
    goldReward: number,
    lootedCards: Card[],
    lootedItems: Item[],
    newHp: number,
    xpReward: number
  ) => {
    if (!hero) return;

    let updatedGold = hero.gold + goldReward;
    let updatedDeck = [...hero.deck, ...lootedCards];
    let updatedInventory = [...hero.inventory, ...lootedItems];
    
    // limit bag sizes to 10
    if (updatedInventory.length > 10) {
      updatedInventory = updatedInventory.slice(0, 10);
    }

    // Accumulate XP and Level Up!
    let updatedXp = hero.xp + xpReward;
    let updatedLevel = hero.level;
    let rawMaxHp = hero.maxHp;
    let message: string | null = null;

    const nextLevelThreshold = updatedLevel * 105;
    if (updatedXp >= nextLevelThreshold) {
      updatedXp -= nextLevelThreshold;
      updatedLevel += 1;
      rawMaxHp += 12; // Level increase grants +12 base maxHp
      newHp = rawMaxHp + getMaxHpBonus(hero); // heal to full on level up
      message = `🎉 עלית לרמה ${updatedLevel}! החיים המקסימליים שלך גדלו והתרפאת לחלוטין!`;
    }

    const updatedHeroState: Hero = {
      ...hero,
      currentHp: newHp,
      maxHp: rawMaxHp,
      gold: updatedGold,
      deck: updatedDeck,
      inventory: updatedInventory,
      xp: updatedXp,
      level: updatedLevel,
      stage: hero.stage + 1, // Advance stages
    };

    saveHeroState(updatedHeroState);
    
    if (message) {
      setLevelUpMessage(message);
    }
    
    // Add to high scores every time they beat a major boss at stage 10, 20, 30, etc.
    if (getStageNodeFor(hero.stage).type === NodeType.BOSS) {
      addLeaderboardEntry(hero.hebrewName, hero.classType, updatedLevel, updatedGold, hero.stage, true);
    }
    setScreen("map");
  };

  // Return to city after loss
  const handleCombatDefeatReset = () => {
    if (!hero) return;

    // Log the run to the high scores table before wiping the stage back to 1
    addLeaderboardEntry(hero.hebrewName, hero.classType, hero.level, hero.gold, hero.stage, false);

    const hpBonus = getMaxHpBonus(hero);
    const halfMaxHp = Math.ceil((hero.maxHp + hpBonus) * 0.5);

    // Roguelite return parameters: restore to half max HP, restart stages from stage 1, keep all gold/items so they can upgrade and win!
    const revivedHero: Hero = {
      ...hero,
      currentHp: halfMaxHp,
      stage: 1, // Reset runs
    };

    saveHeroState(revivedHero);
    setScreen("map");
  };

  // Campfire heals
  const handleCampfireRest = (healAmt: number) => {
    if (!hero) return;

    const totalMax = hero.maxHp + getMaxHpBonus(hero);
    const finalHp = Math.min(totalMax, hero.currentHp + healAmt);

    const updated: Hero = {
      ...hero,
      currentHp: finalHp,
      stage: hero.stage + 1,
    };

    saveHeroState(updated);
    setScreen("map");
  };

  // Campfire removes card
  const handleCampfireRemoveCard = (cardId: string) => {
    if (!hero) return;

    // Filter first matching card by ID out of deck
    let cardRemovedIdx = hero.deck.findIndex((c) => c.id === cardId);
    let updatedDeck = [...hero.deck];
    if (cardRemovedIdx !== -1) {
      updatedDeck.splice(cardRemovedIdx, 1);
    }

    const updated: Hero = {
      ...hero,
      deck: updatedDeck,
      stage: hero.stage + 1,
    };

    saveHeroState(updated);
    setScreen("map");
  };

  // Chest looting
  const handleChestClaim = (goldReward: number, lootedCards: Card[], lootedItems: Item[]) => {
    if (!hero) return;

    let updatedInventory = [...hero.inventory, ...lootedItems];
    if (updatedInventory.length > 10) {
      updatedInventory = updatedInventory.slice(0, 10);
    }

    const updated: Hero = {
      ...hero,
      gold: hero.gold + goldReward,
      deck: [...hero.deck, ...lootedCards],
      inventory: updatedInventory,
      stage: hero.stage + 1,
    };

    saveHeroState(updated);
    setScreen("map");
  };

  // Merchant transactions
  const handleBuyCard = (card: Card, cost: number) => {
    if (!hero) return;
    const updated: Hero = {
      ...hero,
      gold: hero.gold - cost,
      deck: [...hero.deck, card],
    };
    saveHeroState(updated);
  };

  const handleBuyItem = (item: Item, cost: number) => {
    if (!hero) return;
    const updated: Hero = {
      ...hero,
      gold: hero.gold - cost,
      inventory: [...hero.inventory, item],
    };
    saveHeroState(updated);
  };

  const handleHealPotion = (restoreAmount: number, cost: number) => {
    if (!hero) return;
    const totalMax = hero.maxHp + getMaxHpBonus(hero);
    const updated: Hero = {
      ...hero,
      gold: hero.gold - cost,
      currentHp: Math.min(totalMax, hero.currentHp + restoreAmount),
    };
    saveHeroState(updated);
  };

  // Restart character choice selector
  const handleResetGame = () => {
    setConfirmResetOpen(true);
  };

  // Endless mode bypasses old stage 10 block
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 select-none relative">
      {/* Dynamic View Routers */}
      {screen === "class_selection" && (
        <HeroSelection
          onSelectHero={handleSelectHero}
          savedHeroes={savedHeroes}
          onContinueHero={handleContinueHero}
          onDeleteSavedHero={handleDeleteSavedHero}
        />
      )}

      {screen === "map" && hero && (
        <AdventureMap
          hero={hero}
          onEnterNode={handleEnterNode}
          onOpenInventory={() => setInventoryOpen(true)}
          onResetGame={handleResetGame}
          onReturnToSelection={() => setScreen("class_selection")}
        />
      )}

      {screen === "combat" && hero && (
        <CombatScreen
          hero={hero}
          nodeType={getStageNodeFor(hero.stage).type}
          onVictory={handleCombatResultVictory}
          onDefeat={handleCombatDefeatReset}
        />
      )}

      {screen === "shop" && hero && (
        <ShopScreen
          hero={hero}
          onBuyCard={handleBuyCard}
          onBuyItem={handleBuyItem}
          onHealPotion={handleHealPotion}
          onLeave={() => {
            const updated = { ...hero, stage: hero.stage + 1 };
            saveHeroState(updated);
            setScreen("map");
          }}
        />
      )}

      {screen === "campfire" && hero && (
        <CampfireScreen
          hero={hero}
          onRest={handleCampfireRest}
          onRemoveCard={handleCampfireRemoveCard}
          onSkip={() => {
            const updated = { ...hero, stage: hero.stage + 1 };
            saveHeroState(updated);
            setScreen("map");
          }}
        />
      )}

      {screen === "chest" && hero && (
        <ChestScreen hero={hero} onClaimLoot={handleChestClaim} />
      )}

      {/* Backpack inventory panel overlay */}
      {hero && (
        <InventoryPanel
          hero={hero}
          isOpen={inventoryOpen}
          onClose={() => setInventoryOpen(false)}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onUpgradeItem={handleUpgradeItem}
          onSellItem={handleSellItem}
          onRemoveCard={handleRemoveCard}
        />
      )}

      {/* Level-Up Modal message notification */}
      <AnimatePresence>
        {levelUpMessage && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border-2 border-amber-500 rounded-2xl p-6 max-w-sm w-full text-center space-y-4"
              dir="rtl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-bounce">
                <LucideIcon name="Sparkles" size={30} />
              </div>
              <h3 className="text-xl font-bold text-amber-400">עלית רמה! 🎉</h3>
              <p className="text-xs text-slate-300 leading-relaxed pr-1">
                {levelUpMessage}
              </p>
              <button
                onClick={() => setLevelUpMessage(null)}
                className="w-full py-2 bg-amber-550 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl transition"
              >
                יששש! המשך בהרפתקה
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Reset Modal */}
      <AnimatePresence>
        {confirmResetOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
              dir="rtl"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mx-auto">
                <LucideIcon name="RotateCcw" size={30} />
              </div>
              <h3 className="text-xl font-bold text-white">אתחול והתחלה מחדש ⚔️</h3>
              <p className="text-xs text-slate-300 leading-relaxed pr-1">
                האם אתה בטוח שברצונך להתחיל הכל מחדש? כל ההתקדמות, רמת הגיבור, הקלפים והחפצים המשודרגים שבידיך יימחקו לצמיתות ולא ניתן יהיה לשחזרם.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    saveHeroState(null);
                    setScreen("class_selection");
                    setConfirmResetOpen(false);
                  }}
                  className="flex-1 py-2 bg-red-650 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl transition cursor-pointer"
                >
                  כן, אפס הכל
                </button>
                <button
                  onClick={() => setConfirmResetOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl transition cursor-pointer"
                >
                  ביטול
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Alert/Warning Notification Modal */}
      <AnimatePresence>
        {appAlertMessage && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl"
              dir="rtl"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-pulse">
                <LucideIcon name="AlertCircle" size={30} />
              </div>
              <h3 className="text-xl font-bold text-white">התרעת ציוד</h3>
              <p className="text-xs text-slate-300 leading-relaxed pr-1">
                {appAlertMessage}
              </p>
              <button
                onClick={() => setAppAlertMessage(null)}
                className="w-full py-2 bg-slate-850 hover:bg-amber-500 hover:text-slate-950 text-white font-black text-sm rounded-xl transition cursor-pointer"
              >
                הבנתי
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating high-fidelity RPG music button */}
      <button
        onClick={toggleMusic}
        className="fixed top-3 left-3 md:top-4 md:left-4 z-50 p-2 md:px-3 md:py-2 rounded-full md:rounded-xl bg-slate-900/95 border border-slate-800 hover:border-amber-400 text-slate-300 hover:text-amber-400 shadow-xl flex items-center gap-2 cursor-pointer text-xs font-bold transition-all backdrop-blur-sm shadow-amber-500/2 font-sans"
        title="מוזיקת רקע"
      >
        <LucideIcon name={musicPlaying ? "Volume2" : "VolumeX"} size={14} className={musicPlaying ? "text-amber-400 animate-pulse" : "text-slate-500"} />
        <span className="hidden md:inline leading-none text-[10px] select-none">{musicPlaying ? "מוזיקת רקע פעילה" : "מוזיקה כבויה"}</span>
      </button>
    </div>
  );
}
