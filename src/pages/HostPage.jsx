// src/pages/HostPage.jsx
// Layar Guru buat room, kontrol game, lihat papan
// Proyektor-friendly: font besar, warna kontras

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, doc, onSnapshot, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Copy, Users, Play, Pause, RotateCcw, ArrowLeft, Trophy,
  CheckCircle, XCircle, Clock, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
} from 'lucide-react';

const DICE_ICONS = { 1: Dice1, 2: Dice2, 3: Dice3, 4: Dice4, 5: Dice5, 6: Dice6 };
const DICE_TO_LEVEL = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 5, 6: 5 };
const DICE_TIMERS = { 1: 60, 2: 60, 3: 120, 4: 180, 5: 300, 6: 300 };

const BOARD_SIZE = 36;
const GRID_COLS = 6;
const LADDERS = {
  5: 14,
  12: 21,
  22: 31,
};
const PAWN_STEP_MS = 350;
const PLAYER_COLORS = ['#E53E3E', '#3182CE', '#38A169', '#805AD5'];

function squareToGrid(num) {
  const idx = num - 1;
  const row = Math.floor(idx / GRID_COLS);
  let col = idx % GRID_COLS;
  if (row % 2 !== 0) col = GRID_COLS - 1 - col;
  return { row: 5 - row, col };
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function HostPage() {
  const [roomCode, setRoomCode] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [animatingPlayer, setAnimatingPlayer] = useState(null);
  const [displayPositions, setDisplayPositions] = useState({});
  const [isAnimating, setIsAnimating] = useState(false); // for timer
  // State pop-up animasi dadu
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [diceAnimValue, setDiceAnimValue] = useState(1);
  const [diceFinal, setDiceFinal] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Timer tick
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, []);

  // Create room
  const createRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const code = generateRoomCode();
      const ref = await addDoc(collection(db, 'games'), {
        roomCode: code,
        status: 'waiting',
        phase: 'idle',
        players: [],
        currentPlayerIndex: 0,
        diceValue: null,
        currentQuestion: null,
        currentQuestionFor: null,
        timerStart: null,
        timerDuration: 0,
        round: 1,
        createdAt: serverTimestamp(),
        log: [],
      });
      setGameId(ref.id);
      setRoomCode(code);
    } catch (e) {
      setError('Gagal buat room: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to game state
  useEffect(() => {
    if (!gameId) return;
    const unsub = onSnapshot(doc(db, 'games', gameId), (snap) => {
      if (snap.exists()) setGameState({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [gameId]);

  const updateGame = async (patch) => {
    if (!gameId) return;
    await updateDoc(doc(db, 'games', gameId), patch);
  };

  const startGame = async () => {
    if (!gameState || gameState.players.length < 1) return;
    await updateGame({ status: 'playing', phase: 'idle', currentPlayerIndex: 0 });
  };

  const removePlayer = async (playerId) => {
    if (!gameState || gameState.status !== 'waiting') return;
    if (!confirm('Hapus pemain ini dari room?')) return;
    const updatedPlayers = gameState.players.filter((p) => p.id !== playerId);
    await updateGame({ players: updatedPlayers });
  };

    const rollDice = async () => {
    if (!gameState || gameState.phase !== 'idle') return;
    const finalDice = Math.floor(Math.random() * 6) + 1;
    setDiceFinal(finalDice);
    setShowDiceModal(true);

    // Animasi angka berganti 1-6 selama ~1.2 detik
    const startTime = Date.now();
    const duration = 1200;
    while (Date.now() - startTime < duration) {
      setDiceAnimValue(Math.floor(Math.random() * 6) + 1);
      await new Promise((r) => setTimeout(r, 80));
    }
    setDiceAnimValue(finalDice);

    // Tahan 600ms, lalu tutup modal & lanjut fase choosing
    await new Promise((r) => setTimeout(r, 900));
    setShowDiceModal(false);
    setDiceFinal(null);

    await updateGame({
      phase: 'choosing',
      diceValue: finalDice,
    });
  };

  const handleTake = async () => {
    const dice = gameState.diceValue;
    const level = DICE_TO_LEVEL[dice];
    const timer = DICE_TIMERS[dice];

    // Fetch soal
    const q = query(collection(db, 'questions'), where('level', '==', level));
    const snap = await getDocs(q);
    const questions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (questions.length === 0) {
      setError(`Belum ada soal level ${level}. Tambahkan di /admin dulu.`);
      return;
    }
    const question = questions[Math.floor(Math.random() * questions.length)];
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    await updateGame({
      phase: 'question',
      currentQuestion: question,
      currentQuestionFor: currentPlayer.id,
      timerStart: serverTimestamp(),
      timerDuration: timer,
      resolved: false,
      answerSubmitted: null,
      lastResult: null,
    });
  };

  const handlePass = async () => {
    await updateGame({
      phase: 'rebuttal',
      currentQuestionFor: null,
    });
  };

  const handleSelectForRebuttal = async (playerId) => {
    const dice = gameState.diceValue;
    const level = DICE_TO_LEVEL[dice];
    const timer = DICE_TIMERS[dice];

    const q = query(collection(db, 'questions'), where('level', '==', level));
    const snap = await getDocs(q);
    const questions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (questions.length === 0) {
      setError(`Belum ada soal level ${level}.`);
      return;
    }
    const question = questions[Math.floor(Math.random() * questions.length)];

    await updateGame({
      phase: 'question',
      currentQuestion: question,
      currentQuestionFor: playerId,
      timerStart: serverTimestamp(),
      timerDuration: timer,
      resolved: false,
      answerSubmitted: null,
      lastResult: null,
    });
  };

    // AUTO-RESOLVE: begitu siswa jawab (phase='result' + answerSubmitted), otomatis nilai
  useEffect(() => {
    if (!gameState || gameState.phase !== 'result' || !gameState.answerSubmitted) return;
    if (gameState.resolved) return;

    const run = async () => {
      const { playerId: answeredBy, answer } = gameState.answerSubmitted;
      const correct = gameState.currentQuestion?.correctAnswer;
      const isCorrect = answer === correct;
      const dice = gameState.diceValue || 1;

      const player = gameState.players.find((p) => p.id === answeredBy);
      if (!player) return;

      const delta = isCorrect ? dice : -dice;
      let newPos = player.position + delta;
      let snakeOrLadder = null;
      if (LADDERS[newPos]) { newPos = LADDERS[newPos]; snakeOrLadder = 'ladder'; }
      newPos = Math.max(0, Math.min(BOARD_SIZE, newPos));

      const updatedPlayers = gameState.players.map((p) =>
        p.id === answeredBy ? { ...p, position: newPos } : p
      );

      await updateGame({
        phase: 'answered',
        resolved: true,
        lastResult: {
          isCorrect,
          playerId: answeredBy,
          playerName: player.name,
          playerColor: player.color,
          delta,
          fromPos: player.position,
          toPos: newPos,
          snakeOrLadder,
          correctAnswer: correct,
          selectedAnswer: answer,
        },
        players: updatedPlayers,
        log: [
          `${player.name} ${isCorrect ? 'BENAR' : 'SALAH'} → ${isCorrect ? 'maju' : 'mundur'} ${dice}${snakeOrLadder ? ' (' + (snakeOrLadder === 'ladder' ? 'tangga naik' : 'ular turun') + ')' : ''} → posisi ${newPos}`,
          ...(gameState.log || []).slice(0, 9),
        ],
      });
    };
    run();
  }, [gameState]);
  // Tampilkan pop-up Result saat lastResult muncul (setelah siswa jawab)
  useEffect(() => {
    if (gameState?.phase === 'answered' && gameState?.lastResult) {
      setShowResultModal(true);
    }
  }, [gameState?.phase, gameState?.lastResult]);
    const handleCloseResultModal = async () => {
    // Tutup pop-up dulu
    setShowResultModal(false);
    // Tunggu sebentar agar modal hilang dari DOM
    await new Promise((r) => setTimeout(r, 150));

    const result = gameState?.lastResult;
    if (!result || !result.playerId) return;

    const fromPos = Number(result.fromPos);
    const toPos = Number(result.toPos);

    if (fromPos === toPos) {
      setTimeout(() => nextTurn(), 1000);
      return;
    }

    setIsAnimating(true);
    let pos = fromPos;
    const step = fromPos < toPos ? 1 : -1;

    // Loop dengan batas aman (max 50 langkah) untuk cegah infinite loop
    let safety = 0;
    while (pos !== toPos && safety < 50) {
      pos += step;
      // Pastikan tidak overshoot
      if ((step > 0 && pos > toPos) || (step < 0 && pos < toPos)) {
        pos = toPos;
      }
      setDisplayPositions((prev) => ({ ...prev, [result.playerId]: pos }));
      await new Promise((r) => setTimeout(r, PAWN_STEP_MS));
      safety++;
    }

    setIsAnimating(false);
    // Auto lanjut setelah pion berhenti (2 detik)
    setTimeout(() => nextTurn(), 2000);
  };

  const nextTurn = async () => {
    const nextIdx = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    await updateGame({
      phase: 'idle',
      currentPlayerIndex: nextIdx,
      diceValue: null,
      currentQuestion: null,
      currentQuestionFor: null,
      timerStart: null,
      timerDuration: 0,
      answerSubmitted: null,
      lastResult: null,
      resolved: false,
      ...(nextIdx === 0 ? { round: (gameState.round || 1) + 1 } : {}),
    });
  };

  // Timer remaining
  const getTimerRemaining = () => {
    if (!gameState?.timerStart || !gameState?.timerDuration) return 0;
    const startMs = gameState.timerStart.toMillis ? gameState.timerStart.toMillis() : gameState.timerStart;
    const elapsed = (now - startMs) / 1000;
    return Math.max(0, Math.ceil(gameState.timerDuration - elapsed));
  };

  // Render papan
  const renderBoard = () => {
    const cells = [];
    for (let num = 1; num <= BOARD_SIZE; num++) {
      const { row, col } = squareToGrid(num);
      const playersHere = (gameState?.players || []).filter((p) => {
        const visualPos = displayPositions[p.id] !== undefined ? displayPositions[p.id] : p.position;
        return visualPos === num;
      });
      const isLadder = LADDERS[num];
      cells.push(
        <div
          key={num}
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
          className={`relative flex items-center justify-center rounded border text-xs font-bold ${
            isLadder ? 'bg-green-100 border-green-400' :
            num % 2 === 0 ? 'bg-brand-lightbg' : 'bg-white'
          }`}
        >
          <span className="absolute top-0.5 left-1 text-xs sm:text-sm font-bold text-gray-500">{num}</span>
          {isLadder && (
            <span className="absolute -top-0.5 -right-0.5 bg-green-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow">
              {isLadder}
            </span>
          )}
                    <div className="flex flex-wrap gap-0.5 items-center justify-center">
            {playersHere.map((p, i) => (
              <div
                key={p.id}
                className="w-4 h-4 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-brown to-[#3d2a20] p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft size={20} /> Beranda
        </Link>
        <h1 className="text-2xl font-black" style={{ fontFamily: 'Fredoka, sans-serif' }}>
           Ular Tangga Edukatif
        </h1>
        <div className="text-sm text-white/60">Babak #{gameState?.round || 1}</div>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded mb-4 text-center font-bold">{error}</div>
      )}

      {/* Setup: Buat Room */}
      {!roomCode && (
        <div className="max-w-md mx-auto mt-20 bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-black mb-4">Buat Room Baru</h2>
          <p className="text-white/70 mb-6">Klik tombol di bawah, lalu tunjukkan kode room ke siswa.</p>
          <button
            onClick={createRoom}
            disabled={loading}
            className="bg-brand-pink text-white font-black text-xl px-8 py-4 rounded-xl hover:bg-pink-500 disabled:opacity-50"
          >
            {loading ? 'Membuat...' : '+ Buat Room'}
          </button>
        </div>
      )}

      {/* Waiting Room */}
      {roomCode && gameState?.status === 'waiting' && (
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white/10 rounded-2xl p-8 text-center">
            <p className="text-sm text-white/60 mb-2">Kode Room</p>
            <div className="text-6xl font-black tracking-widest text-brand-yellow mb-4">{roomCode}</div>
            <button
              onClick={() => navigator.clipboard.writeText(roomCode)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mx-auto mb-6"
            >
              <Copy size={16} /> Salin Kode
            </button>
            <p className="text-sm text-white/60 mb-4">Siswa buka <b>click-boardgame.web.app/play</b> dan masukkan kode + nama kelompok</p>
            <div className="bg-white/5 rounded-xl p-4">
              <h3 className="font-bold mb-3 flex items-center justify-center gap-2">
                <Users size={18} /> Kelompok yang Join ({gameState.players.length})
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {gameState.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-white shadow" style={{ backgroundColor: p.color }}>
                    {p.name}
                    <button
                      onClick={() => removePlayer(p.id)}
                      className="bg-black/20 hover:bg-black/40 rounded-full w-5 h-5 flex items-center justify-center text-xs font-black transition-colors"
                      title="Hapus pemain"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {gameState.players.length === 0 && <p className="text-white/40 italic">Menunggu siswa join...</p>}
              </div>
            </div>
            <button
              onClick={startGame}
              disabled={gameState.players.length < 1}
              className="mt-6 bg-green-500 hover:bg-green-600 text-white font-black text-xl px-10 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              <Play size={24} /> Mulai Game
            </button>
          </div>
        </div>
      )}

      {/* Playing */}
      {gameState?.status === 'playing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* BOARD */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-2">
            <div className="grid grid-cols-6 grid-rows-6 gap-0.5 sm:gap-1 aspect-square max-h-[85vh]">
              {renderBoard()}
            </div>
          </div>

          {/* CONTROL PANEL */}
          <div className="space-y-4">
            {/* Current Turn */}
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-xs text-white/60 mb-1">Giliran Sekarang</p>
              {gameState.players[gameState.currentPlayerIndex] ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full border-4 border-white shadow"
                    style={{ backgroundColor: gameState.players[gameState.currentPlayerIndex].color }}
                  />
                  <div>
                    <p className="text-xl font-black">{gameState.players[gameState.currentPlayerIndex].name}</p>
                    <p className="text-xs text-white/60">Posisi {gameState.players[gameState.currentPlayerIndex].position}</p>
                  </div>
                </div>
              ) : <p className="text-white/40 italic">-</p>}
            </div>

            {/* Phase Control */}
            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-white/60 uppercase font-bold">Aksi ({gameState.phase})</p>

              {gameState.phase === 'idle' && (
                <button onClick={rollDice} className="w-full bg-brand-pink hover:bg-pink-500 text-white font-black text-lg py-3 rounded-xl">
                  Lempar Dadu
                </button>
              )}

              {gameState.phase === 'choosing' && (
                <>
                  <div className="text-center mb-2">
                    <p className="text-sm text-white/60">Dadu</p>
                    <p className="text-4xl font-black text-brand-yellow">{gameState.diceValue}</p>
                    <p className="text-xs text-white/60">Level {DICE_TO_LEVEL[gameState.diceValue]} Timer {DICE_TIMERS[gameState.diceValue]}s</p>
                  </div>
                  <button onClick={handleTake} className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl">
                    TAKE (Kelompok ini)
                  </button>
                  <button onClick={handlePass} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-3 rounded-xl">
                    PASS (Rebutan)
                  </button>
                </>
              )}

              {gameState.phase === 'rebuttal' && (
                <>
                  <p className="text-sm text-white/60 mb-2">Pilih kelompok yang rebutan:</p>
                  {gameState.players.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectForRebuttal(p.id)}
                      className="w-full mb-2 py-3 rounded-xl font-bold text-white"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name}
                    </button>
                  ))}
                </>
              )}

              {gameState.phase === 'question' && (
                <>
                  <div className="text-center mb-2">
                    <Clock size={32} className="text-brand-yellow mx-auto mb-1" />
                    <p className="text-4xl font-black text-brand-yellow">{getTimerRemaining()}s</p>
                    <p className="text-xs text-white/60">
                      Dijawab oleh: {gameState.players.find((p) => p.id === gameState.currentQuestionFor)?.name || '-'}
                    </p>
                  </div>
                  <p className="text-xs text-white/60 text-center italic">Siswa sedang mengerjakan soal di HP masing-masing...</p>
                </>
              )}

                            {gameState.phase === 'result' && (
                <div className="text-center py-4">
                  <p className="text-3xl mb-2 animate-pulse">⏳</p>
                  <p className="text-white font-bold text-sm">Mengevaluasi jawaban...</p>
                </div>
              )}

              {gameState.phase === 'answered' && (
                <button onClick={nextTurn} className="w-full bg-brand-blue hover:bg-blue-600 text-white font-black py-3 rounded-xl">
                  Giliran Berikutnya
                </button>
              )}
            </div>

            {/* Players */}
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-xs text-white/60 mb-2 flex items-center gap-1"><Trophy size={12} /> Posisi Kelompok</p>
              <div className="space-y-1">
                {[...gameState.players].sort((a, b) => b.position - a.position).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="flex-1 font-bold">{p.name}</span>
                    <span className="text-brand-yellow font-black">{p.position}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log */}
            {gameState.log?.length > 0 && (
              <div className="bg-white/10 rounded-2xl p-3">
                <p className="text-xs text-white/60 mb-1">Log</p>
                <div className="space-y-0.5 max-h-24 overflow-y-auto">
                  {gameState.log.map((l, i) => (
                    <p key={i} className="text-[10px] text-white/70">{l}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
            {/* POP-UP ANIMASI DADU */}
      {showDiceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="text-center">
            <p className="text-white/70 font-bold text-lg mb-4 animate-pulse">
              🎲 Melempar Dadu...
            </p>
            <div className={`bg-white rounded-3xl shadow-2xl w-40 h-40 flex items-center justify-center transition-transform duration-100 ${diceFinal ? 'scale-110' : 'animate-bounce'}`}>
              <span className={`text-8xl font-black ${diceFinal ? 'text-green-600' : 'text-brand-pink'}`}>
                {diceAnimValue}
              </span>
            </div>
            <p className="text-white/50 text-sm mt-6">
              {diceFinal ? `Dadu: ${diceFinal}` : 'Tunggu...'}
            </p>
            
            
          </div>
        </div>
      )}

      {gameState?.phase === 'answered' && gameState?.lastResult && showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className={'p-8 text-center ' + (gameState?.lastResult?.isCorrect ? 'bg-green-500' : 'bg-red-500')}>
              <div className="text-6xl mb-3">{gameState?.lastResult?.isCorrect ? '🎉' : '😅'}</div>
              <h2 className="text-3xl font-black text-white">
                {gameState?.lastResult?.isCorrect ? 'BENAR!' : 'SALAH!'}
              </h2>
              <p className="text-white/90 mt-1 font-bold">{gameState?.lastResult?.playerName}</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500 mb-1">Jawaban benar</p>
              <p className="text-2xl font-black text-brand-brown mb-4">{gameState?.lastResult?.correctAnswer}</p>
              <p className="text-lg font-bold text-brand-brown mb-2">
                {gameState?.lastResult?.isCorrect ? 'Maju' : 'Mundur'} {Math.abs(gameState?.lastResult?.delta)} kotak
              </p>
              {gameState?.lastResult?.snakeOrLadder && (
                <p className="text-sm font-bold text-brand-orange mb-2">
                  {gameState?.lastResult?.snakeOrLadder === 'ladder' ? 'Naik tangga!' : 'Kena ular!'}
                </p>
              )}
              <p className="text-sm text-gray-500 mb-4">
                Posisi: {gameState?.lastResult?.fromPos} → {gameState?.lastResult?.toPos}
              </p>
              {showResultModal && !isAnimating && (
                <button
                  onClick={handleCloseResultModal}
                  className="w-full bg-brand-blue hover:bg-blue-600 text-white font-black py-3 rounded-xl mb-2"
                >
                  Tutup & Lihat Pion Jalan
                </button>
              )}
{!showResultModal && (
                <button
                  onClick={nextTurn}
                  disabled={isAnimating}
                  className={'w-full font-black py-3 rounded-xl transition-all ' + (isAnimating ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-brand-pink hover:bg-pink-500 text-white')}
                >
                  {isAnimating ? '⏳ Pion berjalan...' : 'Giliran Berikutnya'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







































