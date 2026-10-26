// src/lib/firestore.js
// Fungsi CRUD untuk koleksi 'cards' dan 'events' di Firestore

import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

// ============================================
// CARDS
// ============================================

export const getCards = async () => {
  const snap = await getDocs(collection(db, 'cards'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addCard = (data) => addDoc(collection(db, 'cards'), data);

export const updateCard = (id, data) => updateDoc(doc(db, 'cards', id), data);

export const deleteCard = (id) => deleteDoc(doc(db, 'cards', id));

// ============================================
// EVENTS
// ============================================

// Ambil N event terdekat (default 3)
export const getEvents = async (limitCount = 3) => {
  const q = query(
    collection(db, 'events'),
    orderBy('date', 'asc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Ambil semua event (untuk "Tampilkan Lebih Banyak")
export const getAllEvents = async () => {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addEvent = (data) => addDoc(collection(db, 'events'), data);

export const updateEvent = (id, data) => updateDoc(doc(db, 'events', id), data);

export const deleteEvent = (id) => deleteDoc(doc(db, 'events', id));
