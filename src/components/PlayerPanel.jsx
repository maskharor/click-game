// src/components/PlayerPanel.jsx
// Panel pemain: daftar pemain, join form, kontrol giliran

import { useState } from 'react';
import { Users, Play, RotateCcw, Crown } from 'lucide-react';
import DiceDisplay from './DiceDisplay';

export default function PlayerPanel({
  gameState,
  myPlayer,
  userId,
  isMyTurn,
  isRolling,
  isAnimating = false,
  onJoin,
  onStart,
  onRoll,
  onReset,
}) {
  const [name, setName] = useState('');

  const handleJoin = () => {
    if (!name.trim()) return;
    onJoin(name);
    setName('');
  };

  const activePlayer = gameState?.players?.[gameState?.currentTurnIndex];

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <div className="text-center mb-2">
          <h1 className="text-3xl font-black tracking-tight leading-none" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            <span className="text-pink-500">C</span>
            <span className="text-amber-900">L</span>
            <span className="text-cyan-400">i</span>
            <span className="text-amber-400">C</span>
            <span className="text-amber-700">K</span>
            <span className="text-pink-500">!</span>
          </h1>
          <p className="text-[10px] font-bold text-[#8b2332] uppercase tracking-widest mt-1">
            Roll &middot; Pick &middot; Connect
          </p>
        </div>

        {/* Firebase status indicator */}
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400" />
          <span className="text-xs text-green-700 font-semibold">Terhubung ke Server</span>
        </div>
      </div>

      {/* Join Form (jika belum join) */}
      {gameState?.status === 'waiting' && !myPlayer && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="font-black text-amber-900 mb-3">Masuk ke Ruang</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Nama kamu..."
            maxLength={15}
            className="
              w-full px-4 py-2.5 rounded-xl border-2 border-amber-200
              focus:border-pink-400 focus:outline-none
              font-semibold text-amber-900 placeholder:text-amber-300
              transition-colors
            "
          />
          <button
            onClick={handleJoin}
            disabled={!name.trim() || (gameState?.players?.length || 0) >= 5}
            className="
              w-full mt-3 bg-cyan-400 text-white font-black py-3 rounded-xl
              hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all flex items-center justify-center gap-2 shadow-md
              hover:shadow-cyan-300/50 hover:shadow-lg active:scale-95
            "
          >
            <Users size={18} />
            Bergabung
          </button>
        </div>
      )}

      {/* Players List */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
        <h3 className="font-black text-amber-900 mb-3 flex items-center gap-2">
          <Users size={18} className="text-cyan-500" />
          Pemain ({gameState?.players?.length || 0}/5)
        </h3>

        <div className="space-y-2">
          {(!gameState?.players || gameState.players.length === 0) && (
            <p className="text-sm text-gray-400 italic text-center py-2">Belum ada pemain...</p>
          )}
          {gameState?.players?.map((p, idx) => {
            const isActive = gameState.status === 'playing' && gameState.currentTurnIndex === idx;
            const isMe = p.id === userId;
            return (
              <div
                key={p.id}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                  ${isActive ? 'bg-amber-50 border-2 border-amber-300 shadow-sm' : 'bg-gray-50 border-2 border-transparent'}
                `}
              >
                <div className={`w-5 h-5 rounded-full shadow-inner flex-shrink-0 ${p.colorClass}`} />
                <span className={`font-bold flex-1 text-sm ${isMe ? 'text-amber-900' : 'text-gray-600'}`}>
                  {p.name}
                  {isMe && <span className="ml-1 text-xs text-cyan-500">(Kamu)</span>}
                </span>
                {isActive && <Crown size={14} className="text-amber-500 animate-float flex-shrink-0" />}
                <span className="text-xs text-gray-400 flex-shrink-0">Kotak {p.position}</span>
              </div>
            );
          })}
        </div>

        {/* Start button */}
        {gameState?.status === 'waiting' && myPlayer && (
          <button
            onClick={onStart}
            disabled={(gameState?.players?.length || 0) < 1}
            className="
              w-full mt-4 bg-[#8b2332] text-white font-black py-3 rounded-xl
              hover:bg-[#6b1825] disabled:opacity-40 disabled:cursor-not-allowed
              transition-all flex items-center justify-center gap-2 shadow-md
              hover:shadow-red-900/30 hover:shadow-lg active:scale-95
            "
          >
            <Play size={18} />
            Mulai Game!
          </button>
        )}
      </div>

      {/* Dice Panel (saat playing) */}
      {gameState?.status === 'playing' && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Giliran Sekarang
          </p>
          <div className="flex items-center gap-3 justify-center mb-4">
            <div className={`w-4 h-4 rounded-full ${activePlayer?.colorClass}`} />
            <span className="font-black text-amber-900 text-lg">{activePlayer?.name}</span>
          </div>
          <DiceDisplay
            value={gameState.diceValue || 1}
            isRolling={isRolling}
            isAnimating={isAnimating}
            isMyTurn={isMyTurn && !gameState.activeCard}
            onRoll={onRoll}
          />
          {/* Round info */}
          <p className="mt-4 text-center text-xs text-gray-400 font-semibold">
            Babak #{gameState.round || 1}
          </p>
        </div>
      )}

      {/* Game Log */}
      {gameState?.log?.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Log Permainan</h3>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {gameState.log.map((entry, i) => (
              <p key={i} className={`text-xs font-medium ${i === 0 ? 'text-amber-800' : 'text-gray-400'}`}>
                {entry}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="text-center mt-1">
        <button
          onClick={onReset}
          className="text-xs text-red-400 hover:text-red-600 font-bold flex items-center justify-center w-full gap-1 py-2 transition-colors"
        >
          <RotateCcw size={12} /> Reset & Mulai Ulang
        </button>
      </div>

    </div>
  );
}
