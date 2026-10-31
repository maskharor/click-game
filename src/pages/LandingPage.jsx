// src/pages/LandingPage.jsx
// Landing page — Ular Tangga Edukatif
// Tema: Pembelajaran kolaboratif berbasis NHT (Numbered Heads Together)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dice5, Users, Trophy, BookOpen, Shield, Timer,
  Menu, X, ArrowRight, Layers,
  HelpCircle, Play, Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => navigate('/game');
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-brand-lightbg font-sans antialiased text-brand-brown min-h-screen">

      {/* NAVBAR */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <h1 className="text-2xl md:text-3xl font-black tracking-tight" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <span className="text-brand-pink">Ular</span>{' '}
                <span className="text-brand-blue">Tangga</span>{' '}
                <span className="text-brand-orange">Edukatif</span>
              </h1>
            </div>

            <div className="hidden md:flex space-x-8 items-center font-semibold text-brand-brown">
              <a href="#beranda" className="hover:text-brand-pink transition-colors">Beranda</a>
              <a href="#cara-main" className="hover:text-brand-blue transition-colors">Cara Main</a>
              <a href="#fitur" className="hover:text-brand-orange transition-colors">Fitur</a>
              <button
                onClick={handleStart}
                className="bg-brand-pink text-white px-6 py-2 rounded-full hover:bg-pink-500 shadow-md transition-all hover:-translate-y-0.5"
              >
                Mulai Bermain
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-brand-brown hover:text-brand-pink focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-2 text-center font-semibold">
              <a href="#beranda" onClick={closeMenu} className="block px-3 py-3 text-brand-brown hover:bg-brand-lightbg rounded-lg">Beranda</a>
              <a href="#cara-main" onClick={closeMenu} className="block px-3 py-3 text-brand-brown hover:bg-brand-lightbg rounded-lg">Cara Main</a>
              <a href="#fitur" onClick={closeMenu} className="block px-3 py-3 text-brand-brown hover:bg-brand-lightbg rounded-lg">Fitur</a>
              <button onClick={handleStart} className="w-full mt-2 bg-brand-pink text-white px-6 py-3 rounded-lg font-bold">
                Mulai Bermain
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="beranda" className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden relative">
        <div className="absolute top-20 left-10 w-24 h-24 bg-brand-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-brand-blue rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-10 left-1/2 w-40 h-40 bg-brand-pink rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-yellow/20 text-brand-brown font-bold text-sm mb-4 border border-brand-yellow/30">
            Inovasi Pembelajaran Kolaboratif
          </span>

          <h2 className="text-4xl md:text-6xl font-black text-brand-brown leading-tight mb-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Belajar Seru Lewat <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-brand-pink">Ular</span>{' '}
              <span className="relative z-10 text-brand-blue">Tangga</span>{' '}
              <span className="relative z-10 text-brand-orange">Edukatif</span>
              <span className="absolute bottom-2 left-0 w-full h-4 bg-brand-yellow/40 -z-0 transform -rotate-1" />
            </span>
          </h2>

          <p className="text-xl md:text-2xl font-medium mb-10 text-brand-brown/80">
            "Belajar bersama, menang bersama. <br className="hidden md:block" />
            Kolaborasi nyata, bukan kompetisi semu."
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleStart}
              className="bg-brand-pink text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-pink-200 hover:bg-pink-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Dice5 size={22} />
              Mulai Bermain Sekarang
            </button>
            <a
              href="#cara-main"
              className="bg-white text-brand-blue border-2 border-brand-blue font-bold text-lg px-8 py-4 rounded-full hover:bg-brand-blue hover:text-white transition-all duration-300"
            >
              Pelajari Cara Main
            </a>
          </div>
        </div>
      </section>

      {/* CARA MAIN */}
      <section id="cara-main" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-brand-brown mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Cara Bermain</h3>
            <p className="text-lg text-brand-brown/70 max-w-2xl mx-auto">
              Permainan papan ular tangga yang dipadukan dengan kuis berlevel dan kolaborasi tim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 text-center">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-brand-pink flex items-center justify-center mb-6 shadow-lg shadow-pink-200">
                <div className="bg-white rounded-2xl p-4">
                  <Dice5 size={48} className="text-brand-pink" />
                </div>
              </div>
              <h4 className="text-2xl font-black mb-2">1. Roll Dadu</h4>
              <p className="text-brand-brown/70">Lempar dadu untuk menentukan level soal. Level lebih tinggi, poin lebih besar!</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-brand-blue flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                <div className="bg-white rounded-2xl p-4">
                  <HelpCircle size={48} className="text-brand-blue" />
                </div>
              </div>
              <h4 className="text-2xl font-black mb-2">2. TAKE atau PASS</h4>
              <p className="text-brand-brown/70">Pilih TAKE untuk menjawab soal, atau PASS untuk rebutan dengan tim lain.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-brand-orange flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                <div className="bg-white rounded-2xl p-4">
                  <Users size={48} className="text-brand-orange" />
                </div>
              </div>
              <h4 className="text-2xl font-black mb-2">3. NHT & Maju!</h4>
              <p className="text-brand-brown/70">Diskusikan dalam tim, guru memanggil nomor acak. Benar? Bidak maju!</p>
            </div>
          </div>

          <div id="fitur" className="bg-brand-lightbg rounded-3xl p-8 md:p-12 shadow-inner border border-orange-100">
            <h4 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Fitur Unggulan
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-brand-blue p-6 text-white rounded-2xl flex flex-col items-center text-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1">
                <Layers size={36} className="mb-3 opacity-90" />
                <h5 className="font-black text-base mb-1">Soal Berlevel</h5>
                <p className="text-xs opacity-90">5 level soal sesuai nilai dadu</p>
              </div>
              <div className="bg-brand-pink p-6 text-white rounded-2xl flex flex-col items-center text-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1">
                <Users size={36} className="mb-3 opacity-90" />
                <h5 className="font-black text-base mb-1">NHT</h5>
                <p className="text-xs opacity-90">Numbered Heads Together</p>
              </div>
              <div className="bg-brand-yellow p-6 text-brand-brown rounded-2xl flex flex-col items-center text-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1">
                <Timer size={36} className="mb-3 opacity-90" />
                <h5 className="font-black text-base mb-1">Timer</h5>
                <p className="text-xs opacity-90">Waktu menyesuaikan level</p>
              </div>
              <div className="bg-brand-brown p-6 text-white rounded-2xl flex flex-col items-center text-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1">
                <Shield size={36} className="mb-3 opacity-90" />
                <h5 className="font-black text-base mb-1">Kartu Kebal</h5>
                <p className="text-xs opacity-90">Hadiah dari sistem rebutan</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEKANISME */}
      <section className="py-20 bg-brand-yellow/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-orange font-black uppercase tracking-wider text-sm">Mekanisme Permainan</span>
            <h3 className="text-3xl md:text-4xl font-black text-brand-brown mt-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Lengkap & Seru
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-brand-blue">
              <div className="w-14 h-14 bg-blue-100 text-brand-blue rounded-2xl flex items-center justify-center mb-4">
                <Play size={28} />
              </div>
              <h4 className="text-xl font-black mb-2">TAKE / PASS</h4>
              <p className="text-brand-brown/70 text-sm">
                Pilih menjawab soal sendiri (TAKE) atau menyerahkannya ke tim lain untuk sistem rebutan (PASS). Strategi jadi kunci!
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-brand-pink">
              <div className="w-14 h-14 bg-pink-100 text-brand-pink rounded-2xl flex items-center justify-center mb-4">
                <BookOpen size={28} />
              </div>
              <h4 className="text-xl font-black mb-2">Buka Buku 1x</h4>
              <p className="text-brand-brown/70 text-sm">
                Setiap tim punya 1 kesempatan membuka buku saat menjawab. Gunakan dengan bijak!
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-brand-orange">
              <div className="w-14 h-14 bg-orange-100 text-brand-orange rounded-2xl flex items-center justify-center mb-4">
                <Trophy size={28} />
              </div>
              <h4 className="text-xl font-black mb-2">Checkpoint 10-20-30</h4>
              <p className="text-brand-brown/70 text-sm">
                Setiap kelipatan 10, ada checkpoint istimewa. Jawab benar, dapat bonus, jawab salah, mundur.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl border-t-8 border-brand-yellow">
              <div className="w-14 h-14 bg-amber-100 text-brand-yellow rounded-2xl flex items-center justify-center mb-4">
                <Sparkles size={28} />
              </div>
              <h4 className="text-xl font-black mb-2">Ular & Tangga</h4>
              <p className="text-brand-brown/70 text-sm">
                Mendarat di tangga? Naik. Kena ular? Turun. Tapi dengan kolaborasi, kalian bisa bangkit lagi!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAWAH */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h3 className="text-3xl md:text-4xl font-black text-brand-brown mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Siap Memulai Petualangan Belajar?
          </h3>
          <p className="text-lg text-brand-brown/70 mb-8">
            Tidak perlu login, tidak perlu daftar. Langsung mainkan bersama tim!
          </p>
          <button
            onClick={handleStart}
            className="bg-brand-pink text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg shadow-pink-200 hover:bg-pink-500 hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2"
          >
            Mulai Bermain <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brand-brown text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <span className="text-brand-pink">Ular</span>{' '}
                <span className="text-brand-blue">Tangga</span>{' '}
                <span className="text-brand-orange">Edukatif</span>
              </h2>
              <p className="text-gray-300 text-sm max-w-sm">
                Permainan papan digital berbasis kolaborasi untuk pembelajaran yang lebih bermakna.
              </p>
            </div>
            <div>
              <h4 className="text-base font-black mb-4 text-brand-yellow">Navigasi</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#beranda" className="hover:text-white transition-colors">Beranda</a></li>
                <li><a href="#cara-main" className="hover:text-white transition-colors">Cara Main</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Fitur</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base font-black mb-4 text-brand-blue">Info</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><span className="block">Dikembangkan untuk lomba edukasi</span></li>
                <li><span className="block mt-4 text-xs opacity-70">© 2024 Ular Tangga Edukatif</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-xs text-gray-400">
            <p>Dibuat dengan sepenuh hati untuk pendidikan Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
