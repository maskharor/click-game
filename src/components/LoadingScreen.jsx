// src/components/LoadingScreen.jsx

export default function LoadingScreen({ error }) {
  if (error) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="text-6xl">⚠️</div>
        <h2 className="text-2xl font-black text-red-700">Koneksi Gagal</h2>
        <p className="text-amber-900 max-w-md font-medium">{error}</p>
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 max-w-md w-full text-left">
          <p className="font-black text-amber-900 mb-3 text-sm">🔧 Cara memperbaiki:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-amber-800 font-medium">
            <li>Buka <code className="bg-amber-100 px-1 rounded text-xs">src/firebase.js</code></li>
            <li>Isi kredensial Firebase project kamu</li>
            <li>Aktifkan <strong>Firestore</strong> & <strong>Anonymous Auth</strong> di Firebase Console</li>
            <li>Simpan dan refresh halaman ini</li>
          </ol>
        </div>
        <a
          href="https://console.firebase.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-400 text-amber-900 font-black px-6 py-3 rounded-xl hover:bg-amber-500 transition-all shadow-md"
        >
          Buka Firebase Console →
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-6xl font-black tracking-tight animate-pulse" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          <span className="text-pink-500">C</span>
          <span className="text-amber-900">L</span>
          <span className="text-cyan-400">i</span>
          <span className="text-amber-400">C</span>
          <span className="text-amber-700">K</span>
          <span className="text-pink-500">!</span>
        </h1>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-amber-400"
              style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite alternate` }}
            />
          ))}
        </div>
        <p className="text-amber-700 font-bold text-sm animate-pulse">Menghubungkan ke server...</p>
      </div>
    </div>
  );
}
