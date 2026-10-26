// src/pages/LandingPage.jsx
// Landing page CLICK! — Phygital Board Game
// Warna: Pink + Orange + Cyan (theme 1B), Font logo: Fredoka (theme 2A)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dices, Layers, MessageCircle,
  User, HelpCircle, AlertCircle, ShieldAlert,
  BookOpen, GraduationCap, ArrowRight,
  Smartphone, ShieldCheck, Calendar, MapPin, Globe,
  Camera, Send, PlayCircle,
  Menu, X, ArrowLeft,
} from 'lucide-react';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = () => navigate('/game');
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-brand-lightbg font-sans antialiased text-brand-brown min-h-screen">

      {/* ==================== NAVBAR ==================== */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <h1 className="text-4xl font-black tracking-tighter" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <span className="text-brand-pink">C</span>
                <span className="text-brand-brown">L</span>
                <span className="text-brand-blue">i</span>
                <span className="text-brand-yellow">C</span>
                <span className="text-brand-orange">K</span>
                <span className="text-brand-pink">!</span>
              </h1>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-8 items-center font-semibold text-brand-brown">
              <a href="#beranda" className="hover:text-brand-pink transition-colors">Beranda</a>
              <a href="#tentang-game" className="hover:text-brand-blue transition-colors">Tentang Game</a>
              <a href="#resources" className="hover:text-brand-orange transition-colors">Resources</a>
              <a href="#komunitas" className="hover:text-brand-pink transition-colors">Komunitas</a>
              <button
                onClick={handleStartGame}
                className="bg-brand-pink text-white px-6 py-2 rounded-full hover:bg-pink-500 shadow-md transition-all hover:-translate-y-0.5"
              >
                Mulai Main
              </button>
            </div>

            {/* Mobile menu button */}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
            <div className="px-4 pt-2 pb-6 space-y-2 text-center font-semibold">
              <a href="#beranda" onClick={closeMenu} className="block px-3 py-3 text-brand-brown hover:bg-brand-lightbg rounded-lg">Beranda</a>
              <a href="#tentang-game" onClick={closeMenu} className="block px-3 py-3 text-brand-brown hover:bg-brand-lightbg rounded-lg">Tentang Game</a>
              <a href="#resources" onClick={closeMenu} className="block px-3 py-3 text-brand-brown hover:bg-brand-lightbg rounded-lg">Resources</a>
              <a href="#komunitas" onClick={closeMenu} className="block px-3 py-3 text-brand-brown hover:bg-brand-lightbg rounded-lg">Komunitas</a>
              <button
                onClick={handleStartGame}
                className="w-full mt-2 bg-brand-pink text-white px-6 py-3 rounded-lg font-bold"
              >
                Mulai Main
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ==================== HERO ==================== */}
      <section id="beranda" className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 overflow-hidden relative">
        {/* Decorative shapes */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-brand-yellow rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" />
        <div className="absolute top-40 right-10 w-32 h-32 bg-brand-blue rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-10 left-1/2 w-40 h-40 bg-brand-pink rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-yellow/20 text-brand-brown font-bold text-sm mb-4 border border-brand-yellow/30">
            ⭐ Inovasi Phygital Board Game ⭐
          </span>

          <h2 className="text-4xl md:text-6xl font-black text-brand-brown leading-tight mb-6" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Hai, Parents! <br />Selamat datang di <br />
            <span className="relative inline-block mt-2">
              <span className="relative z-10 text-brand-pink">C</span>
              <span className="relative z-10 text-brand-brown">L</span>
              <span className="relative z-10 text-brand-blue">i</span>
              <span className="relative z-10 text-brand-yellow">C</span>
              <span className="relative z-10 text-brand-orange">K</span>
              <span className="relative z-10 text-brand-pink">!</span> Community
              <span className="absolute bottom-2 left-0 w-full h-4 bg-brand-yellow/40 -z-0 transform -rotate-1" />
            </span>
          </h2>

          <p className="text-xl md:text-2xl font-medium mb-10 text-brand-brown/80">
            "Less scrolling, more connecting. <br className="hidden md:block" /> Less controlling, more understanding!"
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleStartGame}
              className="bg-brand-pink text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg shadow-pink-200 hover:bg-pink-500 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Dices size={22} />
              Mulai Main Sekarang!
            </button>
            <a
              href="#tentang-game"
              className="bg-white text-brand-blue border-2 border-brand-blue font-bold text-lg px-8 py-4 rounded-full hover:bg-brand-blue hover:text-white transition-all duration-300"
            >
              Pelajari Cara Main
            </a>
          </div>
        </div>
      </section>

      {/* ==================== CARA BERMAIN ==================== */}
      <section id="tentang-game" className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-black text-brand-brown mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>Cara Bermain</h3>
            <p className="text-lg text-brand-brown/70 max-w-2xl mx-auto">Kumpulkan orang-orang tersayang dan mulailah keseruannya dengan 3 langkah mudah!</p>
          </div>

          {/* 3 Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-brand-pink flex items-center justify-center mb-6 shadow-lg shadow-pink-200">
                <div className="bg-white rounded-2xl p-4">
                  <Dices size={48} className="text-brand-pink" />
                </div>
              </div>
              <h4 className="text-2xl font-black mb-2">1. Roll the Dice</h4>
              <p className="text-brand-brown/70">Lempar dadu dan jalankan bidakmu di atas papan permainan fisik.</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-brand-blue flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                <div className="bg-white rounded-2xl p-4">
                  <Layers size={48} className="text-brand-blue" />
                </div>
              </div>
              <h4 className="text-2xl font-black mb-2">2. Pick a Card</h4>
              <p className="text-brand-brown/70">Ambil kartu sesuai dengan warna kotak tempat bidakmu berhenti.</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-brand-orange flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                <div className="bg-white rounded-2xl p-4">
                  <MessageCircle size={48} className="text-brand-orange" />
                </div>
              </div>
              <h4 className="text-2xl font-black mb-2">3. Connect & Share!</h4>
              <p className="text-brand-brown/70">Jawab pertanyaan atau lakukan tantangan bersama untuk membangun koneksi.</p>
            </div>
          </div>

          {/* Card Types */}
          <div className="bg-brand-lightbg rounded-3xl p-8 md:p-12 shadow-inner border border-orange-100">
            <h4 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ fontFamily: 'Fredoka, sans-serif' }}>Kenali Kartu-Kartunya</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-brand-blue p-6 text-white text-center rounded-2xl flex flex-col justify-center items-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1 hover:rotate-1">
                <User size={40} className="mb-3 opacity-90" />
                <h5 className="font-black text-lg leading-tight">Parent's<br />Question</h5>
              </div>
              {/* Card 2 */}
              <div className="bg-brand-pink p-6 text-white text-center rounded-2xl flex flex-col justify-center items-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1 hover:rotate-1">
                <HelpCircle size={40} className="mb-3 opacity-90" />
                <h5 className="font-black text-lg leading-tight">Child's<br />Question</h5>
              </div>
              {/* Card 3 */}
              <div className="bg-brand-yellow p-6 text-brand-brown text-center rounded-2xl flex flex-col justify-center items-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1 hover:rotate-1">
                <AlertCircle size={40} className="mb-3 opacity-90" />
                <h5 className="font-black text-lg leading-tight">Myth<br />OR Fact</h5>
              </div>
              {/* Card 4 */}
              <div className="bg-brand-brown p-6 text-white text-center rounded-2xl flex flex-col justify-center items-center h-48 border-4 border-white shadow-md transition-all hover:-translate-y-1 hover:rotate-1">
                <ShieldAlert size={40} className="mb-3 opacity-90" />
                <h5 className="font-black text-lg leading-tight">Chall-<br />enge!</h5>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== RESOURCES ==================== */}
      <section id="resources" className="py-20 bg-brand-yellow/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-brand-orange font-black uppercase tracking-wider text-sm">Menjembatani Fisik dan Digital</span>
            <h3 className="text-3xl md:text-4xl font-black text-brand-brown mt-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>Fitur Phygital</h3>
            <p className="text-lg text-brand-brown/70 mt-4 max-w-2xl mx-auto">Tingkatkan pengalaman bermain dengan sumber daya digital kami yang terintegrasi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Rulebook */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border-t-8 border-brand-blue flex flex-col items-start transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-blue-100 text-brand-blue rounded-2xl flex items-center justify-center mb-6">
                <BookOpen size={32} />
              </div>
              <h4 className="text-2xl font-black mb-3">Digital Rulebook</h4>
              <p className="text-brand-brown/70 mb-8 flex-grow">Akses aturan permainan secara interaktif kapan saja. Pelajari cara main dengan mudah melalui gawai Anda.</p>
              <button className="text-brand-blue font-bold flex items-center hover:text-blue-700 transition-colors">
                Buka Rulebook <ArrowRight size={16} className="ml-2" />
              </button>
            </div>

            {/* Parent Module */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border-t-8 border-brand-orange flex flex-col items-start transition-transform hover:-translate-y-2 duration-300">
              <div className="w-16 h-16 bg-orange-100 text-brand-orange rounded-2xl flex items-center justify-center mb-6">
                <GraduationCap size={32} />
              </div>
              <h4 className="text-2xl font-black mb-3">Digital Parent Module</h4>
              <p className="text-brand-brown/70 mb-8 flex-grow">Panduan komprehensif bagi orang tua untuk menavigasi dunia digital anak. Tips, trik, dan insight psikologis.</p>
              <button className="text-brand-orange font-bold flex items-center hover:text-orange-700 transition-colors">
                Akses Modul <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== KOMUNITAS ==================== */}
      <section id="komunitas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-black text-brand-brown mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>Komunitas CLICK!</h3>
              <p className="text-lg text-brand-brown/70">Tumbuh Bersama di Setiap Langkah</p>
            </div>
            <button className="hidden md:block bg-brand-lightbg text-brand-brown font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
              Gabung Forum Discord
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Insight */}
            <div className="lg:col-span-2">
              <h4 className="text-2xl font-black mb-6 border-b-2 border-brand-pink inline-block pb-2">Insight Terbaru</h4>
              <div className="space-y-6">
                <div className="group flex flex-col sm:flex-row bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="sm:w-1/3 bg-brand-lightbg flex items-center justify-center p-8">
                    <Smartphone size={56} className="text-brand-pink group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6 sm:w-2/3 flex flex-col justify-center">
                    <span className="text-xs font-black text-brand-blue uppercase mb-2">Tips Parenting</span>
                    <h5 className="text-xl font-black mb-2 group-hover:text-brand-pink transition-colors">Menyeimbangkan "Screen Time" Saat Liburan</h5>
                    <p className="text-brand-brown/70 text-sm">Bagaimana cara memastikan anak tetap aktif secara fisik saat mereka memiliki lebih banyak waktu luang di rumah...</p>
                  </div>
                </div>

                <div className="group flex flex-col sm:flex-row bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="sm:w-1/3 bg-brand-lightbg flex items-center justify-center p-8">
                    <ShieldCheck size={56} className="text-brand-yellow group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-6 sm:w-2/3 flex flex-col justify-center">
                    <span className="text-xs font-black text-brand-orange uppercase mb-2">Keamanan Siber</span>
                    <h5 className="text-xl font-black mb-2 group-hover:text-brand-orange transition-colors">Mengenali Bahaya "Cyberbullying" Sejak Dini</h5>
                    <p className="text-brand-brown/70 text-sm">Tanda-tanda yang harus diperhatikan orang tua jika anak mengalami perundungan di dunia maya...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acara */}
            <div>
              <h4 className="text-2xl font-black mb-6 border-b-2 border-brand-blue inline-block pb-2">Acara Mendatang</h4>
              <div className="bg-brand-lightbg rounded-2xl p-6 border border-blue-50">
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <div className="bg-white text-center rounded-xl p-2 w-16 shadow-sm border border-gray-100 flex-shrink-0">
                      <span className="block text-xs font-black text-brand-pink uppercase">NOV</span>
                      <span className="block text-xl font-black text-brand-brown">12</span>
                    </div>
                    <div className="ml-4">
                      <h6 className="font-black text-base leading-tight mb-1">Webinar: Komunikasi Asertif dengan Anak</h6>
                      <span className="text-xs text-brand-brown/60 flex items-center"><Calendar size={12} className="mr-1" /> 19:00 WIB</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-white text-center rounded-xl p-2 w-16 shadow-sm border border-gray-100 flex-shrink-0">
                      <span className="block text-xs font-black text-brand-blue uppercase">NOV</span>
                      <span className="block text-xl font-black text-brand-brown">25</span>
                    </div>
                    <div className="ml-4">
                      <h6 className="font-black text-base leading-tight mb-1">Play Session & Kopdar Surabaya</h6>
                      <span className="text-xs text-brand-brown/60 flex items-center"><MapPin size={12} className="mr-1" /> UNESA Ketintang</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-white text-center rounded-xl p-2 w-16 shadow-sm border border-gray-100 flex-shrink-0">
                      <span className="block text-xs font-black text-brand-yellow uppercase">DES</span>
                      <span className="block text-xl font-black text-brand-brown">05</span>
                    </div>
                    <div className="ml-4">
                      <h6 className="font-black text-base leading-tight mb-1">Peluncuran Ekspansi Kartu Baru</h6>
                      <span className="text-xs text-brand-brown/60 flex items-center"><Globe size={12} className="mr-1" /> Live Camera</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-brand-brown text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-black tracking-tighter mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                <span className="text-brand-pink">C</span>
                <span className="text-white">L</span>
                <span className="text-brand-blue">i</span>
                <span className="text-brand-yellow">C</span>
                <span className="text-brand-orange">K</span>
                <span className="text-brand-pink">!</span>
              </h2>
              <p className="text-gray-300 mb-6 max-w-sm">A Phygital Board Game Innovation for Strengthening Digital Parenting and Parent-Child Connection.</p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-pink transition-colors"><Camera size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-blue transition-colors"><Send size={18} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-orange transition-colors"><PlayCircle size={18} /></a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black mb-4 text-brand-yellow">Navigasi</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#beranda" className="hover:text-white transition-colors">Beranda</a></li>
                <li><a href="#tentang-game" className="hover:text-white transition-colors">Cara Bermain</a></li>
                <li><a href="#resources" className="hover:text-white transition-colors">Modul & Aturan</a></li>
                <li><a href="#komunitas" className="hover:text-white transition-colors">Blog & Acara</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-black mb-4 text-brand-blue">Dukungan</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
                <li><span className="block mt-4 text-xs">Developed by CLICK! Team (UNESA & UNAIR)</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CLICK! Phygital Board Game. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
