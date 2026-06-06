"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

declare global {
  interface Window { Telegram?: any; }
}

const SPORTS_TABS = [
  { key: "football", label: "⚽", name: "Футбол" },
  { key: "basketball", label: "🏀", name: "Баскетбол" },
  { key: "hockey", label: "🏒", name: "Хоккей" },
  { key: "tennis", label: "🎾", name: "Теннис" },
  { key: "mma", label: "🥊", name: "MMA" },
];

const MARKETS = [
  { key: "result", label: "Исход" },
  { key: "total", label: "Тотал" },
  { key: "handicap", label: "Фора" },
  { key: "firsthalf", label: "1-й тайм" },
  { key: "both", label: "Обе забьют" },
];

function generateMarkets(home: string, away: string, sport: string) {
  const r = () => parseFloat((1.2 + Math.random() * 4).toFixed(2));
  const noDraw = ["tennis", "mma", "basketball"].includes(sport);
  return {
    result: noDraw
      ? [{ label: "П1", value: "home", odds: r() }, { label: "П2", value: "away", odds: r() }]
      : [{ label: "П1", value: "home", odds: r() }, { label: "Х", value: "draw", odds: r() }, { label: "П2", value: "away", odds: r() }],
    total: [
      { label: "Тб 0.5", value: "over_0.5", odds: r() }, { label: "Тм 0.5", value: "under_0.5", odds: r() },
      { label: "Тб 1.5", value: "over_1.5", odds: r() }, { label: "Тм 1.5", value: "under_1.5", odds: r() },
      { label: "Тб 2.5", value: "over_2.5", odds: r() }, { label: "Тм 2.5", value: "under_2.5", odds: r() },
      { label: "Тб 3.5", value: "over_3.5", odds: r() }, { label: "Тм 3.5", value: "under_3.5", odds: r() },
    ],
    handicap: [
      { label: `${home} -1`, value: "home_-1", odds: r() }, { label: `${home} 0`, value: "home_0", odds: r() },
      { label: `${home} +1`, value: "home_+1", odds: r() }, { label: `${away} -1`, value: "away_-1", odds: r() },
      { label: `${away} 0`, value: "away_0", odds: r() }, { label: `${away} +1`, value: "away_+1", odds: r() },
    ],
    firsthalf: noDraw ? [] : [
      { label: "П1 1Т", value: "home_1h", odds: r() }, { label: "Х 1Т", value: "draw_1h", odds: r() },
      { label: "П2 1Т", value: "away_1h", odds: r() }, { label: "Тб 0.5 1Т", value: "over_0.5_1h", odds: r() },
      { label: "Тм 0.5 1Т", value: "under_0.5_1h", odds: r() }, { label: "Тб 1.5 1Т", value: "over_1.5_1h", odds: r() },
      { label: "Тм 1.5 1Т", value: "under_1.5_1h", odds: r() },
    ],
    both: noDraw ? [] : [
      { label: "Обе забьют", value: "btts_yes", odds: r() }, { label: "Не обе", value: "btts_no", odds: r() },
      { label: "Обе + Тб 2.5", value: "btts_over2.5", odds: r() }, { label: "Обе + Тм 2.5", value: "btts_under2.5", odds: r() },
    ],
  };
}

