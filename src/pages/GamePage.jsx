// src/pages/GamePage.jsx
// Halaman game — merakit GameBoard, PlayerPanel, CardModal

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGameState } from '../hooks/useGameState';
import GameBoard from '../components/GameBoard';
import PlayerPanel from '../components/PlayerPanel';
import CardModal from '../components/CardModal';
import LoadingScreen from '../components/LoadingScreen';

export default function GamePage() {
  const {
    user,
    gameState,
    myPlayer,
    activePlayer,
    isMyTurn,
    isLoading,
    isRolling,
    isAnimating,
    animatedPositions,
    error,
    joinGame,
    startGame,
    rollDice,
    closeCard,
    resetGame,
  } = useGameState();

  // Tampilkan loading/error jika belum siap
  if (isLoading || !user || !gameState || error) {
    return <LoadingScreen error={error} />;
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] selection:bg-pink-200">

      {/* Top bar mobile */}
      <header className="md:hidden bg-[#8b2332] text-white px-4 py-2 flex items-center justify-between shadow-lg">
        <Link to="/" className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={18} />
          <span className="text-xs font-bold">Beranda</span>
        </Link>
        <h1 className="font-black text-xl tracking-tight" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          <span className="text-pink-300">C</span>LiCK!
        </h1>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/70">Live</span>
        </div>
      </header>

      {/* Top bar desktop (dengan tombol kembali) */}
      <header className="hidden md:flex bg-[#8b2332] text-white px-6 py-3 items-center justify-between shadow-lg">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors font-bold text-sm">
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
        <h1 className="font-black text-2xl tracking-tight" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          <span className="text-pink-300">C</span>LiCK!
        </h1>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/70">Terhubung</span>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex flex-col md:flex-row gap-5">

        {/* Sidebar – Player Panel */}
        <aside className="w-full md:w-72 xl:w-80 flex-shrink-0">
          <PlayerPanel
            gameState={gameState}
            myPlayer={myPlayer}
            userId={user.uid}
            isMyTurn={isMyTurn}
            isRolling={isRolling}
            isAnimating={isAnimating}
            onJoin={joinGame}
            onStart={startGame}
            onRoll={rollDice}
            onReset={resetGame}
          />
        </aside>

        {/* Main – Game Board */}
        <section className="flex-1 flex flex-col items-center justify-start gap-4">
          <GameBoard
            players={gameState.players || []}
            activePlayerIndex={gameState.currentTurnIndex || 0}
            status={gameState.status}
            activePlayerName={activePlayer?.name || ''}
            animatedPositions={animatedPositions}
          />

          {/* Category legend */}
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {[
              { color: 'bg-cyan-300',   label: "Parent's Q" },
              { color: 'bg-pink-400',   label: "Child's Q"  },
              { color: 'bg-amber-300',  label: 'Myth/Fact'  },
              { color: 'bg-amber-600',  label: 'Challenge'  },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-xs font-bold text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Card Modal */}
      <CardModal
        card={gameState.activeCard}
        isMyTurn={isMyTurn}
        activePlayerName={activePlayer?.name}
        onClose={closeCard}
      />

    </div>
  );
}
