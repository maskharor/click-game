// src/data/gameConfig.js

export const TOTAL_TILES = 28; // tiles 0 - 27

export const PLAYER_CONFIGS = [
  { colorClass: 'bg-red-500',    ring: 'ring-red-500',    label: 'Merah'   },
  { colorClass: 'bg-blue-500',   ring: 'ring-blue-500',   label: 'Biru'    },
  { colorClass: 'bg-green-500',  ring: 'ring-green-500',  label: 'Hijau'   },
  { colorClass: 'bg-purple-500', ring: 'ring-purple-500', label: 'Ungu'    },
  { colorClass: 'bg-orange-500', ring: 'ring-orange-500', label: 'Oranye'  },
];

// Warna tile dalam urutan repeating
export const TILE_SEQUENCE = [
  'bg-cyan-300',
  'bg-pink-400',
  'bg-amber-300',
  'bg-amber-600',
];

// Hitung posisi grid dari index tile (perimeter 8x8 grid, 28 tiles)
// Index 0 = pojok kiri atas, lanjut searah jarum jam
export const getTileGridPos = (index) => {
  // Top row: 0-7 (left to right)
  if (index >= 0 && index <= 7)  return { col: index + 1,       row: 1 };
  // Right col: 8-14 (top+1 to bottom)
  if (index >= 8 && index <= 14) return { col: 8,               row: index - 6 };
  // Bottom row: 15-21 (right to left)
  if (index >= 15 && index <= 21) return { col: 8 - (index - 14), row: 8 };
  // Left col: 22-27 (bottom-1 to top+1)
  if (index >= 22 && index <= 27) return { col: 1,               row: 8 - (index - 21) };
  return { col: 1, row: 1 };
};

export const INITIAL_GAME_STATE = {
  status: 'waiting',   // 'waiting' | 'playing' | 'finished'
  players: [],
  currentTurnIndex: 0,
  activeCard: null,
  diceValue: 1,
  round: 1,
  log: [],             // array of log strings
};
