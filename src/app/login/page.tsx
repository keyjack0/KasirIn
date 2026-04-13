'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { RiShoppingBag3Fill, RiEyeLine, RiEyeOffLine, RiLoaderLine } from 'react-icons/ri'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      toast.error('Profil tidak ditemukan. Pastikan sudah insert ke tabel users.')
      await supabase.auth.signOut()
      return
    }

    toast.success('Berhasil masuk!')

    // Paksa full page reload ke halaman tujuan
    if (profile.role === 'admin') {
      window.location.replace('/admin/dashboard')
    } else {
      window.location.replace('/kasir')
    }

  } catch (err: any) {
    toast.error(err.message || 'Email atau password salah')
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.3) 40px, rgba(255,255,255,0.3) 41px)`,
          }}
        />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <RiShoppingBag3Fill className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">KasirIn</h1>
          <p className="text-gray-400 text-lg max-w-xs mx-auto leading-relaxed">
            Solusi kasir modern yang mudah, cepat, dan andal untuk bisnis Anda
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Real-time', desc: 'Transaksi instan' },
              { label: 'Digital Pay', desc: 'QRIS & e-wallet' },
              { label: 'Multi device', desc: 'Tanpa install' },
            ].map((feat) => (
              <div key={feat.label} className="border border-white/10 rounded-xl p-4">
                <p className="text-white font-semibold text-sm">{feat.label}</p>
                <p className="text-gray-500 text-xs mt-1">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <RiShoppingBag3Fill className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">KasirIn</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Selamat datang</h2>
          <p className="text-gray-500 text-sm mb-8">Masuk ke akun Anda untuk melanjutkan</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="nama@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RiLoaderLine className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2024 KasirIn. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </div>
  )
}
