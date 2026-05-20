# DESIGN SYSTEM — Ringgit Catering System

## CSS Variables (Tailwind @theme)

```css
--font-sans         : 'Instrument Sans', ui-sans-serif, system-ui, sans-serif
--color-primary     : #7a8f6b
--color-primary-600 : #6b7b58
--color-primary-700 : #566348
--color-primary-rgb : 122, 143, 107
--color-secondary   : #f5f1e8
--color-accent      : #c97c5d
--color-accent-2    : #d9a066
--color-bg          : #f8fafc
--color-surface     : #f8f8f8
--color-text        : #2e2e2e
```

---

## Pola Wajib — Halaman Pelanggan & Produksi

### Header per halaman (WAJIB konsisten):
```tsx
<header className="relative overflow-hidden bg-primary text-white">
  {/* Blob dekoratif */}
  <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{
    background: 'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%)'
  }} />
  <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-10"
    style={{ background: 'rgba(255,255,255,0.5)' }} />
  <div aria-hidden className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full opacity-10"
    style={{ background: 'rgba(255,255,255,0.5)' }} />

  <div className="relative px-5 pt-10 pb-14 sm:px-8">
    {/* konten header */}
  </div>
</header>

{/* Konten overlap */}
<div className="relative -mt-6">
  <div className="px-4 pb-8 sm:px-8">
    {/* konten halaman */}
  </div>
</div>
```

### Admin panel: gunakan AdminLayout, tidak ada header bg-primary.

---

## Card

```tsx
// Standard card
<div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">

// Hover card (list/grid item)
<div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5
                transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

// Section card
<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
```

---

## Buttons

```tsx
// Primary
<button className="bg-primary hover:bg-primary-600 text-white rounded-xl
                   px-5 py-2.5 text-sm font-semibold
                   shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)]
                   transition-all duration-200">

// Outline
<button className="border border-slate-200 bg-white hover:bg-slate-50
                   text-slate-600 rounded-xl px-4 py-2.5 text-sm font-medium
                   transition-all duration-200">

// Danger
<button className="bg-red-600 hover:bg-red-700 text-white rounded-xl
                   px-4 py-2.5 text-sm font-semibold">

// Loading state (dalam button)
<>
  <span className="h-4 w-4 animate-spin rounded-full border-2
                   border-white/30 border-t-white" />
  Menyimpan...
</>
```

---

## Input / Form

```tsx
// Input standard
<input className="w-full rounded-xl border border-slate-200 bg-white
                  px-3.5 py-2.5 text-sm text-text outline-none
                  transition-all duration-150 placeholder:text-slate-400
                  focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />

// Input error
<input className="border-red-300 bg-red-50 focus:border-red-400
                  focus:ring-2 focus:ring-red-100" />

// Input disabled
<input className="disabled:cursor-not-allowed disabled:opacity-50" />

// Textarea
<textarea className="w-full resize-none rounded-xl border border-slate-200
                     px-3.5 py-2.5 text-sm text-text outline-none
                     focus:border-primary/40 focus:ring-2 focus:ring-primary/15" />
```

### Select — WAJIB pakai custom component:
```tsx
import { Select } from '@/Components/UI/Select';
// JANGAN pakai <select> native kecuali SelectNative untuk fallback
```

### Toggle Switch:
```tsx
// Checked: bg-primary, Unchecked: bg-slate-200
// Circle: bg-white, transition translate-x-4 saat checked
```

### Form Section (pola dua kolom):
```tsx
<div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
  <div className="pt-1">
    <p className="text-sm font-semibold text-slate-800">Judul Section</p>
    <p className="mt-1 text-xs leading-relaxed text-slate-400">Deskripsi</p>
  </div>
  <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06]">
    {/* field-field */}
  </div>
</div>
```

---

## Badge / Chip

