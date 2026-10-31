// src/pages/AdminDashboard.jsx
// Dashboard admin: CRUD Soal (pilgan per level dadu) + CRUD Acara

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import {
  getQuestions, addQuestion, updateQuestion, deleteQuestion,
  getAllEvents, addEvent, updateEvent, deleteEvent,
} from '../lib/firestore';
import {
  LogOut, Plus, Edit2, Trash2, X, Save,
  HelpCircle, Calendar, AlertTriangle, Code, Eye, EyeOff,
  ChevronDown, ChevronUp,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVEL_LABELS = {
  1: 'Level 1 (Dadu 1–2) · 1 menit',
  2: 'Level 2 (Dadu 3) · 2 menit',
  3: 'Level 3 (Dadu 4) · 3 menit',
  5: 'Level 5 (Dadu 5–6) · 5 menit',
};

const EMPTY_Q = {
  level: 1,
  question: '',
  hasCode: false,
  codeSnippet: '',
  options: { A: '', B: '', C: '' },
  correctAnswer: 'A',
  explanation: '',
};

const EMPTY_EVENT = { name: '', date: '', time: '', description: '' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const levelColor = (lv) => ({
  1: 'bg-green-100  text-green-700  border-green-300',
  2: 'bg-blue-100   text-blue-700   border-blue-300',
  3: 'bg-orange-100 text-orange-700 border-orange-300',
  5: 'bg-red-100    text-red-700    border-red-300',
}[lv] || 'bg-gray-100 text-gray-600');

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [user, setUser]         = useState(null);
  const [tab, setTab]           = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [modalOpen, setModalOpen] = useState(false); // 'question' | 'event' | false
  const [editingId, setEditingId] = useState(null);
  const [qForm, setQForm]       = useState({ ...EMPTY_Q, options: { A:'', B:'', C:'' } });
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [saving, setSaving]     = useState(false);
  const [valErrors, setValErrors] = useState([]);
  const [showAnswer, setShowAnswer] = useState({}); // { [id]: bool }
  const [filterLevel, setFilterLevel] = useState('all');
  const navigate = useNavigate();

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate('/admin/login');
      else setUser(u);
    });
    return unsub;
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [q, e] = await Promise.all([getQuestions(), getAllEvents()]);
      setQuestions(q);
      setEvents(e);
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleLogout = async () => { await signOut(auth); navigate('/admin/login'); };

  const resetModal = () => { setModalOpen(false); setEditingId(null); setValErrors([]); };

  // ── Question Modal ──────────────────────────────────────────────────────────
  const openQModal = (q = null) => {
    if (q) {
      setQForm({
        level:       q.level ?? 1,
        question:    q.question ?? '',
        hasCode:     q.hasCode ?? false,
        codeSnippet: q.codeSnippet ?? '',
        options:     q.options ?? { A: '', B: '', C: '' },
        correctAnswer: q.correctAnswer ?? 'A',
        explanation: q.explanation ?? '',
      });
      setEditingId(q.id);
    } else {
      setQForm({ ...EMPTY_Q, options: { A: '', B: '', C: '' } });
      setEditingId(null);
    }
    setValErrors([]);
    setModalOpen('question');
  };

  const validateQ = () => {
    const e = [];
    if (!qForm.question.trim())        e.push('Teks soal wajib diisi');
    if (!qForm.options.A?.trim())      e.push('Opsi A wajib diisi');
    if (!qForm.options.B?.trim())      e.push('Opsi B wajib diisi');
    if (!qForm.options.C?.trim())      e.push('Opsi C wajib diisi');
    if (!qForm.explanation?.trim())    e.push('Penjelasan/kunci jawaban wajib diisi');
    if (qForm.hasCode && !qForm.codeSnippet?.trim()) e.push('Blok kode wajib diisi (karena "Ada Kode" dicentang)');
    return e;
  };

  const saveQ = async () => {
    const errs = validateQ();
    if (errs.length) { setValErrors(errs); return; }
    setValErrors([]);
    setSaving(true);
    try {
      const data = {
        level:        Number(qForm.level),
        question:     qForm.question.trim(),
        hasCode:      qForm.hasCode,
        codeSnippet:  qForm.hasCode ? qForm.codeSnippet.trim() : '',
        options: {
          A: qForm.options.A.trim(),
          B: qForm.options.B.trim(),
          C: qForm.options.C.trim(),
        },
        correctAnswer: qForm.correctAnswer,
        explanation:   qForm.explanation.trim(),
      };
      if (editingId) await updateQuestion(editingId, data);
      else           await addQuestion(data);
      await loadData();
      resetModal();
    } catch (err) {
      alert('Gagal simpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeQ = async (id) => {
    if (!confirm('Yakin hapus soal ini?')) return;
    try { await deleteQuestion(id); await loadData(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
  };

  // ── Event Modal ─────────────────────────────────────────────────────────────
  const openEventModal = (ev = null) => {
    setEventForm(ev ? { ...ev } : { ...EMPTY_EVENT });
    setEditingId(ev ? ev.id : null);
    setValErrors([]);
    setModalOpen('event');
  };

  const validateEvent = () => {
    const e = [];
    if (!eventForm.name?.trim())        e.push('Nama acara wajib diisi');
    if (!eventForm.date?.trim())        e.push('Tanggal wajib diisi');
    if (!eventForm.time?.trim())        e.push('Jam wajib diisi');
    if (!eventForm.description?.trim()) e.push('Deskripsi wajib diisi');
    return e;
  };

  const saveEvent = async () => {
    const errs = validateEvent();
    if (errs.length) { setValErrors(errs); return; }
    setValErrors([]);
    setSaving(true);
    try {
      const data = { name: eventForm.name.trim(), date: eventForm.date, time: eventForm.time, description: eventForm.description.trim() };
      if (editingId) await updateEvent(editingId, data);
      else           await addEvent(data);
      await loadData();
      resetModal();
    } catch (err) {
      alert('Gagal simpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = async (id) => {
    if (!confirm('Yakin hapus acara ini?')) return;
    try { await deleteEvent(id); await loadData(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
  };

  const setOption = (k, v) => setQForm((prev) => ({ ...prev, options: { ...prev.options, [k]: v } }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-lightbg">
      <p className="text-brand-brown font-bold">Memuat data...</p>
    </div>
  );

  // filtered questions
  const filteredQ = filterLevel === 'all'
    ? questions
    : questions.filter((q) => q.level === Number(filterLevel));

  return (
    <div className="min-h-screen bg-brand-lightbg pb-12 font-sans">

      {/* HEADER */}
      <header className="bg-brand-brown text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-xs text-white/60">Login sebagai: {user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('questions')}
            className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all
              ${tab === 'questions' ? 'bg-brand-pink text-white shadow-lg' : 'bg-white text-brand-brown hover:bg-gray-100'}`}>
            <HelpCircle size={16} /> Soal ({questions.length})
          </button>
          <button onClick={() => setTab('events')}
            className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all
              ${tab === 'events' ? 'bg-brand-blue text-white shadow-lg' : 'bg-white text-brand-brown hover:bg-gray-100'}`}>
            <Calendar size={16} /> Acara ({events.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertTriangle size={18} className="text-red-500 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* ── TAB: SOAL ── */}
        {tab === 'questions' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
              <h2 className="text-xl font-black text-brand-brown">Daftar Soal Pilgan</h2>
              <div className="flex items-center gap-2">
                {/* Filter level */}
                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
                  className="text-sm border-2 border-gray-200 rounded-xl px-3 py-1.5 font-bold text-brand-brown focus:outline-none focus:border-brand-pink">
                  <option value="all">Semua Level</option>
                  {[1, 2, 3, 5].map((lv) => (
                    <option key={lv} value={lv}>Level {lv}</option>
                  ))}
                </select>
                <button onClick={() => openQModal()}
                  className="bg-brand-pink text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-pink-600 transition-all">
                  <Plus size={16} /> Tambah Soal
                </button>
              </div>
            </div>

            {/* Legend level */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(LEVEL_LABELS).map(([lv, label]) => (
                <span key={lv} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelColor(Number(lv))}`}>
                  {label}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              {filteredQ.length === 0 && (
                <p className="text-center text-gray-400 italic py-8">Belum ada soal. Klik "Tambah Soal" untuk mulai.</p>
              )}
              {filteredQ.map((q) => (
                <div key={q.id} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg border flex-shrink-0 ${levelColor(q.level)}`}>
                      L{q.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-brand-brown mb-1 line-clamp-2">{q.question}</p>
                      {q.hasCode && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold mb-2">
                          <Code size={10} /> Ada blok kode
                        </span>
                      )}
                      <div className="flex flex-wrap gap-1 text-[11px]">
                        {['A', 'B', 'C'].map((k) => (
                          <span key={k} className={`px-2 py-0.5 rounded-md font-bold border
                            ${q.correctAnswer === k
                              ? 'bg-green-100 text-green-700 border-green-300'
                              : 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}>
                            {k}. {q.options?.[k]}
                            {q.correctAnswer === k && ' ✓'}
                          </span>
                        ))}
                      </div>
                      {showAnswer[q.id] && (
                        <p className="text-xs text-brand-brown/70 mt-2 bg-yellow-50 rounded-lg p-2 border border-yellow-200">
                          📝 {q.explanation}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setShowAnswer((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="p-1.5 text-brand-brown/40 hover:text-brand-brown rounded-md" title="Lihat penjelasan">
                        {showAnswer[q.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => openQModal(q)}
                        className="p-1.5 text-brand-blue hover:bg-blue-50 rounded-md">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => removeQ(q.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: ACARA ── */}
        {tab === 'events' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-brand-brown">Daftar Acara</h2>
              <button onClick={() => openEventModal()}
                className="bg-brand-blue text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-all">
                <Plus size={16} /> Tambah Acara
              </button>
            </div>
            <div className="space-y-3">
              {events.length === 0 && <p className="text-center text-gray-400 italic py-6">Belum ada acara.</p>}
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                  <div className="bg-brand-lightbg text-center rounded-lg p-1.5 w-14 flex-shrink-0">
                    <span className="block text-[10px] font-black text-brand-pink uppercase">{ev.date?.slice(5,7)}</span>
                    <span className="block text-lg font-black text-brand-brown leading-none">{ev.date?.slice(8,10)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-brand-brown">{ev.name}</p>
                    <p className="text-xs text-brand-brown/60">{ev.date} • {ev.time}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEventModal(ev)} className="p-1.5 text-brand-blue hover:bg-blue-50 rounded-md"><Edit2 size={15} /></button>
                    <button onClick={() => removeEvent(ev.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: SOAL ── */}
      {modalOpen === 'question' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-brand-pink text-white p-4 flex justify-between items-center rounded-t-3xl z-10">
              <h3 className="font-black text-lg">{editingId ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
              <button onClick={resetModal} className="p-1 hover:bg-white/20 rounded-md"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {valErrors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={15} className="text-red-500" />
                    <p className="text-sm font-bold text-red-700">Harap perbaiki:</p>
                  </div>
                  <ul className="text-xs text-red-600 ml-5 list-disc space-y-0.5">
                    {valErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              {/* Level Dadu */}
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">
                  Level Soal (sesuai nilai dadu) <span className="text-red-500">*</span>
                </label>
                <select value={qForm.level} onChange={(e) => setQForm({ ...qForm, level: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-bold text-brand-brown">
                  {Object.entries(LEVEL_LABELS).map(([lv, label]) => (
                    <option key={lv} value={lv}>{label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-brand-brown/50 mt-1">
                  Level 1 = dadu 1–2 · Level 2 = dadu 3 · Level 3 = dadu 4 · Level 5 = dadu 5–6
                </p>
              </div>

              {/* Teks Soal */}
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">
                  Teks Soal <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={qForm.question}
                  onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                  rows={3}
                  placeholder="Contoh: Manakah output yang benar dari kode berikut?"
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium text-sm"
                />
              </div>

              {/* Toggle Blok Kode */}
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qForm.hasCode}
                    onChange={(e) => setQForm({ ...qForm, hasCode: e.target.checked })}
                    className="w-4 h-4 accent-brand-pink"
                  />
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-brand-brown" />
                    <span className="font-bold text-sm text-brand-brown">Soal memiliki blok kode (snippet)</span>
                  </div>
                </label>
                {qForm.hasCode && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-brand-brown/70 mb-1">
                      Blok Kode <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={qForm.codeSnippet}
                      onChange={(e) => setQForm({ ...qForm, codeSnippet: e.target.value })}
                      rows={6}
                      placeholder={"// Contoh:\nfunction hello() {\n  console.log('Hello!');\n}"}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-brand-pink focus:outline-none font-mono text-xs bg-gray-900 text-green-300"
                      style={{ fontFamily: 'Consolas, monospace' }}
                    />
                  </div>
                )}
              </div>

              {/* Opsi A, B, C */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-brand-brown">
                  Pilihan Jawaban <span className="text-red-500">*</span>
                </label>
                {['A', 'B', 'C'].map((k) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-black border-2
                      ${qForm.correctAnswer === k
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-white text-brand-brown border-gray-300'
                      }`}>{k}</span>
                    <input
                      value={qForm.options[k]}
                      onChange={(e) => setOption(k, e.target.value)}
                      placeholder={`Opsi ${k}`}
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium text-sm"
                    />
                    <input
                      type="radio"
                      name="correctAnswer"
                      value={k}
                      checked={qForm.correctAnswer === k}
                      onChange={() => setQForm({ ...qForm, correctAnswer: k })}
                      className="w-4 h-4 accent-green-500 flex-shrink-0"
                      title={`Tandai ${k} sebagai jawaban benar`}
                    />
                  </div>
                ))}
                <p className="text-[10px] text-brand-brown/50">🔘 Klik radio button untuk menandai jawaban yang benar.</p>
              </div>

              {/* Penjelasan */}
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">
                  Penjelasan Jawaban <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={qForm.explanation}
                  onChange={(e) => setQForm({ ...qForm, explanation: e.target.value })}
                  rows={2}
                  placeholder="Jelaskan mengapa jawaban tersebut benar..."
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium text-sm"
                />
              </div>

              {/* Tombol Simpan */}
              <div className="flex gap-3 pt-2">
                <button onClick={resetModal} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">
                  Batal
                </button>
                <button onClick={saveQ} disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold bg-brand-pink text-white hover:bg-pink-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ACARA ── */}
      {modalOpen === 'event' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="bg-brand-blue text-white p-4 flex justify-between items-center rounded-t-3xl">
              <h3 className="font-black text-lg">{editingId ? 'Edit Acara' : 'Tambah Acara'}</h3>
              <button onClick={resetModal} className="p-1 hover:bg-white/20 rounded-md"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {valErrors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                  <ul className="text-xs text-red-600 list-disc ml-4 space-y-0.5">
                    {valErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Nama Acara <span className="text-red-500">*</span></label>
                <input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-brand-brown mb-1">Tanggal <span className="text-red-500">*</span></label>
                  <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-brown mb-1">Jam <span className="text-red-500">*</span></label>
                  <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Deskripsi <span className="text-red-500">*</span></label>
                <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3} className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={resetModal} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Batal</button>
                <button onClick={saveEvent} disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold bg-brand-blue text-white hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
