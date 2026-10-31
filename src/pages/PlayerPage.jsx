// src/pages/PlayerPage.jsx
// Layar Siswa — join room via kode, lihat soal, jawab

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowLeft, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLAYER_COLORS = ['#E53E3E', '#3182CE', '#38A169', '#805AD5'];
const DICE_TO_LEVEL = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 5, 6: 5 };

export default function PlayerPage() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gameId, setGameId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(iv);
  }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const upperCode = code.toUpperCase().trim();
      const q = query(collection(db, 'games'), where('roomCode', '==', upperCode));
      const snap = await getDocs(q);
      if (snap.empty) {
        setError('Kode room tidak ditemukan');
        return;
      }
      const gameDoc = snap.docs[0];
      const game = { id: gameDoc.id, ...gameDoc.data() };
      if (game.status !== 'waiting') {
        setError('Game sudah dimulai');
        return;
      }
      const players = game.players || [];
      if (players.length >= 4) {
        setError('Room sudah penuh (maks 4 kelompok)');
        return;
      }
      const color = PLAYER_COLORS[players.length % PLAYER_COLORS.length];
      const newPlayerId = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      await updateDoc(doc(db, 'games', game.id), {
        players: arrayUnion({
          id: newPlayerId,
          name: name.trim(),
          color,
          position: 0,
        }),
      });
      setGameId(game.id);
      setPlayerId(newPlayerId);
    } catch (err) {
      console.error('Join error:', err);
      setError('Gagal join: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gameId) return;
    const unsub = onSnapshot(doc(db, 'games', gameId), (snap) => {
      if (snap.exists()) setGameState({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [gameId]);

  useEffect(() => {
    if (gameState?.phase === 'idle') {
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [gameState?.phase]);

  const myPlayer = gameState?.players?.find((p) => p.id === playerId);
  const isMyQuestion = gameState?.currentQuestionFor === playerId;
  const currentPlayer = gameState?.players?.[gameState?.currentTurnIndex];

  const submitAnswer = async (key) => {
    if (!isMyQuestion) return;
    setSelectedAnswer(key);
    setShowResult(true);
    await updateDoc(doc(db, 'games', gameId), {
      phase: 'result',
      answerSubmitted: { playerId, answer: key },
    });
  };

  const getTimerRemaining = () => {
    if (!gameState?.timerStart || !gameState?.timerDuration) return 0;
    const startMs = gameState.timerStart.toMillis ? gameState.timerStart.toMillis() : gameState.timerStart;
    const elapsed = (now - startMs) / 1000;
    return Math.max(0, Math.ceil(gameState.timerDuration - elapsed));
  };

  // === SETUP SCREEN ===
  if (!gameId) {
    return (
      <div className="min-h-screen bg-brand-lightbg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-brown/70 hover:text-brand-pink font-bold text-sm mb-6">
            <ArrowLeft size={16} /> Beranda
          </Link>
          <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-brand-blue">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-brand-blue rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users size={32} />
              </div>
              <h1 className="text-2xl font-black text-brand-brown">Join Game</h1>
              <p className="text-sm text-brand-brown/60 mt-1">Masukkan kode room dari guru</p>
            </div>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Kode Room</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-black text-2xl text-center tracking-widest text-brand-brown"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Nama Kelompok</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kelompok 1"
                  maxLength={20}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-bold text-brand-brown"
                />
              </div>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-black text-white bg-brand-blue hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // === LOADING STATE (baru join, gameState belum ready) ===
  if (!gameState) {
    return (
      <div className="min-h-screen bg-brand-lightbg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-brown font-bold">Memuat data game...</p>
        </div>
      </div>
    );
  }

  // === WAITING ===
  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-brand-lightbg flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-blue-100 text-brand-blue rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users size={40} />
          </div>
          <h1 className="text-3xl font-black text-brand-brown mb-2">Menunggu Guru</h1>
          <p className="text-brand-brown/60 mb-4">
            Kamu join sebagai{' '}
            <b style={{ color: myPlayer?.color || '#333' }}>{myPlayer?.name || name}</b>
          </p>
          <p className="text-xs text-brand-brown/40 mb-4">Room: {gameState.roomCode}</p>
          <p className="text-xs text-brand-brown/60">Guru akan memulai game sebentar lagi...</p>
          <div className="mt-4 flex justify-center gap-1">
            <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
            <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
            <span className="w-2 h-2 bg-brand-blue rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
          </div>
        </div>
      </div>
    );
  }

  // === PLAYING ===
  const isMyTurn = currentPlayer?.id === playerId;
  const timerRemaining = getTimerRemaining();

  return (
    <div className="min-h-screen bg-brand-lightbg p-4">
      <div className="text-center mb-4">
        <h1 className="text-xl font-black" style={{ color: myPlayer?.color || '#333' }}>{myPlayer?.name}</h1>
        <p className="text-xs text-brand-brown/60">
          Posisi: {myPlayer?.position ?? 0} • Babak {gameState.round || 1}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        {gameState.phase === 'idle' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            {isMyTurn ? (
              <>
                <div className="text-5xl mb-4">🎲</div>
                <h2 className="text-2xl font-black text-brand-brown mb-2">Giliranmu!</h2>
                <p className="text-brand-brown/60">Tunggu guru melempar dadu...</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">⏳</div>
                <h2 className="text-2xl font-black text-brand-brown mb-2">Menunggu</h2>
                <p className="text-brand-brown/60">
                  Giliran:{' '}
                  <b style={{ color: currentPlayer?.color || '#333' }}>{currentPlayer?.name || '-'}</b>
                </p>
              </>
            )}
          </div>
        )}

        {gameState.phase === 'choosing' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <p className="text-sm text-brand-brown/60 mb-1">Dadu</p>
            <p className="text-6xl font-black text-brand-brown mb-2">{gameState.diceValue ?? '-'}</p>
            <p className="text-sm text-brand-brown/60 mb-6">
              Level {DICE_TO_LEVEL[gameState.diceValue] || '-'}
            </p>
            {isMyTurn ? (
              <p className="text-brand-brown font-bold bg-brand-yellow/20 p-3 rounded-xl">
                Guru akan pilih TAKE atau PASS...
              </p>
            ) : (
              <p className="text-brand-brown/60">
                Menunggu kelompok <b>{currentPlayer?.name || '-'}</b>...
              </p>
            )}
          </div>
        )}

        {gameState.phase === 'question' && (
          isMyQuestion ? (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className={'p-4 text-center ' + (timerRemaining < 10 ? 'bg-red-500 animate-pulse' : 'bg-brand-pink')}>
                <Clock size={28} className="mx-auto text-white mb-1" />
                <p className="text-4xl font-black text-white">{timerRemaining}s</p>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-brand-blue uppercase mb-2">
                  Level {gameState.currentQuestion?.level || '-'}
                </p>
                <p className="text-lg font-bold text-brand-brown mb-4">
                  {gameState.currentQuestion?.text || 'Soal tidak ditemukan'}
                </p>
                {gameState.currentQuestion?.codeBlock && (
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto mb-4 font-mono">
                    {gameState.currentQuestion.codeBlock}
                  </pre>
                )}
                <div className="space-y-2">
                  {['A', 'B', 'C'].map((k) => {
                    const optText = gameState.currentQuestion?.options?.[k];
                    if (!optText) return null;
                    let cls = 'border-2 border-gray-200 hover:border-brand-blue';
                    if (showResult) {
                      if (k === gameState.currentQuestion.correctAnswer) cls = 'border-2 border-green-500 bg-green-50';
                      else if (k === selectedAnswer) cls = 'border-2 border-red-500 bg-red-50';
                      else cls = 'border-2 border-gray-200 opacity-50';
                    } else if (k === selectedAnswer) {
                      cls = 'border-2 border-brand-pink bg-pink-50';
                    }
                    return (
                      <button
                        key={k}
                        onClick={() => submitAnswer(k)}
                        disabled={showResult}
                        className={'w-full text-left p-4 rounded-xl font-bold transition-all ' + cls}
                      >
                        <span className="inline-block bg-white rounded-md w-7 h-7 text-center leading-7 border font-bold text-sm mr-3">{k}</span>
                        {optText}
                      </button>
                    );
                  })}
                </div>
                {showResult && (
                  <div className="mt-4 p-3 rounded-xl bg-brand-lightbg">
                    <p className="text-sm font-bold text-brand-brown">Jawaban terkirim! Menunggu guru menilai...</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
              <Clock size={48} className="mx-auto text-brand-blue mb-3 animate-pulse" />
              <h2 className="text-2xl font-black text-brand-brown mb-2">Kelompok lain menjawab</h2>
              <p className="text-brand-brown/60">
                {gameState.players?.find((p) => p.id === gameState.currentQuestionFor)?.name || '-'} sedang mengerjakan soal
              </p>
              <p className="text-3xl font-black text-brand-pink mt-4">{timerRemaining}s</p>
            </div>
          )
        )}

        {gameState.phase === 'result' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-3">📝</div>
            <h2 className="text-2xl font-black text-brand-brown mb-2">Jawaban Terkirim</h2>
            <p className="text-brand-brown/60">Menunggu guru menilai...</p>
          </div>
        )}

        {gameState.phase === 'answered' && gameState.lastResult && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={'p-6 text-center ' + (gameState.lastResult.isCorrect ? 'bg-green-500' : 'bg-red-500')}>
              <div className="text-5xl mb-2">{gameState.lastResult.isCorrect ? '🎉' : '😅'}</div>
              <h2 className="text-2xl font-black text-white">
                {gameState.lastResult.isCorrect ? 'BENAR!' : 'SALAH!'}
              </h2>
              <p className="text-white/90 text-sm mt-1">{gameState.lastResult.playerName}</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">Jawaban benar: <b>{gameState.lastResult.correctAnswer}</b></p>
              <p className="text-lg font-bold text-brand-brown mt-2">
                {gameState.lastResult.isCorrect ? 'Maju' : 'Mundur'} {Math.abs(gameState.lastResult.delta)} kotak
              </p>
              {gameState.lastResult.snakeOrLadder && (
                <p className="text-sm font-bold text-brand-orange mt-1">
                  {gameState.lastResult.snakeOrLadder === 'ladder' ? 'Naik tangga!' : 'Kena ular!'}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">Posisi: {gameState.lastResult.fromPos} → {gameState.lastResult.toPos}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