```tsx
// Status pesanan
baru:       'bg-blue-50 text-blue-600'
diproses:   'bg-amber-50 text-amber-600'
selesai:    'bg-emerald-50 text-emerald-600'
dibatalkan: 'bg-red-50 text-red-500'

// Kondisi produk timbang hidup
mentah:   'bg-amber-50 text-amber-700'
mateng:   'bg-emerald-50 text-emerald-700'

// Golongan timbang hidup
A: 'bg-blue-50 text-blue-600'
B: 'bg-indigo-50 text-indigo-600'
C: 'bg-purple-50 text-purple-600'

// Sub-type eceran
paket_pass:     'bg-violet-50 text-violet-700'
paket_nasi_box: 'bg-amber-50 text-amber-700'
babi_adat:      'bg-rose-50 text-rose-700'

// Source pesanan
admin:   'bg-secondary text-primary'
pembeli: 'bg-violet-50 text-violet-600'

// Loyalti tier
bronze:   'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
silver:   'bg-slate-100 text-slate-600 ring-1 ring-slate-300'
gold:     'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-300'
platinum: 'bg-violet-50 text-violet-700 ring-1 ring-violet-300'

// Harga menyusul
'bg-accent-2/10 text-accent-2'

// Cashback
'bg-accent-2/10 text-accent-2'

// Chip standard
<span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1
                 text-[11px] font-semibold {cls}">
```

---

## Alert — SweetAlert2

```tsx
// Semua dari @/lib/alert — JANGAN import Swal langsung

import {
  alertSukses,      // toast kanan bawah
  alertError,       // modal error
  alertPeringatan,  // modal warning
  alertInfo,        // modal info
  konfirmasiHapus,  // konfirmasi hapus dengan nama item
  konfirmasi,       // konfirmasi umum
  konfirmasiStatus, // konfirmasi ubah status pesanan
  tampilLoading,    // loading saat async
  tutupLoading,
} from '@/lib/alert';

// Tombol konfirmasi selalu di KANAN
// Tombol batal selalu di KIRI
// Alert sukses: toast pojok kanan bawah
// Semua teks Bahasa Indonesia
```

---

## Layout per Panel

### PelangganLayout:
```tsx
<div className="min-h-screen bg-bg">
  <main className="pb-24">{children}</main>
  <BottomNavbar /> {/* 5 tab: Beranda,Menu,Keranjang,Pesanan,Profil */}
</div>
```

### ProduksiLayout:
```tsx
<div className="min-h-screen bg-bg">
  <main className="pb-24">{children}</main>
  <BottomNavbar /> {/* 3 tab: Beranda,Pesanan,Riwayat */}
</div>
```

### AdminLayout:
- Sidebar navigasi
- Topbar dengan LiveClock + ProfileDropdown
- Konten: max-w-7xl mx-auto

---

## Bottom Navbar (Pelanggan)

```
Tab: [Beranda] [Menu] [Keranjang] [Pesanan] [Profil]
Icon: Home, UtensilsCrossed, ShoppingCart, ClipboardList, User
Tab aktif: text-primary + dot indicator kecil di bawah
Tab nonaktif: text-slate-400
Keranjang: badge merah jumlah item jika ada
Fixed bottom, bg-white/90 backdrop-blur-md, border-t border-primary/10
```

---

## Waktu (Time Picker)

```
Range: 05:00 — 18:00
Menit: hanya 00 dan 30
Total opsi: 27 pilihan
Gunakan Select custom, bukan <input type="time">

Label:
- Pickup  → "Ambil di outlet pukul"
- Delivery → "Kirim dari outlet jam"
```

---

## Format Helper (wajib konsisten)

```ts
// Rupiah
const fmt = (n: number | null) => n === null ? '—' :
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n);

// Kg
const fmtKg = (n: number) => `${parseFloat(n.toFixed(1))} kg`;

// Tanggal
const fmtDate = (v: string) => new Date(v).toLocaleDateString('id-ID', {
  day: 'numeric', month: 'long', year: 'numeric',
});

// Tanggal pendek
const fmtDateShort = (v: string) => new Date(v).toLocaleDateString('id-ID', {
  day: 'numeric', month: 'short', year: 'numeric',
});

// Order type
const displayType = (t: string) => t === 'takeaway' ? 'Pickup' : 'Delivery';

// Jam
const displayTime = (type: string, time: string | null) => {
  if (!time) return '—';
  const t = time.substring(0, 5);
  return type === 'takeaway'
    ? `Ambil di outlet pukul ${t}`
    : `Kirim dari outlet jam ${t}`;
};
```

---

## Print Styling

```css
@media print {
  /* Sembunyikan semua kecuali #print-area */
  .no-print { display: none !important; }
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  @page { size: A4 portrait; margin: 16mm 14mm; }
  font-family: 'Courier New', monospace;
}
```
