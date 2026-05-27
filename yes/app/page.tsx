"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram: any;
  }
}

const matches = [
  {
    id: 1,
    home: "Real Madrid",
    away: "Barcelona",
    odds: [1.85, 3.2, 2.1],
  },
  {
    id: 2,
    home: "Manchester City",
    away: "Arsenal",
    odds: [1.72, 3.5, 2.4],
  },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);

  const [coupon, setCoupon] = useState<
    { match: string; odd: number }[]
  >([]);

  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (window.Telegram) {
      const tg = window.Telegram.WebApp;

      tg.expand();

      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  function addToCoupon(
    match: string,
    odd: number
  ) {
    setCoupon((prev) => [
      ...prev,
      { match, odd },
    ]);
  }

  function removeFromCoupon(index: number) {
    setCoupon((prev) =>
      prev.filter((_, i) => i !== index)
    );
  }

  const totalOdds =
    coupon.length > 0
      ? coupon
          .reduce(
            (acc, item) => acc * item.odd,
            1
          )
          .toFixed(2)
      : "0.00";

  const possibleWin = (
    Number(totalOdds) * Number(amount || 0)
  ).toFixed(2);

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            <Ardentbet></Ardentbet>
          </h1>

          {user && (
            <p className="text-zinc-400">
              @{user.username}
            </p>
          )}
        </div>

        <div className="bg-zinc-900 px-4 py-2 rounded-xl">
          10 000 Coins
        </div>
      </div>

      <div className="space-y-4 mb-5">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-zinc-900 p-4 rounded-2xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">
                  {match.home}
                </p>

                <p className="font-bold">
                  {match.away}
                </p>
              </div>

              <div className="flex gap-2">
                {match.odds.map((odd, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      addToCoupon(
                        `${match.home} vs ${match.away}`,
                        odd
                      )
                    }
                    className="bg-zinc-800 hover:bg-green-500 hover:text-black px-3 py-2 rounded-xl transition"
                  >
                    {odd}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 p-4 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">
          Coupon
        </h2>

        {coupon.length === 0 ? (
          <p className="text-zinc-400 mb-4">
            No selections
          </p>
        ) : (
          <div className="space-y-2 mb-4">
            {coupon.map((item, index) => (
              <div
                key={index}
                className="bg-zinc-800 p-3 rounded-xl flex justify-between items-center"
              >
                <div>
                  <p className="text-sm text-zinc-400">
                    {item.match}
                  </p>

                  <p className="font-bold">
                    Odd: {item.odd}
                  </p>
                </div>

                <button
                  onClick={() =>
                    removeFromCoupon(index)
                  }
                  className="bg-red-500 px-3 py-1 rounded-lg text-sm"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="number"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
          className="w-full bg-zinc-800 p-3 rounded-xl mb-4"
          placeholder="Enter amount"
        />

        <div className="mb-4">
          <p>Total Odds: {totalOdds}</p>

          <p>
            Possible Win: {possibleWin} Coins
          </p>
        </div>

        <button className="w-full bg-green-500 text-black font-bold py-3 rounded-xl">
          Place Prediction
        </button>
      </div>
    </main>
  );
}