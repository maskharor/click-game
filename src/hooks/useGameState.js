// src/hooks/useGameState.js
// Custom hook untuk mengelola state game via Firebase Firestore

import { useState, useEffect, useCallback } from 'react';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import { INITIAL_GAME_STATE, PLAYER_CONFIGS } from '../data/gameConfig';
import { getRandomCard } from '../data/cards';

const GAME_DOC_ID = 'click-game-session-v1';
const getGameRef = () => doc(db, 'gameRooms', GAME_DOC_ID);
const TOTAL_TILES = 28;

export function useGameState() {
  const [user, setUser]                       = useState(null);
  const [gameState, setGameState]             = useState(null);
  const [isLoading, setIsLoading]             = useState(true);
  const [isRolling, setIsRolling]             = useState(false);
  const [error, setError]                     = useState(null);
  const [animatedPositions, setAnimatedPositions] = useState({});
  const [isAnimating, setIsAnimating]         = useState(false);

  // ── Fungsi Animasi Bidak ────────────────────────────────
  const animateMovement = useCallback(async (playerId, startPos, steps) => {
    setIsAnimating(true);
    let currentPos = startPos;

    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      currentPos = (currentPos + 1) % TOTAL_TILES;
      setAnimatedPositions((prev) => ({
        ...prev,
        [playerId]: currentPos,
      }));
    }

    return currentPos;
  }, []);

  // ── Firebase Auth ───────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        signInAnonymously(auth).catch((err) => {
          setError('Gagal terhubung ke server. Periksa konfigurasi Firebase.');
          console.error(err);
        });
      }
    });
    return unsub;
  }, []);

  // ── Firestore Listener ──────────────────────────────────
  useEffect(() => {
    if (!user) return;
    setIsLoading(true);

    const gameRef = getGameRef();
    const unsub = onSnapshot(
      gameRef,
      (snap) => {
        if (snap.exists()) {
          setGameState(snap.data());
        } else {
          setDoc(gameRef, INITIAL_GAME_STATE).catch((e) =>
            setError('Gagal membuat sesi game: ' + e.message)
          );
        }
        setIsLoading(false);
      },
      (err) => {
        setError('Koneksi terputus: ' + err.message);
        setIsLoading(false);
      }
    );

    return unsub;
  }, [user]);

  // ── Actions ─────────────────────────────────────────────
  const joinGame = useCallback(
    async (playerName) => {
      if (!user || !gameState || !playerName.trim()) return;
      if (gameState.players.some((p) => p.id === user.uid)) return;
      if (gameState.players.length >= PLAYER_CONFIGS.length) return;

      const usedColors = gameState.players.map((p) => p.colorClass);
      const color = PLAYER_CONFIGS.find((c) => !usedColors.includes(c.colorClass));
      if (!color) return;

      const newPlayer = {
        id: user.uid,
        name: playerName.trim(),
        colorClass: color.colorClass,
        ring: color.ring,
        label: color.label,
        position: 0,
      };

      await updateDoc(getGameRef(), {
        players: [...gameState.players, newPlayer],
      });
    },
    [user, gameState]
  );

  const startGame = useCallback(async () => {
    if (!gameState || gameState.players.length < 1) return;
    await updateDoc(getGameRef(), {
      status: 'playing',
      currentTurnIndex: 0,
      activeCard: null,
      diceValue: 1,
      round: 1,
      log: [`🎮 Game dimulai dengan ${gameState.players.length} pemain!`],
    });
  }, [gameState]);

  const rollDice = useCallback(async () => {
    if (!user || !gameState || isRolling || isAnimating) return;

    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer?.id !== user.uid) return;
    if (gameState.activeCard) return;

    setIsRolling(true);

    // 1. Animasi dadu berputar (1 detik)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Generate angka dadu
    const dice = Math.floor(Math.random() * 6) + 1;
    const startPos = activePlayer.position;

    setIsRolling(false);

    // 3. Animasi bidak step-by-step
    const finalPos = await animateMovement(activePlayer.id, startPos, dice);

    // 4. Commit ke Firebase
    const updatedPlayers = gameState.players.map((p, idx) =>
      idx === gameState.currentTurnIndex ? { ...p, position: finalPos } : p
    );

    const logEntry = `🎲 ${activePlayer.name} melempar ${dice} → kotak ${finalPos}`;

    await updateDoc(getGameRef(), {
      diceValue: dice,
      players: updatedPlayers,
      log: [logEntry, ...(gameState.log || []).slice(0, 9)],
    });

    // 5. Reset state animasi lokal
    setAnimatedPositions({});
    setIsAnimating(false);

    // 6. Jeda dramatis lalu munculkan kartu
    setTimeout(async () => {
      const card = getRandomCard();
      await updateDoc(getGameRef(), { activeCard: card });
    }, 500);
  }, [user, gameState, isRolling, isAnimating, animateMovement]);

  const closeCard = useCallback(async () => {
    if (!user || !gameState) return;
    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer?.id !== user.uid) return;

    const nextIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;
    const isNewRound = nextIndex === 0;

    await updateDoc(getGameRef(), {
      activeCard: null,
      currentTurnIndex: nextIndex,
      round: isNewRound ? (gameState.round || 1) + 1 : gameState.round,
    });
  }, [user, gameState]);

  const resetGame = useCallback(async () => {
    await setDoc(getGameRef(), INITIAL_GAME_STATE);
  }, []);

  // ── Computed values ─────────────────────────────────────
  const myPlayer     = gameState?.players?.find((p) => p.id === user?.uid);
  const activePlayer = gameState?.players?.[gameState?.currentTurnIndex];
  const isMyTurn     = activePlayer?.id === user?.uid;

  return {
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
  };
}