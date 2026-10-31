// src/pages/GamePage.jsx
// Game Ular Tangga Edukasi — CLICK! Brand Style
// Layout: Papan (kiri) + Control Panel Guru (kanan)
// Soal: diambil dari Firestore sesuai level dadu, tampil sebagai modal pop-up

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Play, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  Timer, CheckCircle, XCircle, BookOpen, Trophy, ChevronRight,
  Flag, RefreshCw, User, Code, X,
} from 'lucide-react';
import { getRandomQuestionByLevel } from '../lib/firestore';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const BOARD_SIZE  = 36;
const GRID_COLS   = 6;
const CHECKPOINTS = [10, 20, 30];
const LADDERS     = { 4: 15, 10: 22, 20: 33 };

const PLAYER_COLORS = [
  { bg: '#E53E3E' },
  { bg: '#3182CE' },
  { bg: '#38A169' },
  { bg: '#805AD5' },
];

// Nilai dadu → level soal & durasi timer (detik)
const DICE_TO_LEVEL  = { 1: 1, 2: 1, 3: 2, 4: 3, 5: 5, 6: 5 };
const DICE_TIMERS    = { 1: 60, 2: 60, 3: 120, 4: 180, 5: 300, 6: 300 };
const LEVEL_LABELS   = { 1: 'Level 1', 2: 'Level 2', 3: 'Level 3', 5: 'Level 5' };

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function squareToGrid(num) {
  const idx = num - 1;
  const row = Math.floor(idx / GRID_COLS);
  let col   = idx % GRID_COLS;
  if (row % 2 !== 0) col = GRID_COLS - 1 - col;
  return { row: GRID_COLS - row, col: col + 1 };
}

function squareToPercent(num) {
  const { row, col } = squareToGrid(num);
  const c = 100 / GRID_COLS;
  return { x: (col - 1) * c + c / 2, y: (row - 1) * c + c / 2 };
}

function buildVisualOrder() {
  const order = [];
  for (let y = 0; y < GRID_COLS; y++) {
    const r = GRID_COLS - 1 - y;
    for (let x = 0; x < GRID_COLS; x++) {
      order.push(r % 2 !== 0 ? r * GRID_COLS + (GRID_COLS - x) : r * GRID_COLS + (x + 1));
    }
  }
  return order;
}
const VISUAL_ORDER = buildVisualOrder();

