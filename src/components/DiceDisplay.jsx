// src/components/DiceDisplay.jsx
// Komponen visual dadu yang beranimasi

import { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function DiceDisplay({
  value = 1,
  isRolling = false,
  isAnimating = false,
  isMyTurn = false,
  onRoll,
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (isRolling) {
      setShaking(true);
      let count = 0;
      const iv = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
        count++;
        if (count > 8) {
          clearInterval(iv);
          setDisplayValue(value);
          setShaking(false);
        }
      }, 80);
      return () => clearInterval(iv);
    } else {
      setDisplayValue(value);
    }
  }, [isRolling, value]);

  const Icon = DICE_ICONS[displayValue - 1];
  // Bidak tidak boleh roll jika: bukan gilirannya, sedang rolling, ATAU sedang animasi
  const canRoll = isMyTurn && !isRolling && !isAnimating;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dice visual */}
      <div
        className={`
          w-20 h-20 rounded-2xl flex items-center justify-center
          shadow-lg border-2 transition-all duration-200
          ${shaking ? 'animate-dice-shake' : ''}
          ${canRoll
            ? 'bg-amber-400 border-amber-300 cursor-pointer hover:scale-110 hover:shadow-amber-300/50 hover:shadow-xl'
            : 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'}
        `}
        onClick={canRoll ? onRoll : undefined}
        title={canRoll ? 'Klik untuk melempar dadu!' : ''}
      >
        <Icon
          size={48}
          className={`transition-all ${canRoll ? 'text-amber-900' : 'text-gray-400'}`}
          strokeWidth={1.5}
        />
      </div>

      {/* Roll button */}
      <button
        onClick={canRoll ? onRoll : undefined}
        disabled={!canRoll}
        className={`
          px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200
          ${canRoll
            ? 'bg-amber-400 text-amber-900 hover:bg-amber-500 hover:-translate-y-0.5 shadow-md hover:shadow-lg active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
        `}
      >
        {isAnimating
          ? '🚶 Bidak Berjalan...'
          : isRolling
          ? '🎲 Melempar...'
          : isMyTurn
          ? '🎲 Kocok Dadu'
          : '⏳ Tunggu Giliran'}
      </button>

      {/* Last roll display */}
      <div className="text-center">
        <p className="text-xs text-amber-700 font-semibold uppercase tracking-widest">Lemparan Terakhir</p>
        <p className="text-4xl font-black text-amber-900">{value}</p>
      </div>
    </div>
  );
}
