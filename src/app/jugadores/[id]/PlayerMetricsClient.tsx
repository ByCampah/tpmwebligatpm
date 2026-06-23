"use client";

import { useState, useEffect } from "react";

export default function PlayerMetricsClient({ matchStats }: { matchStats: any[] }) {
  // Get unique categories from stats
  const categoriesMap = new Map();
  matchStats.forEach(stat => {
    const catName = stat.categoryName || "Sin Categoría";
    categoriesMap.set(catName, true);
  });
  const categories = Array.from(categoriesMap.keys());

  // Try to find "Primera División" or something similar for default, else "all"
  const defaultCat = categories.find(c => c.toLowerCase().includes("primera")) || "all";
  
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCat);

  // If matchStats change (not really possible without navigation but good practice), update if defaultCat changes?
  // We'll just leave it.

  const filteredStats = selectedCategory === "all" 
    ? matchStats 
    : matchStats.filter(stat => (stat.categoryName || "Sin Categoría") === selectedCategory);

  const totals = filteredStats.reduce((acc, stat) => {
    acc.goals += stat.goals || 0;
    acc.assists += stat.assists || 0;
    acc.teamPoints += stat.teamPoints || 0;
    acc.matchTime += stat.matchTime || 0;
    acc.passesMade += stat.passesMade || 0;
    acc.passesTotal += stat.passesTotal || 0;
    acc.slidingMade += stat.slidingMade || 0;
    acc.slidingTotal += stat.slidingTotal || 0;
    acc.fouls += stat.fouls || 0;
    acc.ballLosses += stat.ballLosses || 0;
    acc.gkTime += stat.gkTime || 0;
    acc.shotsMade += stat.shotsMade || 0;
    acc.shotsTotal += stat.shotsTotal || 0;
    acc.headersMade += stat.headersMade || 0;
    acc.headersTotal += stat.headersTotal || 0;
    acc.tacklesWon += stat.tacklesWon || 0;
    acc.fouled += stat.fouled || 0;
    acc.offsides += stat.offsides || 0;
    acc.savesMade += stat.savesMade || 0;
    acc.savesTotal += stat.savesTotal || 0;
    return acc;
  }, {
    goals: 0, assists: 0, teamPoints: 0, matchTime: 0, passesMade: 0, passesTotal: 0,
    slidingMade: 0, slidingTotal: 0, fouls: 0, ballLosses: 0, gkTime: 0, shotsMade: 0, shotsTotal: 0,
    headersMade: 0, headersTotal: 0, tacklesWon: 0, fouled: 0, offsides: 0, savesMade: 0, savesTotal: 0
  });

  const formatStat = (made: number, total: number) => {
    const percentage = total > 0 ? Math.round((made / total) * 100) : 0;
    return `${made}/${total} ${percentage}%`;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-border pb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full inline-block"></span>
          Métricas
        </h2>
        {categories.length > 0 && (
          <select 
            className="bg-card border border-border text-xs rounded-md px-2 py-1 focus:outline-none focus:border-primary max-w-[150px] truncate"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-md flex flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Goals</span>
            <span className="text-xl font-black text-primary">{totals.goals}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Assists</span>
            <span className="text-xl font-black text-primary">{totals.assists}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Team PTS</span>
            <span className="text-xl font-black">{totals.teamPoints}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Match Time</span>
            <span className="text-xl font-black">{totals.matchTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Passes</span>
            <span className="text-xl font-black">{formatStat(totals.passesMade, totals.passesTotal)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Sliding</span>
            <span className="text-xl font-black">{formatStat(totals.slidingMade, totals.slidingTotal)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Fouls</span>
            <span className="text-xl font-black">{totals.fouls}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Ball Losses</span>
            <span className="text-xl font-black">{totals.ballLosses}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">GK Time</span>
            <span className="text-xl font-black">{totals.gkTime}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Shoot Acc</span>
            <span className="text-xl font-black">{formatStat(totals.shotsMade, totals.shotsTotal)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Header Duels</span>
            <span className="text-xl font-black">{formatStat(totals.headersMade, totals.headersTotal)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Tackles won</span>
            <span className="text-xl font-black">{totals.tacklesWon}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Fouled</span>
            <span className="text-xl font-black">{totals.fouled}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Offsides</span>
            <span className="text-xl font-black">{totals.offsides}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Saves</span>
            <span className="text-xl font-black">{formatStat(totals.savesMade, totals.savesTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
