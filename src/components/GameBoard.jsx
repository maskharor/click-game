// src/components/GameBoard.jsx
// Papan permainan melingkar 28 kotak berbasis CSS Grid 8x8

import { getTileGridPos, TILE_SEQUENCE } from '../data/gameConfig';

const TOTAL_TILES = 28;

export default function GameBoard({
  players = [],
  activePlayerIndex = 0,
  status = 'waiting',
  activePlayerName = '',
  animatedPositions = {},
}) {
  // Helper: posisi visual bidak (animasi override posisi Firebase)
  const getVisualPosition = (player) => {
    if (animatedPositions && animatedPositions[player.id] !== undefined) {
      return animatedPositions[player.id];
    }
    return player.position;
  };

  return (
    <div className="
      relative w-full aspect-square max-w-[640px] mx-auto
      bg-[#8b2332] p-2 sm:p-3 rounded-3xl shadow-2xl
      border-4 border-[#6b1825]
    ">
      {/* Inner board */}
      <div className="
        w-full h-full rounded-2xl bg-[#FFF8F2]
        grid grid-cols-8 grid-rows-8 gap-1 p-2
        border-4 border-[#8b2332]
        relative
      ">

        {/* Tiles */}
        {Array.from({ length: TOTAL_TILES }).map((_, i) => {
          const { col, row } = getTileGridPos(i);
          const isStart = i === 0;
          const tileColor = isStart ? 'bg-white' : TILE_SEQUENCE[(i - 1) % TILE_SEQUENCE.length];
          // PENTING: pakai posisi visual, bukan posisi Firebase
          const playersHere = players.filter((p) => getVisualPosition(p) === i);

          return (
            <div
              key={i}
              style={{ gridColumn: col, gridRow: row }}
              className={`
                relative flex flex-col items-center justify-center
                rounded-lg sm:rounded-xl shadow-sm overflow-hidden
                border transition-all duration-300
                ${tileColor}
                ${isStart ? 'border-red-300' : 'border-black/10'}
                ${playersHere.length > 0 ? 'tile-active ring-2 ring-amber-400 ring-offset-1' : ''}
              `}
            >
              {/* Tile number */}
              {isStart ? (
                <span className="text-[9px] sm:text-xs font-black text-red-500 leading-none">START</span>
              ) : (
                <span className={`
                  text-[9px] sm:text-xs font-black leading-none
                  ${['bg-cyan-300','bg-amber-300'].includes(tileColor) ? 'text-black/50' : 'text-white/80'}
                `}>{i}</span>
              )}

              {/* Pawns */}
              {playersHere.length > 0 && (
                <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5 pointer-events-none">
                  {playersHere.map((p) => (
                    <div
                      key={p.id}
                      title={p.name}
                      className={`
                        w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full
                        border-2 border-white shadow-md
                        ${p.colorClass}
                        ${p.id === players[activePlayerIndex]?.id && status === 'playing'
                          ? 'animate-pawn-land ring-2 ring-white scale-125'
                          : 'scale-100'}
                        transition-all duration-200 ease-out
                      `}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Logo Area */}
        <div className="
          col-start-2 col-end-8 row-start-2 row-end-8
          flex flex-col items-center justify-center
          text-center p-2 relative overflow-hidden
        ">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_center,_#8b2332_1px,transparent_1px)] bg-[size:20px_20px]" />

          {/* Game logo */}
          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none mb-1 drop-shadow-sm select-none" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              <span className="text-pink-500">C</span>
              <span className="text-[#5D4037]">L</span>
              <span className="text-cyan-400">i</span>
              <span className="text-amber-400">C</span>
              <span className="text-amber-700">K</span>
              <span className="text-pink-500">!</span>
            </h1>
            <div className="
              bg-[#8b2332] text-white font-bold px-3 py-1 rounded-full
              text-[10px] sm:text-sm tracking-widest uppercase shadow-inner
            ">
              ROLL &middot; PICK &middot; CONNECT
            </div>

            {status === 'playing' && (
              <div className="mt-4 sm:mt-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-amber-200 shadow-sm">
                <p className="text-amber-900 font-semibold text-xs sm:text-sm">
                  Giliran:{' '}
                  <span className="font-black text-base sm:text-lg">{activePlayerName}</span>
                </p>
              </div>
            )}

            {status === 'waiting' && (
              <p className="mt-4 text-amber-900/40 font-bold text-xs sm:text-sm">
                Menunggu pemain bergabung...
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
