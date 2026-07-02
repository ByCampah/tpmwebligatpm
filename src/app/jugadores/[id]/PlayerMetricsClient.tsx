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
    acc.redCards += stat.redCards || 0;
    acc.freeKickGoals += stat.freeKickGoals || 0;
    acc.penaltyGoals += stat.penaltyGoals || 0;
    acc.penaltiesSaved += stat.penaltiesSaved || 0;
    acc.penaltiesConceded += stat.penaltiesConceded || 0;
    return acc;
  }, {
    goals: 0, assists: 0, teamPoints: 0, matchTime: 0, passesMade: 0, passesTotal: 0,
    slidingMade: 0, slidingTotal: 0, fouls: 0, ballLosses: 0, gkTime: 0, shotsMade: 0, shotsTotal: 0,
    headersMade: 0, headersTotal: 0, tacklesWon: 0, fouled: 0, offsides: 0, savesMade: 0, savesTotal: 0,
    redCards: 0, freeKickGoals: 0, penaltyGoals: 0, penaltiesSaved: 0, penaltiesConceded: 0
  });

  const renderStat = (made: number, total: number) => {
    const percentage = total > 0 ? Math.round((made / total) * 100) : 0;
    
    let colorClass = "bg-primary text-primary";
    if (percentage < 40) colorClass = "bg-red-500 text-red-500";
    else if (percentage < 70) colorClass = "bg-yellow-500 text-yellow-500";

    return (
      <div className="flex flex-col gap-1 group relative cursor-help w-full" title={`${made}/${total}`}>
        <span className="text-xl font-black">{percentage}%</span>
        <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden mt-1">
          <div 
            className={`h-full ${colorClass.split(' ')[0]} transition-all duration-500`} 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
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
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
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
            {renderStat(totals.passesMade, totals.passesTotal)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Sliding</span>
            {renderStat(totals.slidingMade, totals.slidingTotal)}
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
            {renderStat(totals.shotsMade, totals.shotsTotal)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Header Duels</span>
            {renderStat(totals.headersMade, totals.headersTotal)}
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
            {renderStat(totals.savesMade, totals.savesTotal)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Red Cards</span>
            <span className="text-xl font-black text-red-500">{totals.redCards}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Free Kick Goals</span>
            <span className="text-xl font-black text-yellow-500">{totals.freeKickGoals}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Penalty Goals</span>
            <span className="text-xl font-black text-blue-500">{totals.penaltyGoals}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Penalties Saved</span>
            <span className="text-xl font-black text-green-400">{totals.penaltiesSaved}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Pen. Conceded</span>
            <span className="text-xl font-black text-red-400">{totals.penaltiesConceded}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
