"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

declare global {
  interface Window {
    Telegram?: any;
  }
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [balance, setBalance] =
    useState<number>(0);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    async function loadUser() {
      if (!tg) return;

      tg.ready();
      tg.expand();

      const telegramUser =
        tg.initDataUnsafe?.user;

      console.log(
        "TELEGRAM USER:",
        telegramUser
      );

      if (!telegramUser) return;

      setUser(telegramUser);

      const { data: existingUser } =
        await supabase
          .from("users")
          .select("*")
          .eq(
            "telegram_id",
            telegramUser.id.toString()
          )
          .single();

      if (!existingUser) {
        const { error } =
          await supabase
            .from("users")
            .insert({
              telegram_id:
                telegramUser.id.toString(),
              username:
                telegramUser.username ||
                telegramUser.first_name,
              balance: 10000,
            });

        console.log(
          "INSERT ERROR:",
          error
        );

        setBalance(10000);
      } else {
        setBalance(
          existingUser.balance
        );
      }
    }

    loadUser();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <h1 className="text-3xl font-bold mb-2">
        Ardentbet
      </h1>

      {user ? (
        <p className="text-zinc-400 mb-4">
          @{user.username ||
            user.first_name}
        </p>
      ) : (
        <p className="text-zinc-500 mb-4">
          Loading user...
        </p>
      )}

      <div className="bg-zinc-900 p-4 rounded-2xl">
        <p className="text-zinc-400">
          Balance
        </p>

        <h2 className="text-2xl font-bold">
          {balance} Coins
        </h2>
      </div>
    </main>
  );
}