# 🎮 CLICK! — Roll, Pick, Connect

**Board game edukasi digital parenting** yang menghubungkan orang tua dan anak melalui permainan interaktif berbasis web.

## 📋 Tech Stack

- **React 19** + **Vite 8** — UI framework & bundler
- **Tailwind CSS 4** — Styling
- **Firebase** (Firestore + Anonymous Auth) — Real-time multiplayer
- **Lucide React** — Icons

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

## Kategori Kartu

| Kategori | Warna | Jumlah |
|---|---|---|
| Parent's Question | Cyan | 5 kartu |
| Child's Question | Pink | 5 kartu |
| Myth or Fact | Amber | 5 kartu |
| Challenge | Merah | 5 kartu |

---

