// src/pages/AdminDashboard.jsx
// Dashboard admin: CRUD untuk cards & events (dengan validasi)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import {
  getCards, addCard, updateCard, deleteCard,
  getAllEvents, addEvent, updateEvent, deleteEvent,
} from '../lib/firestore';
import {
  LogOut, Plus, Edit2, Trash2, X, Save,
  LayoutGrid, Calendar, AlertCircle, AlertTriangle,
} from 'lucide-react';

const EMPTY_CARD = { type: 'parent', text: '', options: { A: '', B: '', C: '' }, correctAnswer: 'A', explanation: '', challenges: { parent: '', child: '' } };
const EMPTY_EVENT = { name: '', date: '', time: '', description: '' };
const CARD_TYPES = ['parent', 'child', 'myth', 'challenge'];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('cards');
  const [cards, setCards] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cardForm, setCardForm] = useState(EMPTY_CARD);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();

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
      const [c, e] = await Promise.all([getCards(), getAllEvents()]);
      setCards(c);
      setEvents(e);
    } catch (err) {
      setError('Gagal memuat data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) loadData(); }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const resetModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setValidationErrors([]);
  };

  const openCardModal = (card = null) => {
    if (card) {
      setCardForm({
        ...EMPTY_CARD,
        ...card,
        options: card.options || { A: '', B: '', C: '' },
        challenges: card.challenges || { parent: '', child: '' },
      });
      setEditingId(card.id);
    } else {
      setCardForm({ ...EMPTY_CARD, options: { A: '', B: '', C: '' }, challenges: { parent: '', child: '' } });
      setEditingId(null);
    }
    setValidationErrors([]);
    setModalOpen('card');
  };

  const validateCard = () => {
    const errs = [];
    if (!cardForm.text.trim()) errs.push('Soal / Teks wajib diisi');
    if (cardForm.type === 'challenge') {
      if (!cardForm.challenges?.parent?.trim()) errs.push('Challenge Orang Tua wajib diisi');
      if (!cardForm.challenges?.child?.trim()) errs.push('Challenge Anak wajib diisi');
    } else if (cardForm.type === 'myth') {
      if (!cardForm.correctAnswer) errs.push('Kunci jawaban wajib dipilih');
      if (!cardForm.explanation?.trim()) errs.push('Penjelasan wajib diisi');
    } else {
      if (!cardForm.options?.A?.trim()) errs.push('Opsi A wajib diisi');
      if (!cardForm.options?.B?.trim()) errs.push('Opsi B wajib diisi');
      if (!cardForm.options?.C?.trim()) errs.push('Opsi C wajib diisi');
      if (!cardForm.correctAnswer) errs.push('Kunci jawaban wajib dipilih');
      if (!cardForm.explanation?.trim()) errs.push('Penjelasan wajib diisi');
    }
    return errs;
  };

  const saveCard = async () => {
    const errs = validateCard();
    if (errs.length > 0) { setValidationErrors(errs); return; }
    setValidationErrors([]);
    setSaving(true);
    try {
      let data;
      if (cardForm.type === 'challenge') {
        data = { type: 'challenge', text: cardForm.text.trim(), challenges: { parent: cardForm.challenges.parent.trim(), child: cardForm.challenges.child.trim() } };
      } else if (cardForm.type === 'myth') {
        data = { type: 'myth', text: cardForm.text.trim(), options: { A: 'MITOS', B: 'FAKTA' }, correctAnswer: cardForm.correctAnswer, explanation: cardForm.explanation.trim() };
      } else {
        data = { type: cardForm.type, text: cardForm.text.trim(), options: { A: cardForm.options.A.trim(), B: cardForm.options.B.trim(), C: cardForm.options.C.trim() }, correctAnswer: cardForm.correctAnswer, explanation: cardForm.explanation.trim() };
      }
      if (editingId) await updateCard(editingId, data);
      else await addCard(data);
      await loadData();
      resetModal();
    } catch (err) {
      alert('Gagal simpan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeCard = async (id) => {
    if (!confirm('Yakin hapus kartu ini?')) return;
    try { await deleteCard(id); await loadData(); }
    catch (err) { alert('Gagal hapus: ' + err.message); }
  };

  const openEventModal = (ev = null) => {
    setEventForm(ev ? { ...ev } : { ...EMPTY_EVENT });
    setEditingId(ev ? ev.id : null);
    setValidationErrors([]);
    setModalOpen('event');
  };

  const validateEvent = () => {
    const errs = [];
    if (!eventForm.name?.trim()) errs.push('Nama acara wajib diisi');
    if (!eventForm.date?.trim()) errs.push('Tanggal wajib diisi');
    if (!eventForm.time?.trim()) errs.push('Jam wajib diisi');
    if (!eventForm.description?.trim()) errs.push('Deskripsi wajib diisi');
    return errs;
  };

  const saveEvent = async () => {
    const errs = validateEvent();
    if (errs.length > 0) { setValidationErrors(errs); return; }
    setValidationErrors([]);
    setSaving(true);
    try {
      const data = {
        name: eventForm.name.trim(),
        date: eventForm.date,
        time: eventForm.time,
        description: eventForm.description.trim(),
      };
      if (editingId) await updateEvent(editingId, data);
      else await addEvent(data);
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

  const setOption = (key, val) => setCardForm({ ...cardForm, options: { ...cardForm.options, [key]: val } });
  const setChallenge = (key, val) => setCardForm({ ...cardForm, challenges: { ...(cardForm.challenges || {}), [key]: val } });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-lightbg">
        <p className="text-brand-brown font-bold">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-lightbg pb-12">
      <header className="bg-brand-brown text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black" style={{ fontFamily: 'Fredoka, sans-serif' }}>Admin Dashboard</h1>
            <p className="text-xs text-white/60">Login sebagai: {user?.email}</p>
          </div>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('cards')} className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${tab === 'cards' ? 'bg-brand-pink text-white shadow-lg' : 'bg-white text-brand-brown hover:bg-gray-100'}`}>
            <LayoutGrid size={16} /> Kartu ({cards.length})
          </button>
          <button onClick={() => setTab('events')} className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${tab === 'events' ? 'bg-brand-blue text-white shadow-lg' : 'bg-white text-brand-brown hover:bg-gray-100'}`}>
            <Calendar size={16} /> Acara ({events.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg mb-4 flex items-start gap-2">
            <AlertCircle size={18} className="text-red-500 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {tab === 'cards' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-brand-brown">Daftar Kartu</h2>
              <button onClick={() => openCardModal()} className="bg-brand-pink text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-pink-600 transition-all">
                <Plus size={16} /> Tambah Kartu
              </button>
            </div>
            <div className="space-y-3">
              {cards.length === 0 && <p className="text-center text-gray-400 italic py-6">Belum ada kartu.</p>}
              {cards.map((c) => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                  <span className="bg-brand-lightbg text-brand-brown text-xs font-black px-2 py-1 rounded-md uppercase flex-shrink-0">{c.type}</span>
                  <p className="flex-1 text-sm text-brand-brown">{c.text}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openCardModal(c)} className="p-1.5 text-brand-blue hover:bg-blue-50 rounded-md"><Edit2 size={16} /></button>
                    <button onClick={() => removeCard(c.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'events' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-brand-brown">Daftar Acara</h2>
              <button onClick={() => openEventModal()} className="bg-brand-blue text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-all">
                <Plus size={16} /> Tambah Acara
              </button>
            </div>
            <div className="space-y-3">
              {events.length === 0 && <p className="text-center text-gray-400 italic py-6">Belum ada acara.</p>}
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                  <div className="bg-brand-lightbg text-center rounded-lg p-1.5 w-14 flex-shrink-0">
                    <span className="block text-[10px] font-black text-brand-pink uppercase">{ev.date?.slice(5, 7)}</span>
                    <span className="block text-lg font-black text-brand-brown leading-none">{ev.date?.slice(8, 10)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-brand-brown">{ev.name}</p>
                    <p className="text-xs text-brand-brown/60">{ev.date} • {ev.time}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEventModal(ev)} className="p-1.5 text-brand-blue hover:bg-blue-50 rounded-md"><Edit2 size={16} /></button>
                    <button onClick={() => removeEvent(ev.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen === 'card' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-brand-pink text-white p-4 flex justify-between items-center rounded-t-3xl">
              <h3 className="font-black text-lg">{editingId ? 'Edit Kartu' : 'Tambah Kartu'}</h3>
              <button onClick={resetModal} className="p-1 hover:bg-white/20 rounded-md"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                  <div className="flex items-start gap-2 mb-1">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                    <p className="text-sm font-bold text-red-700">Semua field wajib diisi:</p>
                  </div>
                  <ul className="text-xs text-red-600 ml-6 list-disc space-y-0.5">
                    {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Tipe Kartu <span className="text-red-500">*</span></label>
                <select value={cardForm.type} onChange={(e) => setCardForm({ ...cardForm, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium">
                  {CARD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Soal / Teks <span className="text-red-500">*</span></label>
                <textarea value={cardForm.text} onChange={(e) => setCardForm({ ...cardForm, text: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium" />
              </div>
              {cardForm.type === 'challenge' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-brand-blue mb-1">Challenge Orang Tua <span className="text-red-500">*</span></label>
                    <textarea value={cardForm.challenges?.parent || ''} onChange={(e) => setChallenge('parent', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-pink mb-1">Challenge Anak <span className="text-red-500">*</span></label>
                    <textarea value={cardForm.challenges?.child || ''} onChange={(e) => setChallenge('child', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium" />
                  </div>
                </>
              )}
              {cardForm.type === 'myth' && (
                <>
                  <div className="bg-amber-50 border-l-4 border-brand-yellow p-3 rounded-lg">
                    <p className="text-xs text-brand-brown/80 font-medium">Untuk kartu Myth/Fact, opsi otomatis <b>MITOS</b> dan <b>FAKTA</b>. Tinggal pilih mana yang benar.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-brown mb-1">Jawaban Benar <span className="text-red-500">*</span></label>
                    <select value={cardForm.correctAnswer || 'A'} onChange={(e) => setCardForm({ ...cardForm, correctAnswer: e.target.value })} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium">
                      <option value="A">A - MITOS</option>
                      <option value="B">B - FAKTA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-brown mb-1">Penjelasan <span className="text-red-500">*</span></label>
                    <textarea value={cardForm.explanation || ''} onChange={(e) => setCardForm({ ...cardForm, explanation: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium" />
                  </div>
                </>
              )}
              {(cardForm.type === 'parent' || cardForm.type === 'child') && (
                <>
                  {['A', 'B', 'C'].map((k) => (
                    <div key={k}>
                      <label className="block text-sm font-bold text-brand-brown mb-1">Opsi {k} <span className="text-red-500">*</span></label>
                      <input value={cardForm.options?.[k] || ''} onChange={(e) => setOption(k, e.target.value)} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-bold text-brand-brown mb-1">Kunci Jawaban <span className="text-red-500">*</span></label>
                    <select value={cardForm.correctAnswer} onChange={(e) => setCardForm({ ...cardForm, correctAnswer: e.target.value })} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium">
                      {['A', 'B', 'C'].map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-brand-brown mb-1">Penjelasan <span className="text-red-500">*</span></label>
                    <textarea value={cardForm.explanation || ''} onChange={(e) => setCardForm({ ...cardForm, explanation: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium" />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={resetModal} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Batal</button>
                <button onClick={saveCard} disabled={saving} className="flex-1 py-3 rounded-xl font-bold bg-brand-pink text-white hover:bg-pink-600 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Save size={18} /> {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalOpen === 'event' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl">
            <div className="bg-brand-blue text-white p-4 flex justify-between items-center rounded-t-3xl">
              <h3 className="font-black text-lg">{editingId ? 'Edit Acara' : 'Tambah Acara'}</h3>
              <button onClick={resetModal} className="p-1 hover:bg-white/20 rounded-md"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                  <div className="flex items-start gap-2 mb-1">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5" />
                    <p className="text-sm font-bold text-red-700">Semua field wajib diisi:</p>
                  </div>
                  <ul className="text-xs text-red-600 ml-6 list-disc space-y-0.5">
                    {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Nama Acara <span className="text-red-500">*</span></label>
                <input value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-brand-brown mb-1">Tanggal <span className="text-red-500">*</span></label>
                  <input type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-brand-brown mb-1">Jam <span className="text-red-500">*</span></label>
                  <input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1">Deskripsi <span className="text-red-500">*</span></label>
                <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-brand-blue focus:outline-none font-medium" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={resetModal} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200">Batal</button>
                <button onClick={saveEvent} disabled={saving} className="flex-1 py-3 rounded-xl font-bold bg-brand-blue text-white hover:bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-50">
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
