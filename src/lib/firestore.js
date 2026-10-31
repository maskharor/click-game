// src/lib/firestore.js
// Fungsi CRUD untuk koleksi 'questions' (soal pilgan) dan 'events' di Firestore

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
  where,
} from 'firebase/firestore';

// ============================================
// QUESTIONS (Soal Pilgan per Level Dadu)
// ============================================
// Schema:
//   level: number (1–5, sesuai DICE_LEVEL dari dadu)
//   question: string (teks soal)
//   hasCode: boolean (apakah ada blok kode)
//   codeSnippet: string (kode jika hasCode = true)
//   options: { A: string, B: string, C: string }
//   correctAnswer: 'A' | 'B' | 'C'
//   explanation: string

export const getQuestions = async () => {
  const q = query(collection(db, 'questions'), orderBy('level', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

/** Ambil soal per level dadu, kembalikan 1 secara acak */
export const getRandomQuestionByLevel = async (level) => {
  const q = query(collection(db, 'questions'), where('level', '==', level));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return docs[Math.floor(Math.random() * docs.length)];
};

export const addQuestion    = (data)      => addDoc(collection(db, 'questions'), data);
export const updateQuestion = (id, data)  => updateDoc(doc(db, 'questions', id), data);
export const deleteQuestion = (id)        => deleteDoc(doc(db, 'questions', id));

// ============================================
// EVENTS (Acara Komunitas — untuk Landing Page)
// ============================================

export const getEvents = async (limitCount = 3) => {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllEvents = async () => {
  const q = query(collection(db, 'events'), orderBy('date', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addEvent    = (data)      => addDoc(collection(db, 'events'), data);
export const updateEvent = (id, data)  => updateDoc(doc(db, 'events', id), data);
export const deleteEvent = (id)        => deleteDoc(doc(db, 'events', id));
