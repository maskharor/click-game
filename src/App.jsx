// src/App.jsx
// Komponen root — routing antara Landing Page, Game Page, dan Admin

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route: hanya bisa diakses jika sudah login
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = belum tahu

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  // Masih cek status login
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-lightbg">
        <p className="text-brand-brown font-bold">Memeriksa akses...</p>
      </div>
    );
  }

  // Belum login → redirect ke halaman login
  if (!user) return <Navigate to="/admin/login" replace />;

  // Sudah login → tampilkan halaman
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publik */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/game" element={<GamePage />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
