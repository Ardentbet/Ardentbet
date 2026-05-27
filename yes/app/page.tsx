"use client";

import { useState } from "react";

export default function Home() {
  const [coupon, setCoupon] = useState<number[]>([]);
  const [amount, setAmount] = useState("");

  function addToCoupon(odd: number) {
    setCoupon((prev) => [...prev, odd]);
  }

  const totalOdds =
    coupon.length > 0
      ? coupon
          .reduce((acc, odd) => acc * odd, 1)
          .toFixed(2)
      : "0.00";

  const possibleWin = (
    Number(totalOdds) * Number(amount || 0)
  ).toFixed(2);

  return (
    <main className="min-h-screen bg-black text-white p-5">
      <h1 className="text-3xl font-bold mb-6">
        Ardentbet
      </h1>

      <div className="bg-zinc-900 p-4 rounded-2xl mb-5">
        <p className="text-zinc-400">
          Balance
        </p>

        <h2 className="text-2xl font-bold">
          10 000 Coins
        </h2>
      </div>

      <div className="bg-zinc-900 p-4 rounded-2xl mb-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">
              Real Madrid
            </p>

            <p className="font-bold">
              Barcelona
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => addToCoupon(1.85)}
              className="bg-zinc-800 px-3 py-2 rounded-xl"
            >
              1.85
            </button>

            <button
              onClick={() => addToCoupon(3.2)}
              className="bg-zinc-800 px-3 py-2 rounded-xl"
            >
              3.20
            </button>

            <button
              onClick={() => addToCoupon(2.1)}
              className="bg-zinc-800 px-3 py-2 rounded-xl"
            >
              2.10
            </button>
          </div>
        </div>
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
            {coupon.map((odd, index) => (
              <div
                key={index}
                className="bg-zinc-800 p-3 rounded-xl"
              >
                Odd: {odd}
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