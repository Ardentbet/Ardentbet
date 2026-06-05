"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window { Telegram?: any; }
}

const supabaseUrl = "https://puclsqxffebruxevdibl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Y2xzcXhmZmVicnV4ZXZkaWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTYyMTYsImV4cCI6MjA5NTQ3MjIxNn0._Y_UH2BMQWrJrA8RvM-LbTnaGFwhC_dIbNzpHRVYc-U";
const BOT_TOKEN = "8941383400:AAEG4Mka1naidh1ea643s-HGhPjbq6v6zZA";
const ADMIN_ID = "6433919007";

const C = {
  bg: "#1a1f2e", header: "#1e2438", card: "#242a3d", match: "#161b2c",
  border: "#2a3350", border2: "#333d58", text: "#e2e8f0", muted: "#9ca3af",
  dim: "#6b7280", yellow: "#f59e0b", red: "#ef4444",
};

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] = useState(0);
  const [bets, setBets] = useState<any[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawRequisites, setWithdrawRequisites] = useState("");
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
      .then((data) => { if (data?.[0]) setBalance(data[0].balance); });

    fetch(`${supabaseUrl}/rest/v1/bets?user_id=eq.${telegramUser.id}&order=created_at.desc`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBets(data); });
  }, []);

  async function sendTelegramNotification(text: string) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: ADMIN_ID, text }),
    });
  }

  async function handleDeposit() {
    if (!depositAmount) return;
    await sendTelegramNotification(
      `💰 Запрос на пополнение\nПользователь: @${user?.username} (ID: ${user?.id})\nСумма: ${depositAmount} монет`
    );
    setMsg("✅ Заявка отправлена! Ожидайте пополнения.");
    setShowDeposit(false);
    setDepositAmount("");
    setTimeout(() => setMsg(""), 4000);
  }

  async function handleWithdraw() {
    if (!withdrawAmount || !withdrawRequisites) return;
    if (parseInt(withdrawAmount) > balance) { setMsg("❌ Недостаточно средств"); return; }
    await sendTelegramNotification(
      `💸 Запрос на вывод\nПользователь: @${user?.username} (ID: ${user?.id})\nСумма: ${withdrawAmount} монет\nРеквизиты: ${withdrawRequisites}`
    );
    setMsg("✅ Заявка на вывод отправлена!");
    setShowWithdraw(false);
    setWithdrawAmount("");
    setWithdrawRequisites("");
    setTimeout(() => setMsg(""), 4000);
  }

  const statusColor = (s: string) => s === "won" ? "#10b981" : s === "lost" ? C.red : C.yellow;
  const statusLabel = (s: string) => s === "won" ? "✅ Выиграл" : s === "lost" ? "❌ Проиграл" : "⏳ Ожидание";

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

      {msg && (
        <div className="mx-3 mt-3 p-3 rounded-xl text-center text-sm font-medium" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7" }}>
          {msg}
        </div>
      )}

      <div className="px-4 py-6">
        <div className="rounded-2xl p-5 mb-4 flex items-center gap-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl text-black" style={{ background: C.yellow }}>
            {(user?.username || user?.first_name || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: C.text }}>@{user?.username || user?.first_name || "—"}</p>
            <p className="text-sm" style={{ color: C.dim }}>ID: {user?.id}</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 mb-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <p className="text-sm mb-1" style={{ color: C.muted }}>Баланс</p>
          <p className="text-3xl font-black mb-4" style={{ color: C.yellow }}>{balance.toLocaleString()} 🪙</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeposit(true)} className="flex-1 py-3 rounded-xl font-bold text-black" style={{ background: C.yellow }}>
              💰 Пополнить
            </button>
            <button onClick={() => setShowWithdraw(true)} className="flex-1 py-3 rounded-xl font-bold" style={{ background: C.match, border: `1px solid ${C.border2}`, color: C.text }}>
              💸 Вывести
            </button>
          </div>
        </div>

        <h2 className="font-bold text-lg mb-3" style={{ color: C.text }}>История ставок</h2>
        {bets.length === 0 && <p className="text-center py-8" style={{ color: C.dim }}>Ставок пока нет</p>}
        <div className="space-y-2">
          {bets.map((bet) => (
            <div key={bet.id} className="rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold" style={{ color: C.text }}>{bet.match_title}</p>
                <span className="text-xs font-bold ml-2" style={{ color: statusColor(bet.status) }}>{statusLabel(bet.status)}</span>
              </div>
              <p className="text-xs mb-1" style={{ color: C.muted }}>{bet.bet_on}</p>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: C.dim }}>КФ: {bet.odds}</span>
                <span className="text-xs font-bold" style={{ color: C.yellow }}>{bet.amount} 🪙</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showDeposit && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: C.header, border: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg" style={{ color: C.text }}>💰 Пополнение</h2>
              <button onClick={() => setShowDeposit(false)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: C.card, color: C.dim }}>✕</button>
            </div>
            <div className="rounded-xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.border2}` }}>
              <p className="text-sm font-bold mb-1" style={{ color: C.text }}>Реквизиты для оплаты:</p>
              <p className="text-sm" style={{ color: C.yellow }}>Kaspi: +77476346939</p>
              <p className="text-sm" style={{ color: C.muted }}>Получатель: Ярослав</p>
            </div>
            <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full rounded-xl p-3 font-bold text-lg outline-none mb-3"
              style={{ background: C.match, border: `1px solid ${C.border2}`, color: C.text }}
              placeholder="Сумма пополнения" />
            <button onClick={handleDeposit} className="w-full py-3 rounded-xl font-bold text-black" style={{ background: C.yellow }}>
              Я оплатил
            </button>
          </div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: C.header, border: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg" style={{ color: C.text }}>💸 Вывод</h2>
              <button onClick={() => setShowWithdraw(false)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: C.card, color: C.dim }}>✕</button>
            </div>
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full rounded-xl p-3 font-bold text-lg outline-none mb-3"
              style={{ background: C.match, border: `1px solid ${C.border2}`, color: C.text }}
              placeholder="Сумма вывода" />
            <input type="text" value={withdrawRequisites} onChange={(e) => setWithdrawRequisites(e.target.value)}
              className="w-full rounded-xl p-3 outline-none mb-3"
              style={{ background: C.match, border: `1px solid ${C.border2}`, color: C.text }}
              placeholder="Ваши реквизиты (номер карты/телефон)" />
            <button onClick={handleWithdraw} className="w-full py-3 rounded-xl font-bold text-black" style={{ background: C.yellow }}>
              Отправить заявку
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 flex z-30" style={{ background: C.header, borderTop: `1px solid ${C.border}` }}>
        <Link href="/" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">🏠</span>
          <span className="text-xs font-semibold" style={{ color: C.dim }}>Матчи</span>
        </Link>
        <Link href="/profile" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">👤</span>
          <span className="text-xs font-semibold" style={{ color: C.yellow }}>Профиль</span>
        </Link>
        <Link href="/stats" className="flex-1 py-3 flex flex-col items-center gap-0.5">
          <span className="text-lg">📊</span>
          <span className="text-xs font-semibold" style={{ color: C.dim }}>Статистика</span>
        </Link>
      </div>
    </main>
  );
}