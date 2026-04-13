# KasirIn - Aplikasi Kasir Modern

Aplikasi kasir berbasis web yang mudah digunakan, mendukung pembayaran digital, dan bisa dijalankan sebagai PWA (Progressive Web App).

---

## 🚀 Fitur

- **Multi-role**: Admin & Kasir dengan akses berbeda
- **POS Interface**: Tampilan kasir yang cepat dan intuitif
- **Pembayaran Digital**: QRIS, Transfer, E-Wallet via Midtrans
- **PWA**: Bisa diinstal di HP tanpa app store
- **Real-time**: Data transaksi langsung tersinkron
- **Manajemen Produk**: Kelola produk, kategori, dan stok
- **Laporan**: Dashboard statistik dan riwayat transaksi

---

## 🛠 Teknologi

| Kebutuhan | Teknologi |
|-----------|-----------|
| Frontend | Next.js 14 + Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payment | Midtrans Snap |
| Hosting | Vercel |
| PWA | next-pwa |
| State | Zustand |

---

## 📦 Instalasi

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd kasirin
npm install
```

### 2. Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor** dan jalankan `supabase-schema.sql`
3. Buka **Authentication > Settings**, nonaktifkan "Confirm email" untuk kemudahan testing
4. Copy URL dan Anon Key dari **Settings > API**

### 3. Setup Midtrans

1. Daftar di [midtrans.com](https://midtrans.com)
2. Aktifkan mode Sandbox untuk testing
3. Copy **Client Key** dan **Server Key** dari Dashboard

### 4. Environment Variables

Buat file `.env.local` dari template:

```bash
cp .env.local.example .env.local
```

Isi dengan nilai yang sesuai:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=false

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Tambah Script Midtrans di Layout

Tambahkan script Midtrans Snap di `src/app/layout.tsx` dalam tag `<head>`:

```html
<script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
/>
```

Untuk production ganti ke:
```
https://app.midtrans.com/snap/snap.js
```

### 6. Buat Admin Pertama

1. Buka Supabase Dashboard > **Authentication > Users**
2. Klik **Add User** dan buat user dengan email & password
3. Copy UUID user yang baru dibuat
4. Buka **SQL Editor** dan jalankan:

```sql
INSERT INTO public.users (id, name, email, role)
VALUES ('paste-uuid-here', 'Admin', 'admin@email.com', 'admin');
```

### 7. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy ke Vercel

```bash
npm run build  # Test build terlebih dahulu
```

1. Push ke GitHub
2. Import repo di [vercel.com](https://vercel.com)
3. Tambahkan semua environment variables di Vercel Dashboard
4. Deploy!

### Midtrans Webhook (Production)

Setelah deploy, daftarkan URL notifikasi di Midtrans Dashboard:

```
https://your-domain.vercel.app/api/payments/notification
```

---

## 📁 Struktur Folder

```
kasirin/
├── src/
│   ├── app/
│   │   ├── login/              # Halaman login
│   │   ├── admin/              # Halaman admin
│   │   │   ├── dashboard/      # Dashboard statistik
│   │   │   ├── products/       # Manajemen produk
│   │   │   ├── categories/     # Manajemen kategori
│   │   │   ├── transactions/   # Semua transaksi
│   │   │   └── users/          # Manajemen pengguna
│   │   ├── kasir/              # Halaman kasir
│   │   │   ├── page.tsx        # POS Interface
│   │   │   └── history/        # Riwayat transaksi kasir
│   │   └── api/
│   │       ├── auth/           # Create user API
│   │       └── payments/       # Midtrans integration
│   ├── components/
│   │   ├── shared/             # Sidebar, Header
│   │   ├── admin/              # Komponen admin
│   │   └── kasir/              # Komponen kasir (CheckoutModal)
│   ├── lib/
│   │   ├── supabase/           # Client, Server, Middleware
│   │   └── utils.ts            # Helper functions
│   ├── store/
│   │   └── cartStore.ts        # Zustand cart state
│   └── types/
│       └── index.ts            # TypeScript types
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # PWA icons (generate sendiri)
├── supabase-schema.sql         # Database schema
└── .env.local.example          # Template environment
```

---

## 🎨 Generate PWA Icons

Gunakan tool seperti [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator):

```bash
npx pwa-asset-generator logo.png ./public/icons --manifest ./public/manifest.json
```

---

## 🔐 Role & Akses

| Fitur | Admin | Kasir |
|-------|-------|-------|
| Dashboard statistik | ✅ | ❌ |
| Kelola produk | ✅ | ❌ |
| Kelola kategori | ✅ | ❌ |
| Kelola pengguna | ✅ | ❌ |
| Semua transaksi | ✅ | ❌ |
| POS/Kasir | ✅ | ✅ |
| Riwayat sendiri | ✅ | ✅ |

---

## 🤝 Kontribusi

Pull request sangat diterima! Untuk perubahan besar, buka issue terlebih dahulu.
