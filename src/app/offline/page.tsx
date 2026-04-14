export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
                {/* Icon offline */}
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-10 h-10 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
                        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                        <line x1="12" y1="20" x2="12.01" y2="20" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold mb-2">Tidak Ada Koneksi</h1>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Kamu sedang offline. Halaman kasir dan data yang sudah di-cache
                    masih bisa diakses.
                </p>

                <div className="space-y-3">
                    <a
                        href="/kasir"
                        className="btn-primary w-full flex items-center justify-center h-11"
                    >
                        Buka Halaman Kasir
                    </a>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-secondary w-full h-11"
                    >
                        Coba Lagi
                    </button>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-xl text-left space-y-2">
                    <p className="text-xs font-semibold text-gray-600">
                        Yang bisa dipakai offline:
                    </p>
                    <div className="space-y-1">
                        {[
                            '✅ Lihat daftar produk (data terakhir)',
                            '✅ Tambah item ke keranjang',
                            '✅ Lihat riwayat transaksi',
                            '❌ Proses transaksi baru',
                            '❌ Pembayaran digital',
                            '❌ Sinkronisasi data terbaru',
                        ].map((item) => (
                            <p key={item} className="text-xs text-gray-500">
                                {item}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}