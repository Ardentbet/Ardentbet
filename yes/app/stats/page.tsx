"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window { Telegram?: any; }
}

const supabaseUrl = "https://puclsqxffebruxevdibl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Y2xzcXhmZmVicnV4ZXZkaWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTYyMTYsImV4cCI6MjA5NTQ3MjIxNn0._Y_UH2BMQWrJrA8RvM-LbTnaGFwhC_dIbNzpHRVYc-U";

const C = {
  bg: "#1a1f2e", header: "#1e2438", card: "#242a3d", match: "#161b2c",
  border: "#2a3350", border2: "#333d58", text: "#e2e8f0", muted: "#9ca3af",
  dim: "#6b7280", yellow: "#f59e0b", red: "#ef4444",
};

export default function Stats() {
  const [user, setUser] = useState<any>(null);
  const [bets, setBets] = useState<any[]>([]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    const telegramUser = tg?.initDataUnsafe?.user ?? { id: 123456789, username: "testuser" };
    setUser(telegramUser);

    fetch(`${supabaseUrl}/rest/v1/bets?user_id=eq.${telegramUser.id}&order=created_at.desc`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBets(data); });
  }, []);

  const total = bets.length;
  const won = bets.filter((b) => b.status === "won").length;
  const lost = bets.filter((b) => b.status === "lost").length;
  const pending = bets.filter((b) => b.status === "pending").length;
  const totalWagered = bets.reduce((acc, b) => acc + b.amount, 0);
  const totalWon = bets.filter((b) => b.status === "won").reduce((acc, b) => acc + Math.round(b.amount * b.odds), 0);
  const totalLost = bets.filter((b) => b.status === "lost").reduce((acc, b) => acc + b.amount, 0);
  const profit = totalWon - totalLost;
  const winrate = total > 0 ? Math.round((won / (won + lost || 1)) * 100) : 0;

  return (
    <main className="min-h-screen pb-32" style={{ background: C.bg }}>
      <div className="sticky top-0 z-20 px-4 py-3 flex justify-between items-center" style={{ background: C.header, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black" style={{ background: C.yellow }}>A</div>
          <span className="font-black text-lg tracking-wider" style={{ color: C.yellow }}>ARDENTBET</span>
        </div>
      </div>

      <div className="px-4 py-6">
        <h2 className="font-black text-xl mb-4" style={{ color: C.text }}>📊 Статистика</h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-xs mb-1" style={{ color: C.muted }}>Всего ставок</p>
            <p className="text-2xl font-black" style={{ color: C.text }}>{total}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-xs mb-1" style={{ color: C.muted }}>Винрейт</p>
            <p className="text-2xl font-black" style={{ color: C.yellow }}>{winrate}%</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-xs mb-1" style={{ color: C.muted }}>Выиграно</p>
            <p className="text-2xl font-black" style={{ color: "#10b981" }}>{won}</p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-xs mb-1" style={{ color: C.muted }}>Проиграно</p>
            <p className="text-2xl font-black" style={{ color: C.red }}>{lost}</p>
          </div>
        </div>

        <div className="rounded-2xl p-4 mb-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-xs mb-1" style={{ color: C.muted }}>Ожидают результата</p>
          <p className="text-2xl font-black" style={{ color: C.yellow }}>{pending}</p>
        </div>

        <div className="rounded-2xl p-4 mb-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-xs mb-1" style={{ color: C.muted }}>Всего поставлено</p>
          <p className="text-2xl font-black" style={{ color: C.text }}>{totalWagered.toLocaleString()} 🪙</p>
        </div>

        <div className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-xs mb-1" style={{ color: C.muted }}>Прибыль / Убыток</p>
          <p className="text-2xl font-black" style={{ color: profit >= 0 ? "#10b981" : C.red }}>
            {profit >= 0 ? "+" : ""}{profit.toLocaleString()} 🪙
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex z-30" style={{ background: C.header, borderTop: `1px solid ${C.border}` }}>
        <Link href="/" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">🏠</span>
          <span className="text-xs font-semibold" style={{ color: C.dim }}>Матчи</span>
        </Link>
        <Link href="/profile" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">👤</span>
          <span className="text-xs font-semibold" style={{ color: C.dim }}>Профиль</span>
        </Link>
        <Link href="/stats" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">📊</span>
          <span className="text-xs font-semibold" style={{ color: C.yellow }}>Статистика</span>
        </Link>
      </div>
    </main>
  );
}