const supabaseUrl = "https://puclsqxffebruxevdibl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Y2xzcXhmZmVicnV4ZXZkaWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTYyMTYsImV4cCI6MjA5NTQ3MjIxNn0._Y_UH2BMQWrJrA8RvM-LbTnaGFwhC_dIbNzpHRVYc-U";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(10000);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSport, setActiveSport] = useState("football");
  const [activeTab, setActiveTab] = useState<"live" | "upcoming">("upcoming");
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [activeMarket, setActiveMarket] = useState<string>("result");
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});
  const [betslip, setBetslip] = useState<any[]>([]);
  const [betAmount, setBetAmount] = useState("100");
  const [showBetslip, setShowBetslip] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    const telegramUser = tg?.initDataUnsafe?.user ?? { id: 123456789, username: "testuser" };
    setUser(telegramUser);
    fetch(`${supabaseUrl}/rest/v1/users?telegram_id=eq.${telegramUser.id}`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.[0]) setBalance(data[0].balance);
        else {
          fetch(`${supabaseUrl}/rest/v1/users`, {
            method: "POST",
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ telegram_id: telegramUser.id.toString(), username: telegramUser.username, balance: 10000 }),
          });
        }
      });
  }, []);

  const loadMatches = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setMatches([]); }
    try {
      const url = activeSport === "football" ? "/api/matches" : `/api/sports?sport=${activeSport}`;
      const res = await fetch(url);
      const data = await res.json();
      const withMarkets = (data.matches || []).map((m: any) => ({
        ...m,
        markets: generateMarkets(m.home, m.away, activeSport),
      }));
      setMatches(withMarkets);
      if (!silent) {
        const countries: Record<string, boolean> = {};
        withMarkets.forEach((m: any) => { countries[m.country] = true; });
        setExpandedCountries(countries);
      }
    } catch {
      if (!silent) setMatches([]);
    }
    if (!silent) setLoading(false);
  }, [activeSport]);

  useEffect(() => { loadMatches(); }, [loadMatches]);
  useEffect(() => {
    const interval = setInterval(() => loadMatches(true), 30000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  function addToBetslip(match: any, market: string, bet: any) {
    const id = `${match.id}_${bet.value}`;
    if (betslip.find((b) => b.id === id)) {
      setBetslip(betslip.filter((b) => b.id !== id));
      return;
    }
    setBetslip([...betslip, { id, matchTitle: `${match.home} vs ${match.away}`, market, label: bet.label, odds: bet.odds }]);
    setShowBetslip(true);
  }

  function isBetSelected(matchId: any, betValue: string) {
    return betslip.some((b) => b.id === `${matchId}_${betValue}`);
  }

  async function placeBets() {
    if (!user || betslip.length === 0) return;
    const amount = parseInt(betAmount);
    if (!amount || amount <= 0 || amount > balance) { setMsg("❌ Неверная сумма"); return; }
    const totalOdds = betslip.reduce((acc, b) => acc * b.odds, 1);
    const newBalance = balance - amount;
    await fetch(`${supabaseUrl}/rest/v1/users?telegram_id=eq.${user.id}`, {
      method: "PATCH",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance }),
    });
    for (const bet of betslip) {
      await fetch(`${supabaseUrl}/rest/v1/bets`, {
        method: "POST",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id.toString(), match_id: bet.id, match_title: bet.matchTitle, bet_on: `${bet.market}: ${bet.label}`, odds: bet.odds, amount, status: "pending" }),
      });
    }
    setBalance(newBalance);
    setBetslip([]);
    setShowBetslip(false);
    setBetAmount("100");
    setMsg(`✅ Ставка принята! КФ: ${totalOdds.toFixed(2)} Выигрыш: ${Math.round(amount * totalOdds).toLocaleString()} 🪙`);
    setTimeout(() => setMsg(""), 4000);
  }

  const liveMatches = matches.filter((m) => m.status === "LIVE");
  const upcomingMatches = matches.filter((m) => m.status !== "LIVE");
  const displayMatches = activeTab === "live" ? liveMatches : upcomingMatches;
  const byCountry = displayMatches.reduce((acc: any, m) => {
    if (!acc[m.country]) acc[m.country] = {};
    if (!acc[m.country][m.league]) acc[m.country][m.league] = [];
    acc[m.country][m.league].push(m);
    return acc;
  }, {});
  const totalOdds = betslip.reduce((acc, b) => acc * b.odds, 1);
  const availableMarkets = MARKETS.filter((m) => {
    if (["tennis", "mma", "basketball"].includes(activeSport) && (m.key === "firsthalf" || m.key === "both")) return false;
    return true;
  });

  const C = {
    bg: "#1a1f2e", header: "#1e2438", card: "#242a3d", match: "#161b2c",
    border: "#2a3350", border2: "#333d58", text: "#e2e8f0", muted: "#9ca3af",
    dim: "#6b7280", yellow: "#f59e0b", red: "#ef4444",
  };

  return (
    <main className="min-h-screen pb-32" style={{ background: C.bg }}>
      <div className="sticky top-0 z-20 px-4 py-3 flex justify-between items-center" style={{ background: C.header, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black" style={{ background: C.yellow }}>A</div>
          <span className="font-black text-lg tracking-wider" style={{ color: C.yellow }}>ARDENTBET</span>
        </div>
        <div className="px-3 py-1.5 rounded-2xl flex items-center gap-1.5" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <span className="text-sm">🪙</span>
          <span className="font-bold text-sm" style={{ color: C.yellow }}>{balance.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex overflow-x-auto" style={{ background: C.header, borderBottom: `1px solid ${C.border}` }}>
        {SPORTS_TABS.map((s) => (
          <button key={s.key} onClick={() => { setActiveSport(s.key); setActiveTab("upcoming"); setMatches([]); }}
            className="flex flex-col items-center px-4 py-2.5 whitespace-nowrap transition-all"
            style={{ borderBottom: activeSport === s.key ? `2px solid ${C.yellow}` : "2px solid transparent", minWidth: 64 }}>
            <span className="text-xl">{s.label}</span>
            <span className="text-xs mt-0.5 font-semibold" style={{ color: activeSport === s.key ? C.yellow : C.dim }}>{s.name}</span>
          </button>
        ))}
      </div>
      <div className="flex" style={{ background: C.header, borderBottom: `2px solid ${C.border}` }}>
        <button onClick={() => setActiveTab("live")} className="flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2"
          style={{ borderBottom: activeTab === "live" ? `2px solid ${C.red}` : "2px solid transparent", marginBottom: -2, color: activeTab === "live" ? C.red : C.dim }}>
          🔴 ЛАЙВ
          {liveMatches.length > 0 && <span className="text-white text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: C.red }}>{liveMatches.length}</span>}
        </button>
        <button onClick={() => setActiveTab("upcoming")} className="flex-1 py-2.5 text-sm font-bold"
          style={{ borderBottom: activeTab === "upcoming" ? `2px solid ${C.yellow}` : "2px solid transparent", marginBottom: -2, color: activeTab === "upcoming" ? C.yellow : C.dim }}>
          📅 Линия
        </button>
      </div>
      <div className="px-3 pt-3 space-y-2">
        {loading && (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: C.yellow, borderTopColor: "transparent" }}></div>
            <p className="text-sm" style={{ color: C.dim }}>Загрузка матчей...</p>
          </div>
        )}
        {!loading && displayMatches.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-2">
            <span className="text-4xl">{activeTab === "live" ? "📡" : "📅"}</span>
            <p className="text-sm" style={{ color: C.dim }}>{activeTab === "live" ? "Нет живых матчей" : "Матчей нет"}</p>
          </div>
        )}
        {Object.entries(byCountry).map(([country, leagues]: any) => (
          <div key={country} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <button onClick={() => setExpandedCountries({ ...expandedCountries, [country]: !expandedCountries[country] })}
              className="w-full px-4 py-3 flex justify-between items-center" style={{ background: C.card }}>
              <span className="font-bold text-sm" style={{ color: C.text }}>{country}</span>
              <span className="text-xs" style={{ color: C.dim }}>{expandedCountries[country] ? "▼" : "▶"}</span>
            </button>
            {expandedCountries[country] && Object.entries(leagues).map(([league, leagueMatches]: any) => (
              <div key={league}>
                <div className="px-4 py-2 flex items-center gap-2 text-xs" style={{ background: "#1c2135", color: C.dim, borderTop: `1px solid ${C.border}` }}>
                  <span>{activeSport === "basketball" ? "🏀" : activeSport === "hockey" ? "🏒" : activeSport === "tennis" ? "🎾" : activeSport === "mma" ? "🥊" : "⚽"}</span>
                  <span className="font-semibold">{league}</span>
                </div>
                {leagueMatches.map((match: any) => (
                  <div key={match.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <div onClick={() => { setExpandedMatch(expandedMatch === match.id ? null : match.id); setActiveMarket("result"); }}
                      className="px-3 py-3 cursor-pointer"
                      style={{ background: match.status === "LIVE" ? "linear-gradient(135deg, #1f1425, #1a1030)" : C.match }}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs" style={{ color: C.dim }}>{match.time}</span>
                        {match.status === "LIVE" && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.red }}></div>
                            <span className="text-xs font-bold" style={{ color: C.red }}>LIVE</span>
                          </div>
                        )}
                      </div>
                      {match.status === "LIVE" && match.homeScore !== null ? (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-sm flex-1 text-right" style={{ color: C.text }}>{match.home}</span>
                          <div className="px-3 py-1 rounded-lg font-black text-sm" style={{ background: "#7f1d1d", color: "#fca5a5", minWidth: 56, textAlign: "center" }}>
                            {match.homeScore} : {match.awayScore}
                          </div>
                          <span className="font-bold text-sm flex-1" style={{ color: C.text }}>{match.away}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-bold text-sm" style={{ color: C.text }}>{match.home} <span style={{ color: C.dim }}>vs</span> {match.away}</p>
                          <span className="text-xs ml-2" style={{ color: C.dim }}>▼</span>
                        </div>
                      )}
                      <div className="flex gap-1.5">
                        {match.markets.result.map((bet: any) => (
                          <button key={bet.value}
                            onClick={(e) => { e.stopPropagation(); addToBetslip(match, "Исход", bet); }}
                            className="flex-1 rounded-xl py-2 text-center transition-all"
                            style={{
                              background: isBetSelected(match.id, bet.value) ? C.yellow : C.card,
                              border: `1px solid ${isBetSelected(match.id, bet.value) ? C.yellow : C.border2}`,
                            }}>
                            <p className="text-xs" style={{ color: isBetSelected(match.id, bet.value) ? "#000" : C.muted }}>{bet.label}</p>
                            <p className="font-bold text-sm" style={{ color: isBetSelected(match.id, bet.value) ? "#000" : C.text }}>{bet.odds}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    {expandedMatch === match.id && (
                      <div className="px-3 pb-3" style={{ background: "#111520", borderTop: `1px solid ${C.border}` }}>
                        <div className="flex gap-2 overflow-x-auto py-2.5">
                          {availableMarkets.map((m) => (
                            <button key={m.key} onClick={() => setActiveMarket(m.key)}
                              className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-semibold transition-all"
                              style={{
                                background: activeMarket === m.key ? C.yellow : C.card,
                                color: activeMarket === m.key ? "#000" : C.muted,
                                border: `1px solid ${activeMarket === m.key ? C.yellow : C.border2}`,
                              }}>
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {(match.markets[activeMarket as keyof typeof match.markets] || []).map((bet: any) => (
                            <button key={bet.value}
                              onClick={() => addToBetslip(match, availableMarkets.find((m) => m.key === activeMarket)?.label || "", bet)}
                              className="rounded-xl p-3 text-left transition-all"
                              style={{
                                background: isBetSelected(match.id, bet.value) ? C.yellow : C.card,
                                border: `1px solid ${isBetSelected(match.id, bet.value) ? C.yellow : C.border2}`,
                              }}>
                              <p className="text-xs mb-1" style={{ color: isBetSelected(match.id, bet.value) ? "#000" : C.muted }}>{bet.label}</p>
                              <p className="font-bold" style={{ color: isBetSelected(match.id, bet.value) ? "#000" : C.text }}>{bet.odds}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
      {betslip.length > 0 && !showBetslip && (
        <button onClick={() => setShowBetslip(true)}
          className="fixed bottom-20 left-4 right-4 py-3.5 rounded-2xl flex justify-between items-center px-5 z-40 font-bold text-black"
          style={{ background: C.yellow, boxShadow: "0 4px 24px rgba(245,158,11,0.35)" }}>
          <span>🎫 Купон ({betslip.length})</span>
          <span>КФ: {totalOdds.toFixed(2)}</span>
        </button>
      )}
      {showBetslip && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: C.header, border: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg" style={{ color: C.text }}>🎫 Купон</h2>
              <button onClick={() => setShowBetslip(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-lg" style={{ color: C.dim, background: C.card }}>✕</button>
            </div>
            {betslip.map((bet) => (
              <div key={bet.id} className="rounded-xl p-3 mb-2" style={{ background: C.card, border: `1px solid ${C.border2}` }}>
                <div className="flex justify-between items-start">
                  <p className="text-xs mb-1" style={{ color: C.muted }}>{bet.matchTitle}</p>
                  <button onClick={() => setBetslip(betslip.filter((b) => b.id !== bet.id))} className="text-xs ml-2" style={{ color: C.dim }}>✕</button>
                </div>
                <p className="text-sm font-bold" style={{ color: C.text }}>{bet.market}: {bet.label}</p>
                <p className="font-bold" style={{ color: C.yellow }}>{bet.odds}</p>
              </div>
            ))}
            <div className="rounded-xl p-4 my-3" style={{ background: C.card, border: `1px solid ${C.border2}` }}>
              <div className="flex justify-between mb-3">
                <span className="text-sm" style={{ color: C.muted }}>Общий КФ</span>
                <span className="font-bold" style={{ color: C.text }}>{totalOdds.toFixed(2)}</span>
              </div>
              <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)}
                className="w-full rounded-xl p-3 font-bold text-lg outline-none mb-3"
                style={{ background: "#111520", border: `1px solid ${C.border2}`, color: C.text }}
                placeholder="Сумма ставки" />
              <div className="flex gap-2 mb-3">
                {[100, 500, 1000, 5000].map((v) => (
                  <button key={v} onClick={() => setBetAmount(v.toString())}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: "#111520", border: `1px solid ${C.border2}`, color: C.muted }}>
                    {v}
                  </button>
                ))}
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: C.muted }}>Возможный выигрыш</span>
                <span className="font-bold" style={{ color: C.yellow }}>{Math.round(parseInt(betAmount || "0") * totalOdds).toLocaleString()} 🪙</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setBetslip([]); setShowBetslip(false); }} className="flex-1 rounded-xl py-3 font-bold" style={{ background: C.card, color: C.muted }}>
                Очистить
              </button>
              <button onClick={placeBets} className="flex-1 rounded-xl py-3 font-bold text-black" style={{ background: C.yellow }}>
                Поставить
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 flex z-30" style={{ background: C.header, borderTop: `1px solid ${C.border}` }}>
        <Link href="/" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">🏠</span>
          <span className="text-xs font-semibold" style={{ color: C.yellow }}>Матчи</span>
        </Link>
        <Link href="/profile" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">👤</span>
          <span className="text-xs font-semibold" style={{ color: C.dim }}>Профиль</span>
        </Link>
        <Link href="/stats" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">📊</span>
          <span className="text-xs font-semibold" style={{ color: C.dim }}>Статистика</span>
        </Link>
      </div>
    </main>
  );
}
