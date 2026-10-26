// src/hooks/useGameState.js
// Custom hook untuk mengelola state game via Firebase Firestore

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { INITIAL_GAME_STATE, PLAYER_CONFIGS, TILE_SEQUENCE } from '../data/gameConfig';
import { getCards } from '../lib/firestore';

const GAME_DOC_ID = 'click-game-session-v1';
const getGameRef = () => doc(db, 'gameRooms', GAME_DOC_ID);
const TOTAL_TILES = 28;

// Mapping warna kotak → tipe kartu
const COLOR_TO_TYPE = {
  'bg-cyan-300': 'parent',
  'bg-pink-400': 'child',
  'bg-amber-300': 'myth',
  'bg-amber-600': 'challenge',
  // tambahan variasi
  'bg-cyan-400': 'parent',
  'bg-pink-300': 'child',
  'bg-amber-400': 'myth',
  'bg-red-700': 'challenge',
  'bg-amber-700': 'challenge',
};

export function useGameState() {
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRolling, setIsRolling] = useState(false);
  const [error, setError] = useState(null);
  const [animatedPositions, setAnimatedPositions] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);

  const animateMovement = useCallback(async (playerId, startPos, steps) => {
    setIsAnimating(true);
    let currentPos = startPos;
    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      currentPos = (currentPos + 1) % TOTAL_TILES;
      setAnimatedPositions((prev) => ({ ...prev, [playerId]: currentPos }));
    }
    return currentPos;
  }, []);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await getCards();
        const validCards = data.filter((c) => c.text);
        setCards(validCards);
      } catch (err) {
        console.error('Gagal fetch cards:', err);
        setError('Gagal memuat kartu: ' + err.message);
      }
    };
    fetchCards();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else signInAnonymously(auth).catch((err) => {
        setError('Gagal terhubung ke server. Periksa konfigurasi Firebase.');
        console.error(err);
      });
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    const gameRef = getGameRef();
    const unsub = onSnapshot(
      gameRef,
      (snap) => {
        if (snap.exists()) setGameState(snap.data());
        else setDoc(gameRef, INITIAL_GAME_STATE).catch((e) => setError('Gagal membuat sesi game: ' + e.message));
        setIsLoading(false);
      },
      (err) => { setError('Koneksi terputus: ' + err.message); setIsLoading(false); }
    );
    return unsub;
  }, [user]);

  // Ambil kartu berdasarkan tipe (sesuai warna kotak)
  const getCardByType = useCallback((type) => {
    const pool = cards.filter((c) => c.type === type);
    if (pool.length === 0) {
      // Fallback: kalau tidak ada kartu tipe itu, ambil random dari semua
      console.warn(`Tidak ada kartu tipe "${type}". Fallback ke random.`);
      if (cards.length === 0) return null;
      return cards[Math.floor(Math.random() * cards.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }, [cards]);

  // Tentukan tipe kartu dari posisi (menggunakan TILE_SEQUENCE)
  const getCardTypeForPosition = useCallback((pos) => {
    if (pos === 0) return 'parent'; // START
    const tileColor = TILE_SEQUENCE[(pos - 1) % TILE_SEQUENCE.length];
    return COLOR_TO_TYPE[tileColor] || 'parent';
  }, []);

  const joinGame = useCallback(async (playerName) => {
    if (!user || !gameState || !playerName.trim()) return;
    if (gameState.players.some((p) => p.id === user.uid)) return;
    if (gameState.players.length >= PLAYER_CONFIGS.length) return;
    const usedColors = gameState.players.map((p) => p.colorClass);
    const color = PLAYER_CONFIGS.find((c) => !usedColors.includes(c.colorClass));
    if (!color) return;
    const newPlayer = { id: user.uid, name: playerName.trim(), colorClass: color.colorClass, ring: color.ring, label: color.label, position: 0 };
    await updateDoc(getGameRef(), { players: [...gameState.players, newPlayer] });
  }, [user, gameState]);

  const startGame = useCallback(async () => {
    if (!gameState || gameState.players.length < 1) return;
    await updateDoc(getGameRef(), {
      status: 'playing', currentTurnIndex: 0, activeCard: null, diceValue: 1, round: 1,
      log: [`Game dimulai dengan ${gameState.players.length} pemain!`],
    });
  }, [gameState]);

  const rollDice = useCallback(async () => {
    if (!user || !gameState || isRolling || isAnimating) return;
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer?.id !== user.uid) return;
    if (gameState.activeCard) return;
    setIsRolling(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const dice = Math.floor(Math.random() * 6) + 1;
    const startPos = activePlayer.position;
    setIsRolling(false);
    const finalPos = await animateMovement(activePlayer.id, startPos, dice);
    const updatedPlayers = gameState.players.map((p, idx) =>
      idx === gameState.currentTurnIndex ? { ...p, position: finalPos } : p
    );
    const logEntry = `${activePlayer.name} melempar ${dice} -> kotak ${finalPos}`;
    await updateDoc(getGameRef(), {
      diceValue: dice, players: updatedPlayers,
      log: [logEntry, ...(gameState.log || []).slice(0, 9)],
    });
    setAnimatedPositions({});
    setIsAnimating(false);
    // Delay lalu munculkan kartu SESUAI TIPE kotak
    setTimeout(async () => {
      const type = getCardTypeForPosition(finalPos);
      const card = getCardByType(type);
      if (card) await updateDoc(getGameRef(), { activeCard: card });
    }, 500);
  }, [user, gameState, isRolling, isAnimating, animateMovement, getCardByType, getCardTypeForPosition]);

  const closeCard = useCallback(async () => {
    if (!user || !gameState) return;
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer?.id !== user.uid) return;
    const nextIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;
    const isNewRound = nextIndex === 0;
    await updateDoc(getGameRef(), {
      activeCard: null, currentTurnIndex: nextIndex,
      round: isNewRound ? (gameState.round || 1) + 1 : gameState.round,
    });
  }, [user, gameState]);

  const resetGame = useCallback(async () => {
    await setDoc(getGameRef(), INITIAL_GAME_STATE);
  }, []);

  const myPlayer = gameState?.players?.find((p) => p.id === user?.uid);
  const activePlayer = gameState?.players?.[gameState?.currentTurnIndex];
  const isMyTurn = activePlayer?.id === user?.uid;

  return {
    user, gameState, myPlayer, activePlayer, isMyTurn,
    isLoading, isRolling, isAnimating, animatedPositions,
    cards, error,
    joinGame, startGame, rollDice, closeCard, resetGame,
  };
}
