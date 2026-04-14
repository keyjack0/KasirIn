'use client'

import { useEffect, useState } from 'react'

export default function OfflinePage() {
    const [cachedPages, setCachedPages] = useState<string[]>([])

    useEffect(() => {
        // Cek halaman apa saja yang sudah di-cache
        if ('caches' in window) {
            caches.open('kasirin-v1').then(async (cache) => {
                const keys = await cache.keys()
                const pages = keys
                    .map((k) => new URL(k.url).pathname)
                    .filter((p) => ['/kasir', '/kasir/history'].includes(p))
                setCachedPages(pages)
            })
        }
    }, [])

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="text-center max-w-sm w-full">
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
                    Kamu sedang offline. Beberapa halaman yang sudah pernah dibuka
                    masih bisa diakses.
                </p>

                {/* Halaman yang tersedia di cache */}
                {cachedPages.length > 0 ? (
                    <div className="space-y-2 mb-6">
                        <p className="text-xs font-semibold text-gray-500 text-left">
                            Halaman tersedia offline:
                        </p>
                        {cachedPages.includes('/kasir') && (
                            <a
                                href="/kasir"
                                className="btn-primary w-full flex items-center justify-center h-11"
                            >
                                Buka Halaman Kasir
                            </a>
                        )}
                        {cachedPages.includes('/kasir/history') && (
                            <a
                                href="/kasir/history"
                                className="btn-secondary w-full flex items-center justify-center h-11"
                            >
                                Buka Riwayat Transaksi
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="mb-6 p-4 bg-yellow-50 rounded-xl text-left">
                        <p className="text-xs font-semibold text-yellow-700 mb-1">
                            Cache belum tersedia
                        </p>
                        <p className="text-xs text-yellow-600">
                            Buka aplikasi saat online terlebih dahulu agar halaman bisa
                            diakses offline.
                        </p>
                    </div>
                )
                }

                <button
                    onClick={() => window.location.reload()}
                    className="btn-secondary w-full h-11 mb-6"
                >
                    Coba Koneksi Lagi
                </button>

                <div className="p-4 bg-gray-50 rounded-xl text-left space-y-1.5">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                        Status fitur offline:
                    </p>
                    {[
                        { label: 'Lihat produk (data terakhir)', ok: true },
                        { label: 'Lihat riwayat transaksi', ok: true },
                        { label: 'Tambah item ke keranjang', ok: true },
                        { label: 'Proses transaksi baru', ok: false },
                        { label: 'Pembayaran digital (QRIS/Transfer)', ok: false },
                        { label: 'Data real-time', ok: false },
                    ].map((item) => (
                        <p key={item.label} className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{item.ok ? '✅' : '❌'}</span>
                            {item.label}
                        </p>
                    ))}
                </div>
            </div >
        </div >
    )
}