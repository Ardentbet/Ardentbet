"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

declare global {
  interface Window { Telegram?: any; }
}

const supabaseUrl = "https://puclsqxffebruxevdibl.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1Y2xzcXhmZmVicnV4ZXZkaWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTYyMTYsImV4cCI6MjA5NTQ3MjIxNn0._Y_UH2BMQWrJrA8RvM-LbTnaGFwhC_dIbNzpHRVYc-U";
const ADMIN_TELEGRAM_ID = "6433919007";

const C = {
  bg: "#1a1f2e", header: "#1e2438", card: "#242a3d", match: "#161b2c",
  border: "#2a3350", border2: "#333d58", text: "#e2e8f0", muted: "#9ca3af",
  dim: "#6b7280", yellow: "#f59e0b", red: "#ef4444",
};

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
    const telegramUser = tg?.initDataUnsafe?.user ?? { id: 123456789, username: "testuser" };
    setUser(telegramUser);

    if (telegramUser.id.toString() === ADMIN_TELEGRAM_ID) {
      setIsAdmin(true);
      fetch(`${supabaseUrl}/rest/v1/users?order=balance.desc`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      })
        .then((r) => r.json())
        .then((data) => { if (Array.isArray(data)) setUsers(data); });
    }
  }, []);

  async function updateBalance(type: "add" | "subtract" | "set") {
    if (!selectedUser || !amount) return;
    const val = parseInt(amount);
    let newBalance = selectedUser.balance;
    if (type === "add") newBalance += val;
    else if (type === "subtract") newBalance -= val;
    else newBalance = val;
    if (newBalance < 0) newBalance = 0;

    await fetch(`${supabaseUrl}/rest/v1/users?telegram_id=eq.${selectedUser.telegram_id}`, {
      method: "PATCH",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance }),
    });

    setUsers(users.map((u) => u.telegram_id === selectedUser.telegram_id ? { ...u, balance: newBalance } : u));
    setSelectedUser({ ...selectedUser, balance: newBalance });
    setMsg(`✅ Баланс обновлён: ${newBalance}`);
    setAmount("");
    setTimeout(() => setMsg(""), 3000);
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <p style={{ color: C.red }}>⛔ Нет доступа</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-32" style={{ background: C.bg }}>
      <div className="sticky top-0 z-20 px-4 py-3 flex justify-between items-center" style={{ background: C.header, borderBottom: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-black" style={{ background: C.yellow }}>A</div>
          <span className="font-black text-lg tracking-wider" style={{ color: C.yellow }}>ADMIN</span>
        </div>
      </div>

      {msg && (
        <div className="mx-3 mt-3 p-3 rounded-xl text-center text-sm font-medium" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", color: "#6ee7b7" }}>
          {msg}
        </div>
      )}

      <div className="px-4 py-4">
        <h2 className="font-black text-xl mb-4" style={{ color: C.text }}>👥 Пользователи ({users.length})</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <button key={u.id} onClick={() => setSelectedUser(u)}
              className="w-full rounded-xl p-3 text-left"
              style={{ background: selectedUser?.id === u.id ? C.yellow : C.card, border: `1px solid ${C.border}` }}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm" style={{ color: selectedUser?.id === u.id ? "#000" : C.text }}>
                  @{u.username || "—"}
                </span>
                <span className="font-bold text-sm" style={{ color: selectedUser?.id === u.id ? "#000" : C.yellow }}>
                  {u.balance?.toLocaleString()} 🪙
                </span>
              </div>
              <span className="text-xs" style={{ color: selectedUser?.id === u.id ? "#333" : C.dim }}>ID: {u.telegram_id}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 flex items-end z-50" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: C.header, border: `1px solid ${C.border}` }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg" style={{ color: C.text }}>@{selectedUser.username}</h2>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: C.card, color: C.dim }}>✕</button>
            </div>
            <p className="text-2xl font-black mb-4" style={{ color: C.yellow }}>{selectedUser.balance?.toLocaleString()} 🪙</p>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl p-3 font-bold text-lg outline-none mb-3"
              style={{ background: C.match, border: `1px solid ${C.border2}`, color: C.text }}
              placeholder="Сумма" />
            <div className="flex gap-2">
              <button onClick={() => updateBalance("add")} className="flex-1 py-3 rounded-xl font-bold text-black" style={{ background: "#10b981" }}>
                ➕ Начислить
              </button>
              <button onClick={() => updateBalance("subtract")} className="flex-1 py-3 rounded-xl font-bold text-white" style={{ background: C.red }}>
                ➖ Списать
              </button>
              <button onClick={() => updateBalance("set")} className="flex-1 py-3 rounded-xl font-bold text-black" style={{ background: C.yellow }}>
                🔄 Установить
              </button>
            </div>
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