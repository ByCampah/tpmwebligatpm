-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MatchStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "matchTime" INTEGER NOT NULL DEFAULT 0,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "fouls" INTEGER NOT NULL DEFAULT 0,
    "fouled" INTEGER NOT NULL DEFAULT 0,
    "offsides" INTEGER NOT NULL DEFAULT 0,
    "ballLosses" INTEGER NOT NULL DEFAULT 0,
    "tacklesWon" INTEGER NOT NULL DEFAULT 0,
    "passesMade" INTEGER NOT NULL DEFAULT 0,
    "passesTotal" INTEGER NOT NULL DEFAULT 0,
    "slidingMade" INTEGER NOT NULL DEFAULT 0,
    "slidingTotal" INTEGER NOT NULL DEFAULT 0,
    "shotsMade" INTEGER NOT NULL DEFAULT 0,
    "shotsTotal" INTEGER NOT NULL DEFAULT 0,
    "headersMade" INTEGER NOT NULL DEFAULT 0,
    "headersTotal" INTEGER NOT NULL DEFAULT 0,
    "gkTime" INTEGER NOT NULL DEFAULT 0,
    "savesMade" INTEGER NOT NULL DEFAULT 0,
    "savesTotal" INTEGER NOT NULL DEFAULT 0,
    "cleanSheet" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "MatchStat_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MatchStat_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MatchStat" ("assists", "ballLosses", "fouled", "fouls", "gkTime", "goals", "headersMade", "headersTotal", "id", "matchId", "matchTime", "offsides", "passesMade", "passesTotal", "playerId", "savesMade", "savesTotal", "shotsMade", "shotsTotal", "slidingMade", "slidingTotal", "tacklesWon") SELECT "assists", "ballLosses", "fouled", "fouls", "gkTime", "goals", "headersMade", "headersTotal", "id", "matchId", "matchTime", "offsides", "passesMade", "passesTotal", "playerId", "savesMade", "savesTotal", "shotsMade", "shotsTotal", "slidingMade", "slidingTotal", "tacklesWon" FROM "MatchStat";
DROP TABLE "MatchStat";
ALTER TABLE "new_MatchStat" RENAME TO "MatchStat";
CREATE UNIQUE INDEX "MatchStat_matchId_playerId_key" ON "MatchStat"("matchId", "playerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
