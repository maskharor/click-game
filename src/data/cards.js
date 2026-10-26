// src/data/cards.js
// Kumpulan kartu untuk semua kategori game

import { User, HelpCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export const CARD_TYPES = {
  parent: {
    label: "Parent's Question",
    bg: 'bg-cyan-400',
    border: 'border-cyan-300',
    textColor: 'text-cyan-800',
    iconColor: 'text-cyan-700',
  },
  child: {
    label: "Child's Question",
    bg: 'bg-pink-400',
    border: 'border-pink-300',
    textColor: 'text-pink-800',
    iconColor: 'text-pink-700',
  },
  myth: {
    label: 'Myth OR Fact',
    bg: 'bg-amber-400',
    border: 'border-amber-300',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-700',
  },
  challenge: {
    label: 'Challenge!',
    bg: 'bg-red-700',
    border: 'border-red-600',
    textColor: 'text-red-100',
    iconColor: 'text-red-200',
  },
};

export const CARDS = [
  // ==========================================
  // === PARENT'S QUESTION (Pilihan Ganda A, B, C) ===
  // ==========================================
  {
    id: 'p1', type: 'parent',
    text: 'Mengapa orang tua perlu mengetahui konten yang dikonsumsi anak di internet?',
    options: {
      A: 'Agar bisa memarahi anak jika salah memilih konten.',
      B: 'Untuk memastikan konten sesuai usia dan melindungi anak dari bahaya digital.',
      C: 'Supaya orang tua bisa ikut menikmati konten yang sama.'
    },
    correctAnswer: 'B',
    explanation: 'Tujuan utama pendampingan (parental mediation) adalah memastikan konten sesuai usia anak dan melindungi mereka dari risiko seperti konten kekerasan atau predator online, bukan untuk memarahi.'
  },
  {
    id: 'p2', type: 'parent',
    text: 'Bagaimana cara menentukan batasan waktu bermain gadget yang ideal untuk anak sesuai usianya?',
    options: {
      A: 'Menyamakan aturan untuk semua anak di bawah 18 tahun, yaitu maksimal 5 jam.',
      B: 'Membiarkan anak menentukan sendiri waktunya agar ia belajar mandiri.',
      C: 'Mendiskusikan aturan bersama anak dan mengacu pada rekomendasi ahli (misal 1-2 jam untuk usia 7-11 tahun).'
    },
    correctAnswer: 'C',
    explanation: 'Rekomendasi ahli menyarankan 1-2 jam screen time hiburan untuk usia 7-11 tahun. Yang terpenting, aturan disepakati bersama agar anak merasa dilibatkan dan lebih patuh.'
  },
  {
    id: 'p3', type: 'parent',
    text: 'Apa yang akan kamu lakukan jika mengetahui anakmu menerima pesan tidak menyenangkan dari orang asing di internet?',
    options: {
      A: 'Memblokir nomor tersebut, menenangkan anak, dan melaporkan akunnya jika perlu.',
      B: 'Menyuruh anak membalas pesan itu dengan kata-kata kasar.',
      C: 'Mengabaikannya karena mungkin hanya iseng belaka.'
    },
    correctAnswer: 'A',
    explanation: 'Respons yang tepat adalah blokir akun, tenangkan anak, dan laporkan. Hindari meminta anak membalas karena bisa memperkeruh situasi. Pastikan anak merasa aman untuk bercerita.'
  },
  {
    id: 'p4', type: 'parent',
    text: 'Apakah kamu sudah tahu aplikasi atau game apa saja yang ada di perangkat anakmu? Sebutkan salah satunya!',
    options: {
      A: 'Tidak perlu tahu, yang penting anak tidak mengganggu saya.',
      B: 'Ya, saya tahu dan sesekali ikut mencoba/main bersama anak.',
      C: 'Saya baru tahu kalau anak bilang saja.'
    },
    correctAnswer: 'B',
    explanation: 'Mengetahui dan mencoba aplikasi yang dimainkan anak adalah bentuk "Active Mediation" — ini membangun kedekatan sekaligus memungkinkan orang tua memantau konten secara alami.'
  },
  {
    id: 'p5', type: 'parent',
    text: 'Bagaimana cara kamu membangun rasa percaya dengan anak agar ia mau terbuka tentang aktivitas digitalnya?',
    options: {
      A: 'Sering mengintip HP anak secara diam-diam.',
      B: 'Memberi ceramah panjang setiap kali anak menggunakan gadget.',
      C: 'Mendengarkan tanpa menghakimi dan menjadi contoh penggunaan gadget yang sehat.'
    },
    correctAnswer: 'C',
    explanation: 'Kunci komunikasi terbuka adalah mendengarkan tanpa menghakimi (active listening) dan memberi teladan. Anak lebih cenderung terbuka pada orang tua yang mereka percaya.'
  },

  // ==========================================
  // === CHILD'S QUESTION (Pilihan Ganda A, B, C) ===
  // ==========================================
  {
    id: 'c1', type: 'child',
    text: 'Apa bahayanya membagikan informasi pribadi (seperti alamat rumah atau nomor HP) di internet?',
    options: {
      A: 'Informasi pribadi bisa disalahgunakan orang jahat untuk penipuan atau bahaya nyata.',
      B: 'Tidak apa-apa, asalkan hanya dibagikan di grup kelas.',
      C: 'Tidak berbahaya sama sekali selama kita punya banyak teman online.'
    },
    correctAnswer: 'A',
    explanation: 'Data pribadi seperti alamat dan nomor HP adalah "harta karun" bagi penipu. Sekali tersebar di internet, jejaknya sulit dihapus. Selalu jaga privasi, bahkan di grup tertutup.'
  },
  {
    id: 'c2', type: 'child',
    text: 'Pernahkah kamu melihat konten yang membuatmu tidak nyaman? Apa yang kamu lakukan saat itu?',
    options: {
      A: 'Diamkan saja dan menontonnya sampai habis.',
      B: 'Tutup kontennya dan ceritakan kepada orang tua atau orang dewasa yang dipercaya.',
      C: 'Bagikan ke teman-teman agar mereka juga tahu.'
    },
    correctAnswer: 'B',
    explanation: 'Jika menemukan konten yang tidak nyaman, segera tutup (block/report) dan ceritakan pada orang tua atau guru. Jangan disebarkan, karena bisa memperluas dampak negatifnya.'
  },
  {
    id: 'c3', type: 'child',
    text: 'Siapa saja yang boleh kamu tambahkan sebagai teman di media sosial? Mengapa?',
    options: {
      A: 'Semua orang yang mengirim permintaan pertemanan, agar populer.',
      B: 'Orang asing yang fotonya keren dan banyak followers.',
      C: 'Hanya orang yang aku kenal di dunia nyata dan disetujui orang tua.'
    },
    correctAnswer: 'C',
    explanation: 'Teman di dunia maya sebaiknya adalah orang yang kita kenal di dunia nyata. Ini mencegah interaksi dengan akun palsu (fake account) atau predator online.'
  },
  {
    id: 'c4', type: 'child',
    text: 'Apa yang kamu rasakan ketika orang tua membatasi waktu bermain gadget? Ceritakan!',
    options: {
      A: 'Sangat kesal dan merasa tidak dipercaya.',
      B: 'Biasa saja, karena aku tahu itu untuk kebaikanku dan tetap bisa bermain di waktu lain.',
      C: 'Sedih, tapi aku akan tetap main diam-diam.'
    },
    correctAnswer: 'B',
    explanation: 'Perasaan kesal itu wajar, tapi coba pahami bahwa aturan dibuat karena orang tua peduli. Diskusikan jika aturannya terlalu ketat — komunikasi lebih baik daripada melanggar diam-diam.'
  },
  {
    id: 'c5', type: 'child',
    text: 'Bagaimana cara kamu membedakan berita yang benar dengan berita hoax di internet?',
    options: {
      A: 'Percaya saja jika sudah dikirim oleh banyak orang di grup WA.',
      B: 'Cek sumbernya (website resmi/berita terpercaya) dan bandingkan dengan berita lain.',
      C: 'Percaya jika judulnya heboh dan bikin kaget.'
    },
    correctAnswer: 'B',
    explanation: 'Ciri berita hoax adalah judul heboh (clickbait) dan sumber tidak jelas. Selalu cek sumber terpercaya dan bandingkan minimal dari 2-3 media sebelum mempercayai dan menyebarkannya.'
  },

  // ==========================================
  // === MYTH OR FACT (Pilihan: MITOS / FAKTA) ===
  // ==========================================
  {
    id: 'm1', type: 'myth',
    text: 'Anak yang sering bermain game pasti memiliki kemampuan sosial yang lebih buruk.',
    options: {
      A: 'MITOS',
      B: 'FAKTA'
    },
    correctAnswer: 'A',
    explanation: 'MITOS. Banyak game (terutama multiplayer/co-op) justru melatih komunikasi, kerja sama tim, dan strategi sosial. Dampak negatif muncul jika bermain berlebihan tanpa pengawasan.'
  },
  {
    id: 'm2', type: 'myth',
    text: 'Bermain game bersama dapat meningkatkan hubungan antara orang tua dan anak.',
    options: {
      A: 'MITOS',
      B: 'FAKTA'
    },
    correctAnswer: 'B',
    explanation: 'FAKTA. Bermain bersama menciptakan ruang bonding yang menyenangkan, membuka komunikasi dua arah, dan membuat orang tua memahami dunia anak secara lebih natural.'
  },
  {
    id: 'm3', type: 'myth',
    text: 'Internet hanya membawa dampak negatif bagi anak-anak.',
    options: {
      A: 'MITOS',
      B: 'FAKTA'
    },
    correctAnswer: 'A',
    explanation: 'MITOS. Internet memiliki banyak manfaat edukatif (belajar, riset, kreativitas). Kuncinya adalah pendampingan yang tepat, bukan menghindari teknologi sepenuhnya.'
  },
  {
    id: 'm4', type: 'myth',
    text: 'Anak di bawah 13 tahun diperbolehkan mendaftar ke semua media sosial.',
    options: {
      A: 'MITOS',
      B: 'FAKTA'
    },
    correctAnswer: 'A',
    explanation: 'MITOS. Sebagian besar platform media sosial (Instagram, TikTok, Facebook) menetapkan batas usia minimal 13 tahun sesuai regulasi COPPA. Mendaftar sebelum usia itu melanggar Ketentuan Layanan mereka.'
  },
  {
    id: 'm5', type: 'myth',
    text: 'Memasang foto selfie di internet tidak berbahaya selama profilnya di-private.',
    options: {
      A: 'MITOS',
      B: 'FAKTA'
    },
    correctAnswer: 'A',
    explanation: 'MITOS. Sekali foto diunggah, foto itu bisa diunduh dan disebarkan oleh siapapun yang bisa melihatnya (termasuk "teman"). Privasi akun bukan jaminan 100% — tetap bijak dalam mengunggah foto pribadi.'
  },

  // ==========================================
  // === CHALLENGE (Tanpa Pilihan Ganda) ===
  // ==========================================
  {
    id: 'ch1', type: 'challenge',
    text: 'Tanyakan kepada anak tentang game, video, atau aplikasi yang paling sering digunakannya dan mengapa ia menyukainya!',
  },
  {
    id: 'ch2', type: 'challenge',
    text: 'Selama satu hari, gunakan gadget sesuai aturan yang sudah disepakati bersama orang tua. Siapa yang mau?',
  },
  {
    id: 'ch3', type: 'challenge',
    text: 'Buatlah "Kontrak Digital Keluarga" bersama — satu aturan penggunaan internet yang disepakati semua anggota keluarga!',
  },
  {
    id: 'ch4', type: 'challenge',
    text: 'Semua pemain: tunjukkan satu fitur aplikasi favorit kepada anggota keluarga yang belum tahu!',
  },
  {
    id: 'ch5', type: 'challenge',
    text: 'Matikan semua layar selama 10 menit dan lakukan percakapan keluarga tanpa distraksi digital!',
  },
];

// Ambil kartu acak dari semua kategori
export const getRandomCard = () => {
  const idx = Math.floor(Math.random() * CARDS.length);
  return CARDS[idx];
};