// ─── DICE DISPLAY ─────────────────────────────────────────────────────────────
const DiceIcons = [null, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
function DiceDisplay({ value, rolling, size = 52 }) {
  const Icon = DiceIcons[value] ?? Dice1;
  return <Icon size={size} strokeWidth={1.5} className={`text-brand-brown drop-shadow ${rolling ? 'animate-dice-shake' : ''}`} />;
}

// ─── BOARD ────────────────────────────────────────────────────────────────────
function Board({ players, lastMovedId, highlightSquare }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
      <div className="absolute inset-0 grid border-4 border-brand-brown rounded-2xl overflow-hidden shadow-2xl"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_COLS}, 1fr)` }}>
        {VISUAL_ORDER.map((num) => (
          <div key={num}
            className={`relative flex flex-col items-start justify-start p-0.5 sm:p-1
              text-[0.45rem] sm:text-[0.55rem] font-black border border-white/10
              ${num % 2 === 0 ? 'bg-[#B3282D] text-white' : 'bg-[#FFF5F8] text-[#B3282D]'}
              ${highlightSquare === num ? 'ring-4 ring-inset ring-yellow-400 animate-tile-glow' : ''}
            `}>
            <span className="leading-none">{num}</span>
            {num === 1  && <span className="absolute bottom-0.5 left-0.5 text-[0.3rem] opacity-70">START</span>}
            {num === 36 && <span className="absolute bottom-0.5 left-0.5 text-[0.3rem] opacity-70">FINISH</span>}
            {CHECKPOINTS.includes(num) && num !== 1 && num !== 36 && (
              <Flag size={6} className="absolute bottom-0.5 right-0.5 text-yellow-300 opacity-90" />
            )}
            {LADDERS[num] && <span className="absolute top-0.5 right-0.5 text-[0.35rem]">🪜↑</span>}
            {Object.values(LADDERS).includes(num) && <span className="absolute top-0.5 right-0.5 text-[0.35rem]">🪜✓</span>}
          </div>
        ))}
      </div>

      {/* SVG Tangga */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        {Object.entries(LADDERS).map(([bot, top]) => {
          const b = squareToPercent(Number(bot));
          const t = squareToPercent(Number(top));
          const dx = t.x - b.x, dy = t.y - b.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = -dy / len, ny = dx / len, w = 1.4;
          const rungs = Math.max(2, Math.floor(len / 6));
          return (
            <g key={bot} stroke="#9C6644" strokeLinecap="round">
              <line x1={`${b.x+nx*w}%`} y1={`${b.y+ny*w}%`} x2={`${t.x+nx*w}%`} y2={`${t.y+ny*w}%`} strokeWidth="1%" />
              <line x1={`${b.x-nx*w}%`} y1={`${b.y-ny*w}%`} x2={`${t.x-nx*w}%`} y2={`${t.y-ny*w}%`} strokeWidth="1%" />
              {Array.from({ length: rungs }).map((_, i) => {
                const f = (i + 1) / (rungs + 1);
                return (
                  <line key={i}
                    x1={`${b.x+dx*f+nx*w}%`} y1={`${b.y+dy*f+ny*w}%`}
                    x2={`${b.x+dx*f-nx*w}%`} y2={`${b.y+dy*f-ny*w}%`}
                    strokeWidth="0.7%" />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Pion */}
      {players.map((p, i) => {
        const { x, y } = squareToPercent(p.position);
        const off = [[-2,-2],[2,-2],[-2,2],[2,2]][i] || [0,0];
        return (
          <div key={p.id}
            className={`absolute rounded-full border-2 border-white shadow-lg transition-all duration-500
              ${lastMovedId === p.id ? 'animate-pawn-land' : ''}`}
            style={{ left: `calc(${x+off[0]}% - 1.5%)`, top: `calc(${y+off[1]}% - 1.5%)`,
              width: '3%', height: '3%', minWidth: 12, minHeight: 12,
              backgroundColor: p.color.bg, zIndex: 20 }}
            title={p.name} />
        );
      })}
    </div>
  );
}

// ─── COUNTDOWN TIMER ──────────────────────────────────────────────────────────
function CountdownTimer({ seconds, isPaused, bookActive, bookSecondsLeft }) {
  const display = bookActive ? bookSecondsLeft : seconds;
  const isLow   = !bookActive && seconds <= 10 && seconds > 0;
  return (
    <div className={`rounded-2xl p-4 text-center border-2
      ${isLow ? 'bg-red-50 border-red-400 animate-pulse' : 'bg-brand-lightbg border-brand-brown/20'}`}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <Timer size={15} className={isLow ? 'text-red-500' : 'text-brand-brown'} />
        <span className="text-[10px] font-bold text-brand-brown/60 uppercase tracking-wider">
          {bookActive ? '📖 Buka Buku (15 det)' : isPaused ? '⏸ Dijeda' : 'Timer Menjawab'}
        </span>
      </div>
      <div className={`text-5xl font-black tabular-nums ${isLow ? 'text-red-500' : 'text-brand-brown'}`}>
        {`${Math.floor(display / 60)}:${String(display % 60).padStart(2, '0')}`}
      </div>
    </div>
  );
}

// ─── QUESTION MODAL ───────────────────────────────────────────────────────────
function QuestionModal({ question, onClose }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  if (!question) return null;

  const correct = question.correctAnswer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl animate-card-pop">
        {/* Header */}
        <div className="bg-[#B3282D] text-white px-6 py-4 rounded-t-3xl flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider opacity-80">
              {LEVEL_LABELS[question.level] ?? `Level ${question.level}`} · Pilihan Ganda
            </span>
            <p className="font-black text-lg leading-snug mt-0.5">{question.question}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg flex-shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Blok Kode */}
          {question.hasCode && question.codeSnippet && (
            <div className="bg-gray-900 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-800">
                <Code size={13} className="text-green-400" />
                <span className="text-[10px] text-gray-400 font-mono font-bold">Kode</span>
              </div>
              <pre className="px-4 py-4 text-sm text-green-300 font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {question.codeSnippet}
              </pre>
            </div>
          )}

          {/* Opsi A, B, C */}
          <div className="space-y-2">
            {['A', 'B', 'C'].map((k) => {
              const isCorrect  = k === correct;
              const isSelected = k === selected;
              let style = 'border-gray-200 bg-gray-50 text-brand-brown';
              if (revealed) {
                if (isCorrect)                       style = 'border-green-400 bg-green-50 text-green-800';
                else if (isSelected && !isCorrect)   style = 'border-red-400 bg-red-50 text-red-700';
              } else if (isSelected) {
                style = 'border-brand-pink bg-pink-50 text-brand-brown';
              }
              return (
                <button key={k} onClick={() => !revealed && setSelected(k)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all
                    ${style}
                    ${!revealed ? 'hover:border-brand-pink cursor-pointer' : 'cursor-default'}
                  `}>
                  <span className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black border-2
                    ${isSelected && !revealed ? 'bg-brand-pink border-brand-pink text-white' : ''}
                    ${revealed && isCorrect    ? 'bg-green-500 border-green-500 text-white'  : ''}
                    ${revealed && isSelected && !isCorrect ? 'bg-red-500 border-red-500 text-white' : ''}
                    ${!isSelected && !(revealed && isCorrect) ? 'border-current bg-white' : ''}
                  `}>{k}</span>
                  <span className="font-medium text-sm leading-snug pt-0.5">{question.options?.[k]}</span>
                  {revealed && isCorrect  && <CheckCircle size={16} className="ml-auto text-green-500 flex-shrink-0 mt-0.5" />}
                  {revealed && isSelected && !isCorrect && <XCircle size={16} className="ml-auto text-red-500 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Tombol Lihat Jawaban */}
          {!revealed ? (
            <button onClick={() => setRevealed(true)}
              disabled={!selected}
              className="w-full py-3 bg-brand-brown text-white font-black rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40">
              Lihat Jawaban
            </button>
          ) : (
            <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
              <p className="text-xs font-black text-green-700 uppercase tracking-wider mb-1">
                ✅ Jawaban Benar: {correct}
              </p>
              <p className="text-sm text-green-800 leading-relaxed">{question.explanation}</p>
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-2 text-brand-brown/50 font-bold text-sm rounded-xl hover:bg-gray-50">
            Tutup Kartu
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN GAME PAGE ───────────────────────────────────────────────────────────
export default function GamePage() {
  const navigate = useNavigate();

  // Phase: 'setup' | 'playing' | 'finished'
  const [phase, setPhase]         = useState('setup');
  const [groupNames, setGroupNames] = useState(['Kelompok 1', 'Kelompok 2']);
  const [players, setPlayers]     = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Dadu
  const [diceValue, setDiceValue] = useState(1);
  const [rolling, setRolling]     = useState(false);

  // Step flow
  const [step, setStep] = useState('idle');
  // 'idle' | 'rolled' | 'take' | 'answering' | 'pass' | 'rebuttal' | 'result'

  // Soal dari Firestore
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loadingQ, setLoadingQ]               = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // Timer
  const [timerSec, setTimerSec]       = useState(0);
  const [timerPaused, setTimerPaused] = useState(false);
  const [bookActive, setBookActive]   = useState(false);
  const [bookSec, setBookSec]         = useState(15);
  const timerSecRef = useRef(0);
  const mainTimerRef = useRef(null);
  const bookTimerRef = useRef(null);

  // NHT
  const [studentNum, setStudentNum] = useState(null);

  // Hasil jawaban
  const [answerResult, setAnswerResult] = useState(null);

  // Rebutan
  const [rebuttalCandidates, setRebuttalCandidates] = useState([]);
  const [rebuttalWinner, setRebuttalWinner]         = useState(null);
  const [rebuttalRolls, setRebuttalRolls]           = useState({});

  // Visual
  const [highlightSq, setHighlightSq] = useState(null);
  const [lastMovedId, setLastMovedId] = useState(null);

  // Log
  const [logs, setLogs] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => () => {
    clearInterval(mainTimerRef.current);
    clearInterval(bookTimerRef.current);
  }, []);

  const addLog = useCallback((msg) => setLogs((p) => [...p.slice(-60), msg]), []);

  const stopAllTimers = useCallback(() => {
    clearInterval(mainTimerRef.current);
    clearInterval(bookTimerRef.current);
    setBookActive(false);
    setBookSec(15);
    setTimerPaused(false);
  }, []);

  const startMainTimer = useCallback((secs, onEnd) => {
    clearInterval(mainTimerRef.current);
    timerSecRef.current = secs;
    setTimerSec(secs);
    setTimerPaused(false);
    mainTimerRef.current = setInterval(() => {
      timerSecRef.current -= 1;
      setTimerSec(timerSecRef.current);
      if (timerSecRef.current <= 0) {
        clearInterval(mainTimerRef.current);
        onEnd?.();
      }
    }, 1000);
  }, []);

  // ─── Setup ─────────────────────────────────────────────────────────────────
  const startGame = () => {
    const valid = groupNames.filter((n) => n.trim());
    if (valid.length < 2) return;
    const ps = valid.map((name, i) => ({
      id: i, name,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      position: 1,
      checkpoint: 0,
      hasShield: false,
      hasBook: true,
    }));
    setPlayers(ps);
    setCurrentIdx(0);
    setStep('idle');
    setLogs([`> Permainan dimulai! Giliran: ${ps[0].name}`]);
    setPhase('playing');
  };

  // ─── Roll Dice ─────────────────────────────────────────────────────────────
  const rollDice = async () => {
    if (rolling || step !== 'idle') return;
    setRolling(true);
    let val = 1;
    for (let i = 0; i < 8; i++) {
      val = Math.floor(Math.random() * 6) + 1;
      setDiceValue(val);
      await sleep(90);
    }
    setRolling(false);
    setDiceValue(val);
    addLog(`🎲 ${players[currentIdx].name} dapat angka ${val} (${LEVEL_LABELS[DICE_TO_LEVEL[val]]})`);
    setStep('rolled');
  };

  // ─── Fetch soal sesuai level ────────────────────────────────────────────────
  const fetchQuestion = async (diceVal) => {
    const level = DICE_TO_LEVEL[diceVal];
    setLoadingQ(true);
    try {
      const q = await getRandomQuestionByLevel(level);
      setCurrentQuestion(q);
      if (q) setShowQuestionModal(true);
      else addLog('⚠️ Tidak ada soal untuk level ini. Hubungi admin.');
    } catch (err) {
      addLog('❌ Gagal mengambil soal: ' + err.message);
    } finally {
      setLoadingQ(false);
    }
  };

  // ─── Animasi pindah pion ───────────────────────────────────────────────────
  const animateMove = useCallback(async (playerId, steps, forward) => {
    for (let i = 0; i < steps; i++) {
      setPlayers((prev) => prev.map((p) => {
        if (p.id !== playerId) return p;
        let pos = forward ? p.position + 1 : p.position - 1;
        if (!forward) {
          const floor = p.checkpoint * 10 || 0;
          if (pos < floor + 1) pos = Math.max(1, floor + 1);
        }
        if (pos > BOARD_SIZE) pos = BOARD_SIZE;
        return { ...p, position: pos, checkpoint: Math.max(p.checkpoint, Math.floor(pos / 10)) };
      }));
      setLastMovedId(playerId);
      await sleep(380);
    }
    // Cek tangga
    setPlayers((prev) => {
      const p = prev.find((x) => x.id === playerId);
      if (!p || !forward) return prev;
      const dest = LADDERS[p.position];
      if (dest) {
        addLog(`🪜 ${p.name} naik tangga ${p.position} → ${dest}!`);
        setHighlightSq(dest);
        setTimeout(() => setHighlightSq(null), 1500);
        return prev.map((x) => x.id === playerId ? { ...x, position: dest } : x);
      }
      return prev;
    });
  }, [addLog]);

  // ─── TAKE ──────────────────────────────────────────────────────────────────
  const handleTake = async () => {
    const secs = DICE_TIMERS[diceValue];
    const lvl  = DICE_TO_LEVEL[diceValue];
    addLog(`✅ ${players[currentIdx].name} AMBIL soal Level ${lvl}. Timer: ${secs >= 60 ? secs/60 + ' mnt' : secs + ' det'}`);
    setStep('take');
    // Fetch & tampilkan soal
    await fetchQuestion(diceValue);
    // Mulai timer
    startMainTimer(secs, () => {
      const num = Math.floor(Math.random() * 4) + 1;
      setStudentNum(num);
      addLog(`⏰ Timer habis! Siswa No.${num} silakan menjawab!`);
      setStep('answering');
    });
  };

  // ─── Buka Buku ─────────────────────────────────────────────────────────────
  const handleOpenBook = () => {
    const player = players[currentIdx];
    if (!player.hasBook || bookActive) return;
    clearInterval(mainTimerRef.current);
    setTimerPaused(true);
    setBookActive(true);
    setBookSec(15);
    setPlayers((prev) => prev.map((p) => p.id === player.id ? { ...p, hasBook: false } : p));
    addLog(`📖 ${player.name} membuka buku! 15 detik.`);
    let bk = 15;
    bookTimerRef.current = setInterval(() => {
      bk--;
      setBookSec(bk);
      if (bk <= 0) {
        clearInterval(bookTimerRef.current);
        setBookActive(false);
        setTimerPaused(false);
        addLog(`📖 Waktu buku habis. Timer lanjut!`);
        const rem = timerSecRef.current;
        startMainTimer(rem, () => {
          const num = Math.floor(Math.random() * 4) + 1;
          setStudentNum(num);
          addLog(`⏰ Timer habis! Siswa No.${num} menjawab!`);
          setStep('answering');
        });
      }
    }, 1000);
  };

  // ─── ANSWER ────────────────────────────────────────────────────────────────
  const handleAnswer = async (correct) => {
    stopAllTimers();
    const player = players[currentIdx];
    setAnswerResult(correct ? 'correct' : 'wrong');
    if (!correct && player.hasShield) {
      addLog(`🛡️ ${player.name} pakai Kartu Kebal! Mundur dibatalkan.`);
      setPlayers((prev) => prev.map((p) => p.id === player.id ? { ...p, hasShield: false } : p));
      setStep('result');
      return;
    }
    addLog(correct ? `✅ ${player.name} BENAR! Maju ${diceValue} petak.` : `❌ ${player.name} SALAH! Mundur ${diceValue} petak.`);
    await animateMove(player.id, diceValue, correct);
    setPlayers((prev) => {
      const updated = prev.find((x) => x.id === player.id);
      if (updated?.position >= BOARD_SIZE) {
        addLog(`🏆 ${updated.name} mencapai FINISH!`);
        setTimeout(() => setPhase('finished'), 600);
      }
      return prev;
    });
    setStep('result');
  };

  // ─── PASS ──────────────────────────────────────────────────────────────────
  const handlePass = () => {
    addLog(`⏭️ ${players[currentIdx].name} PASS! Sesi rebutan.`);
    setRebuttalCandidates([]);
    setRebuttalWinner(null);
    setRebuttalRolls({});
    setStudentNum(null);
    setStep('pass');
  };

  const toggleRebuttal = (id) =>
    setRebuttalCandidates((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const startRebuttal = () => {
    if (!rebuttalCandidates.length) return;
    const rolls = {};
    rebuttalCandidates.forEach((id) => { rolls[id] = Math.floor(Math.random() * 6) + 1; });
    setRebuttalRolls(rolls);
    const max = Math.max(...Object.values(rolls));
    const winnerId = Number(Object.entries(rolls).find(([, v]) => v === max)?.[0]);
    setRebuttalWinner(winnerId);
    const wName = players.find((p) => p.id === winnerId)?.name;
    addLog(`🎲 Adu dadu — Pemenang: ${wName}! Timer 1 menit.`);
    setStep('rebuttal');
    startMainTimer(60, () => {
      const num = Math.floor(Math.random() * 4) + 1;
      setStudentNum(num);
      addLog(`⏰ Timer habis! Siswa No.${num} menjawab!`);
    });
  };

  const handleRebuttalAnswer = async (correct) => {
    stopAllTimers();
    const player = players.find((p) => p.id === rebuttalWinner);
    if (!player) return;
    if (correct) {
      addLog(`✅ ${player.name} BENAR! Mendapat Kartu Kebal.`);
      setPlayers((prev) => prev.map((p) => p.id === rebuttalWinner ? { ...p, hasShield: true } : p));
    } else {
      addLog(`❌ ${player.name} SALAH. Tidak ada pinalti.`);
    }
    setAnswerResult(null);
    setStep('result');
  };

  // ─── Next Turn ─────────────────────────────────────────────────────────────
  const nextTurn = () => {
    setAnswerResult(null);
    setStudentNum(null);
    setCurrentQuestion(null);
    setStep('idle');
    setCurrentIdx((prev) => {
      const next = (prev + 1) % players.length;
      addLog(`👉 Giliran: ${players[next].name}`);
      return next;
    });
  };

  // ─── Manual Penalty/Reward ─────────────────────────────────────────────────
  const applyManual = async (playerId, delta, label) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    addLog(`${delta > 0 ? '🌟' : '⚠️'} ${label}: ${player.name} ${delta > 0 ? '+' : ''}${delta}`);
    if (Math.abs(delta) > 0) await animateMove(playerId, Math.abs(delta), delta > 0);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // SETUP SCREEN
  // ──────────────────────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-brand-lightbg flex flex-col items-center justify-center p-6 font-sans">
        <button onClick={() => navigate('/')}
          className="self-start flex items-center gap-2 text-brand-brown hover:text-brand-pink font-bold mb-8 transition-colors">
          <ArrowLeft size={18} /> Kembali ke Beranda
        </button>
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border-t-8 border-brand-pink">
          <h1 className="text-3xl font-black text-brand-brown mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            🎲 Game Edukasi
          </h1>
          <p className="text-brand-brown/60 text-sm mb-6">Ular Tangga — Masukkan nama kelompok lalu mulai!</p>
          <h2 className="font-black text-brand-brown mb-3">Daftar Kelompok (2–4)</h2>
          <div className="space-y-3 mb-4">
            {groupNames.map((name, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-white shadow flex-shrink-0"
                  style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length].bg }} />
                <input value={name}
                  onChange={(e) => setGroupNames((prev) => prev.map((n, j) => j === i ? e.target.value : n))}
                  placeholder={`Kelompok ${i + 1}`}
                  className="flex-1 border-2 border-brand-brown/20 rounded-xl px-3 py-2 text-sm font-bold text-brand-brown focus:outline-none focus:border-brand-pink" />
                {groupNames.length > 2 && (
                  <button onClick={() => setGroupNames((prev) => prev.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
          {groupNames.length < 4 && (
            <button onClick={() => setGroupNames((prev) => [...prev, `Kelompok ${prev.length + 1}`])}
              className="flex items-center gap-2 text-brand-blue font-bold text-sm mb-6 hover:underline">
              <Plus size={16} /> Tambah Kelompok
            </button>
          )}
          <button onClick={startGame}
            disabled={groupNames.filter((n) => n.trim()).length < 2}
            className="w-full py-4 bg-brand-pink text-white font-black text-lg rounded-full shadow-lg hover:bg-pink-500 hover:-translate-y-0.5 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
            <Play size={20} /> Mulai Permainan!
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FINISHED SCREEN
  // ──────────────────────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const winner = [...players].sort((a, b) => b.position - a.position)[0];
    return (
      <div className="min-h-screen bg-brand-lightbg flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full border-t-8 border-brand-yellow">
          <Trophy size={64} className="mx-auto text-brand-yellow mb-4 animate-bounce" />
          <h1 className="text-3xl font-black text-brand-brown mb-2">Selamat! 🎉</h1>
          <p className="text-brand-brown/70 mb-4">Pemenangnya adalah:</p>
          <div className="text-4xl font-black py-3 px-6 rounded-2xl text-white mb-8"
            style={{ backgroundColor: winner.color.bg }}>{winner.name}</div>
          <button onClick={() => { setPhase('setup'); setGroupNames(['Kelompok 1', 'Kelompok 2']); }}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-brand-brown text-white font-bold rounded-full hover:bg-gray-800 transition-all">
            <RefreshCw size={18} /> Main Lagi
          </button>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PLAYING SCREEN
  // ──────────────────────────────────────────────────────────────────────────
  const currentPlayer = players[currentIdx];

  return (
    <div className="min-h-screen bg-[#FFF8F5] font-sans flex flex-col" style={{ fontFamily: 'Nunito, sans-serif' }}>

      {/* Modal Soal */}
      {showQuestionModal && currentQuestion && (
        <QuestionModal question={currentQuestion} onClose={() => setShowQuestionModal(false)} />
      )}

      {/* TOP BAR */}
      <div className="bg-white border-b border-brand-brown/10 px-4 py-2 flex items-center gap-3 shadow-sm flex-shrink-0">
        <button onClick={() => navigate('/')}
          className="text-brand-brown hover:text-brand-pink flex items-center gap-1 text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Keluar
        </button>
        <span className="text-brand-brown/20">|</span>
        <h1 className="font-black text-brand-brown" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Game Edukasi — Ular Tangga
        </h1>
        <span className="ml-auto text-xs text-brand-brown/40 font-bold hidden sm:block">Mode Guru • CLICK!</span>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">

        {/* ── PAPAN (kiri 70%) ── */}
        <div className="lg:w-[68%] flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-xl">
            <Board players={players} lastMovedId={lastMovedId} highlightSquare={highlightSq} />
          </div>
        </div>

        {/* ── PANEL KANAN (30%) ── */}
        <div className="lg:w-[32%] bg-white border-l border-brand-brown/10 flex flex-col overflow-y-auto">

          {/* SCOREBOARD */}
          <div className="p-4 border-b border-brand-brown/10 flex-shrink-0">
            <h2 className="font-black text-brand-brown text-xs uppercase tracking-wider mb-3">📊 Scoreboard</h2>
            <div className="space-y-2">
              {[...players].sort((a, b) => b.position - a.position).map((p) => (
                <div key={p.id} className={`flex items-center gap-2 p-2 rounded-xl text-sm
                  ${p.id === currentPlayer.id ? 'ring-2 ring-brand-pink bg-pink-50' : 'bg-gray-50'}`}>
                  <div className="w-6 h-6 rounded-full border-2 border-white shadow flex-shrink-0"
                    style={{ backgroundColor: p.color.bg }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-brand-brown truncate text-xs">{p.name}</p>
                    <p className="text-brand-brown/50 text-[10px]">Petak {p.position}/36</p>
                  </div>
                  <div className="flex gap-1 text-[10px] flex-shrink-0">
                    {p.hasShield && <span title="Kartu Kebal" className="bg-yellow-100 text-yellow-700 px-1 rounded font-bold">🛡️</span>}
                    {p.hasBook   && <span title="Bantuan Buku" className="bg-blue-100  text-blue-700  px-1 rounded font-bold">📖</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KONTROL */}
          <div className="p-4 space-y-4 flex-1">

            {/* Badge giliran */}
            <div className="rounded-2xl p-3 text-white text-center font-black shadow"
              style={{ backgroundColor: currentPlayer.color.bg }}>
              <p className="text-[10px] opacity-80 uppercase tracking-wider">Giliran</p>
              <p className="text-base">{currentPlayer.name}</p>
            </div>

            {/* IDLE */}
            {step === 'idle' && (
              <button onClick={rollDice} disabled={rolling}
                className="w-full py-4 bg-brand-brown text-white font-black text-lg rounded-2xl shadow-lg hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                <DiceDisplay value={diceValue} rolling={rolling} size={44} />
                {rolling ? 'Melempar...' : 'Lempar Dadu'}
              </button>
            )}

            {/* ROLLED: TAKE / PASS */}
            {step === 'rolled' && (
              <div className="space-y-3">
                <div className="text-center bg-brand-lightbg rounded-2xl p-3">
                  <DiceDisplay value={diceValue} rolling={false} size={52} />
                  <p className="font-black text-brand-brown mt-1">
                    Angka {diceValue} · {LEVEL_LABELS[DICE_TO_LEVEL[diceValue]]}
                  </p>
                  <p className="text-xs text-brand-brown/60">
                    Timer: {DICE_TIMERS[diceValue] >= 60 ? DICE_TIMERS[diceValue]/60 + ' menit' : DICE_TIMERS[diceValue] + ' detik'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleTake} disabled={loadingQ}
                    className="py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                    <CheckCircle size={18} /> {loadingQ ? 'Mengambil...' : 'TAKE'}
                  </button>
                  <button onClick={handlePass}
                    className="py-3 bg-brand-blue text-white font-black rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                    <ChevronRight size={18} /> PASS
                  </button>
                </div>
              </div>
            )}

            {/* TAKE — timer aktif */}
            {step === 'take' && (
              <div className="space-y-3">
                <CountdownTimer seconds={timerSec} isPaused={timerPaused} bookActive={bookActive} bookSecondsLeft={bookSec} />
                {/* Tombol lihat soal lagi */}
                {currentQuestion && (
                  <button onClick={() => setShowQuestionModal(true)}
                    className="w-full py-2 border-2 border-brand-brown/20 text-brand-brown font-bold rounded-xl text-sm hover:bg-brand-lightbg transition-all flex items-center justify-center gap-2">
                    👁️ Lihat Soal
                  </button>
                )}
                {currentPlayer.hasBook && !bookActive && (
                  <button onClick={handleOpenBook}
                    className="w-full py-2 bg-blue-50 text-brand-blue font-bold rounded-xl text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-2 border-2 border-blue-200">
                    <BookOpen size={16} /> Bantuan Buka Buku (1×)
                  </button>
                )}
              </div>
            )}

            {/* ANSWERING — NHT */}
            {step === 'answering' && (
              <div className="space-y-3">
                {currentQuestion && (
                  <button onClick={() => setShowQuestionModal(true)}
                    className="w-full py-2 border-2 border-brand-pink text-brand-pink font-bold rounded-xl text-sm hover:bg-pink-50 transition-all flex items-center justify-center gap-2">
                    👁️ Lihat Soal
                  </button>
                )}
                <div className="bg-brand-yellow/20 rounded-2xl p-4 text-center border-2 border-brand-yellow">
                  <User size={28} className="mx-auto text-brand-brown mb-1" />
                  <p className="font-black text-brand-brown text-xl">Siswa No. {studentNum}</p>
                  <p className="text-xs text-brand-brown/60">Silakan menjawab!</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleAnswer(true)}
                    className="py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
                    <CheckCircle size={18} /> BENAR
                  </button>
                  <button onClick={() => handleAnswer(false)}
                    className="py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 flex items-center justify-center gap-2">
                    <XCircle size={18} /> SALAH
                  </button>
                </div>
              </div>
            )}

            {/* PASS — pilih rebutan */}
            {step === 'pass' && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-brand-brown/60 uppercase">Pilih kelompok yang berebut:</p>
                {players.filter((p) => p.id !== currentPlayer.id).map((p) => (
                  <label key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100">
                    <input type="checkbox" checked={rebuttalCandidates.includes(p.id)}
                      onChange={() => toggleRebuttal(p.id)} className="w-4 h-4 accent-brand-pink" />
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: p.color.bg }} />
                    <span className="font-bold text-sm text-brand-brown">{p.name}</span>
                  </label>
                ))}
                <button onClick={startRebuttal} disabled={!rebuttalCandidates.length}
                  className="w-full py-3 bg-brand-pink text-white font-black rounded-xl hover:bg-pink-600 disabled:opacity-40">
                  🎲 Adu Dadu Rebutan!
                </button>
                <button onClick={() => { stopAllTimers(); setAnswerResult(null); setStep('result'); }}
                  className="w-full py-2 text-brand-brown/50 font-bold text-xs rounded-xl hover:bg-gray-50">
                  Lewati
                </button>
              </div>
            )}

            {/* REBUTTAL */}
            {step === 'rebuttal' && (
              <div className="space-y-3">
                {Object.keys(rebuttalRolls).length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] font-bold text-brand-brown/40 uppercase mb-2">Hasil Adu Dadu</p>
                    {Object.entries(rebuttalRolls).map(([id, val]) => {
                      const p = players.find((x) => x.id === Number(id));
                      return (
                        <div key={id} className={`flex justify-between text-sm font-bold rounded-lg px-2 py-1
                          ${Number(id) === rebuttalWinner ? 'bg-yellow-100 text-yellow-700' : 'text-brand-brown/50'}`}>
                          <span>{p?.name}</span><span>{val} 🎲</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <CountdownTimer seconds={timerSec} isPaused={false} bookActive={false} bookSecondsLeft={0} />
                {studentNum && (
                  <div className="bg-brand-yellow/20 rounded-xl p-3 text-center border-2 border-brand-yellow">
                    <p className="font-black text-brand-brown">Siswa No. {studentNum} menjawab</p>
                    <p className="text-[10px] text-brand-brown/60">(Pemenang rebutan: {players.find(p=>p.id===rebuttalWinner)?.name})</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleRebuttalAnswer(true)}
                    className="py-3 bg-green-500 text-white font-black rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
                    <CheckCircle size={18} /> BENAR
                  </button>
                  <button onClick={() => handleRebuttalAnswer(false)}
                    className="py-3 bg-red-500 text-white font-black rounded-xl hover:bg-red-600 flex items-center justify-center gap-2">
                    <XCircle size={18} /> SALAH
                  </button>
                </div>
              </div>
            )}

            {/* RESULT */}
            {step === 'result' && (
              <div className="space-y-3">
                {answerResult && (
                  <div className={`rounded-2xl p-3 text-center font-black
                    ${answerResult === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {answerResult === 'correct' ? '✅ BENAR! Maju!' : '❌ SALAH! Mundur!'}
                  </div>
                )}
                <button onClick={nextTurn}
                  className="w-full py-4 bg-brand-brown text-white font-black text-lg rounded-2xl shadow hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                  Giliran Berikutnya <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* PINALTI & REWARD MANUAL */}
            <div className="border-t border-brand-brown/10 pt-4">
              <p className="text-[10px] font-black text-brand-brown/40 uppercase tracking-wider mb-2">⚡ Pinalti & Reward Manual</p>
              <div className="space-y-2">
                {players.map((p) => (
                  <div key={p.id} className="bg-gray-50 rounded-xl p-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color.bg }} />
                      <span className="text-[11px] font-black text-brand-brown">{p.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => applyManual(p.id, -2, 'Bocor Jawaban')}
                        className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-1 rounded-lg hover:bg-red-200">
                        💬 -2
                      </button>
                      <button onClick={() => applyManual(p.id, -1, 'Tidak Sopan')}
                        className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded-lg hover:bg-orange-200">
                        😤 -1
                      </button>
                      <button onClick={() => applyManual(p.id, +1, 'Fairplay')}
                        className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded-lg hover:bg-green-200">
                        🌟 +1
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LOG */}
          <div className="border-t border-brand-brown/10 p-4 flex-shrink-0">
            <h2 className="font-black text-brand-brown text-[10px] uppercase tracking-wider mb-2">📋 Aktivitas</h2>
            <div ref={logRef}
              className="bg-gray-50 rounded-xl p-3 h-28 overflow-y-auto text-[10px] text-brand-brown/70 font-mono space-y-0.5">
              {logs.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
