// src/pages/AdminLogin.jsx
// Halaman login admin untuk akses dashboard CRUD

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, Mail, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      let message = 'Login gagal. Coba lagi.';
      if (err.code === 'auth/invalid-email') message = 'Format email tidak valid.';
      else if (err.code === 'auth/user-not-found') message = 'Akun tidak ditemukan.';
      else if (err.code === 'auth/wrong-password') message = 'Password salah.';
      else if (err.code === 'auth/invalid-credential') message = 'Email atau password salah.';
      else if (err.code === 'auth/too-many-requests') message = 'Terlalu banyak percobaan. Coba lagi nanti.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-lightbg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-brand-brown/70 hover:text-brand-pink font-bold text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        {/* Card Login */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-t-8 border-brand-pink">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-pink-100 text-brand-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-black text-brand-brown">Admin Login</h1>
            <p className="text-sm text-brand-brown/60 mt-1">Akses khusus pengelola CLICK!</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@click.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium text-brand-brown"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-pink focus:outline-none font-medium text-brand-brown"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-black text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-brand-pink hover:bg-pink-600 hover:-translate-y-0.5 shadow-lg shadow-pink-200'
              }`}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-brand-brown/50 mt-6">
          Halaman ini hanya untuk admin. Publik tidak perlu login untuk bermain.
        </p>
      </div>
    </div>
  );
}
