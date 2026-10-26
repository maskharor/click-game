# 🎮 CLICK! — Roll, Pick, Connect

**Board game edukasi digital parenting** yang menghubungkan orang tua dan anak melalui permainan interaktif berbasis web.

## 📋 Tech Stack

- **React 19** + **Vite 8** — UI framework & bundler
- **Tailwind CSS 4** — Styling
- **Firebase** (Firestore + Anonymous Auth) — Real-time multiplayer
- **Lucide React** — Icons

---

## 🚀 Cara Setup & Menjalankan

### 1. Setup Firebase (WAJIB)

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru (atau gunakan yang sudah ada)
3. Di menu **Build**, aktifkan:
   - Firestore Database (pilih mode "test" untuk development)
   - Authentication > Sign-in method > aktifkan **Anonymous**
4. Di **Project Settings** (ikon gear) > **General** > scroll ke bawah ke **Your apps**
5. Klik ikon Web (`</>`) untuk mendaftarkan app
6. Copy konfigurasi Firebase

### 2. Isi Konfigurasi

Buka file `src/firebase.js` dan ganti dengan kredensial kamu:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "nama-project.firebaseapp.com",
  projectId: "nama-project",
  storageBucket: "nama-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
};
```

### 3. Jalankan Dev Server

```bash
npm run dev
```

Buka browser ke: **http://localhost:5173/**

---

## Cara Bermain

1. **Semua pemain** buka URL yang sama di browser masing-masing
2. Masukkan nama -> klik **Bergabung**
3. Salah satu pemain klik **Mulai Game!**
4. Pemain yang mendapat giliran klik **Kocok Dadu**
5. Bidak otomatis bergerak -> kartu muncul
6. Baca kartu, diskusikan, lalu klik **Selesai! Giliran Berikutnya**
7. Game berlanjut searah jarum jam!

---

## Struktur Proyek

```
src/
|-- firebase.js           # Konfigurasi Firebase (ISI INI!)
|-- main.jsx              # Entry point
|-- App.jsx               # Komponen root
|-- index.css             # Global styles + animasi
|-- data/
|   |-- cards.js          # Data kartu (20 kartu, 4 kategori)
|   +-- gameConfig.js     # Konstanta game & logika papan
|-- hooks/
|   +-- useGameState.js   # Custom hook Firebase game state
+-- components/
    |-- GameBoard.jsx      # Papan 28 kotak + bidak pemain
    |-- CardModal.jsx      # Modal pop-up kartu
    |-- DiceDisplay.jsx    # Komponen dadu animasi
    |-- PlayerPanel.jsx    # Panel pemain + kontrol
    +-- LoadingScreen.jsx  # Loading & error screen
```

---

## Skema Database Firestore

```
firestore/
+-- gameRooms/
    +-- click-game-session-v1/
        |-- status: "waiting" | "playing"
        |-- currentTurnIndex: 0
        |-- diceValue: 1
        |-- round: 1
        |-- activeCard: { id, type, text } | null
        |-- log: ["Player A melempar 5...", ...]
        +-- players: [
              {
                id: "uid_firebase",
                name: "Nama Pemain",
                colorClass: "bg-red-500",
                position: 0
              }
            ]
```

---

## Kategori Kartu

| Kategori | Warna | Jumlah |
|---|---|---|
| Parent's Question | Cyan | 5 kartu |
| Child's Question | Pink | 5 kartu |
| Myth or Fact | Amber | 5 kartu |
| Challenge | Merah | 5 kartu |

---

## Build Production

```bash
npm run build
```

Output di folder `dist/` - bisa di-deploy ke Firebase Hosting, Vercel, atau Netlify.
