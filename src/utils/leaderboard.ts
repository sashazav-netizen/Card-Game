export interface LeaderboardEntry {
  id: string;
  heroName: string;
  classType: string;
  level: number;
  gold: number;
  stageReached: number;
  victory: boolean;
  date: string;
}

const LEADERBOARD_KEY = "card_quest_leaderboard_v1";

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(LEADERBOARD_KEY);
    if (!saved) {
      // Seed some legendary historic heroes for instant fantasy immersion and competitive feel!
      const defaultEntries: LeaderboardEntry[] = [
        {
          id: "seed_1",
          heroName: "גאלדור עין-הנשר",
          classType: "ranger",
          level: 8,
          gold: 320,
          stageReached: 10,
          victory: true,
          date: "15/06/2026",
        },
        {
          id: "seed_2",
          heroName: "אלפרד הזועם",
          classType: "warrior",
          level: 6,
          gold: 180,
          stageReached: 8,
          victory: false,
          date: "14/06/2026",
        },
        {
          id: "seed_3",
          heroName: "ליידי סיביל הקדושה",
          classType: "cleric",
          level: 9,
          gold: 440,
          stageReached: 10,
          victory: true,
          date: "12/06/2026",
        },
        {
          id: "seed_4",
          heroName: "מורדרק לוחש החושך",
          classType: "mage",
          level: 5,
          gold: 90,
          stageReached: 5,
          victory: false,
          date: "10/06/2026",
        },
      ];
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(defaultEntries));
      return defaultEntries;
    }
    return JSON.parse(saved) as LeaderboardEntry[];
  } catch (e) {
    console.error("Failed to parse leaderboard:", e);
    return [];
  }
}

export function addLeaderboardEntry(heroName: string, classType: string, level: number, gold: number, stageReached: number, victory: boolean): LeaderboardEntry[] {
  try {
    const current = getLeaderboard();
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    const newEntry: LeaderboardEntry = {
      id: "entry_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      heroName: heroName.trim() || "גיבור אלמוני",
      classType,
      level,
      gold,
      stageReached,
      victory,
      date: dateStr,
    };
    
    // Keep entries unique, sorted by victory, class level, stage reached, and gold
    const updated = [newEntry, ...current].sort((a, b) => {
      if (a.victory !== b.victory) {
        return a.victory ? -1 : 1;
      }
      if (b.stageReached !== a.stageReached) {
        return b.stageReached - a.stageReached;
      }
      if (b.level !== a.level) {
        return b.level - a.level;
      }
      return b.gold - a.gold;
    });

    // Limit to top 20 scores
    const sliced = updated.slice(0, 20);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(sliced));
    return sliced;
  } catch (e) {
    console.error("Failed to add score record:", e);
    return getLeaderboard();
  }
}

export function resetLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
    return getLeaderboard();
  } catch (e) {
    console.error("Failed to reset leaderboard:", e);
    return [];
  }
}

