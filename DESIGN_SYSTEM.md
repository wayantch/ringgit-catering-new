# DESIGN SYSTEM — Ringgit Catering System

> Sumber kebenaran tunggal untuk semua keputusan visual.
> Berlaku untuk semua panel: Admin, Pelanggan, Produksi, dan Landing Page.
> Baca dokumen ini sebelum membuat atau memodifikasi komponen apapun.

---

## 1. FONDASI

### 1.1 Warna

```css
/* Definisi di resources/css/app.css via @theme */
--color-primary     : #7a8f6b   /* Olive — CTA, aktif, brand utama */
--color-primary-600 : #6b7b58   /* Hover primary */
--color-primary-700 : #566348   /* Pressed / dark */
--color-primary-rgb : 122, 143, 107
--color-secondary   : #f5f1e8   /* Warm cream — chip, section bg */
--color-accent      : #c97c5d   /* Terracotta — notif, badge penting */
--color-accent-2    : #d9a066   /* Amber — harga menyusul, cashback */
--color-bg          : #f8fafc   /* Background halaman */
--color-surface     : #f8f8f8   /* Surface card inner */
--color-text        : #2e2e2e   /* Body text utama */
```

### 1.2 Tipografi

```
Font : 'Instrument Sans', ui-sans-serif, system-ui, sans-serif
```

| Peran           | Class Tailwind                  | Dipakai untuk                    |
|-----------------|---------------------------------|----------------------------------|
| Page title      | text-3xl lg:text-4xl font-bold  | H1 admin                         |
| Section title   | text-2xl sm:text-3xl font-bold  | H1 user/produksi                 |
| Card title      | text-sm font-semibold           | Judul dalam card                 |
| Body            | text-sm                         | Konten umum                      |
| Body semibold   | text-sm font-semibold           | Label, nilai penting             |
| Caption         | text-xs                         | Sub-label, hint                  |
| Micro           | text-[11px] font-semibold       | Chip, badge status               |
| Mono            | font-mono text-xs font-semibold | Order number, kode               |
| Label section   | text-[11px] uppercase tracking-wider font-semibold | Section group label |

### 1.3 Border Radius

| Token       | Value  | Dipakai untuk                        |
|-------------|--------|--------------------------------------|
| rounded-lg  | 8px    | Badge inline kecil                   |
| rounded-xl  | 12px   | Button, input, tab pill              |
| rounded-2xl | 16px   | Card utama, sheet, modal             |
| rounded-3xl | 24px   | Bottom sheet handle area             |
| rounded-full| 9999px | Chip status, avatar, dot, badge count|

### 1.4 Shadow & Ring

```
Card standard   : shadow-sm ring-1 ring-black/5
Card hover      : hover:shadow-md hover:-translate-y-1
Card subtle     : ring-1 ring-black/[0.06]
Card focus/hover: hover:ring-primary/20 hover:shadow-sm
Modal/Sheet     : shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]
Button primary  : shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)]
```

---

## 2. KOMPONEN UI

### 2.1 Card

```tsx
/* Standard */
<div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">

/* Hover (klikable) */
<div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5
                transition-all duration-200 hover:-translate-y-1 hover:shadow-md">

/* Inner / nested */
<div className="rounded-xl bg-slate-50 ring-1 ring-black/[0.06]">

/* Surface dengan warna brand */
<div className="rounded-2xl bg-secondary/50">

/* Item row (list) */
<div className="rounded-2xl bg-white px-4 py-3.5 ring-1 ring-black/[0.06]
                transition-all duration-150 hover:ring-primary/20 hover:shadow-sm">
```

### 2.2 Button

```tsx
/* Primary */
className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5
           text-sm font-semibold text-white
           shadow-[0_4px_14px_-4px_rgba(122,143,107,0.5)]
           transition-all duration-200 hover:bg-primary-600
           disabled:cursor-not-allowed disabled:opacity-60"

/* Outline */
className="inline-flex items-center gap-2 rounded-xl border border-slate-200
           bg-white px-4 py-2.5 text-sm font-medium text-slate-600
           transition hover:bg-slate-50"

/* Ghost */
className="rounded-xl px-3 py-1.5 text-xs font-semibold text-primary
           transition hover:bg-secondary"

/* Danger */
className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5
           text-sm font-semibold text-white transition hover:bg-red-700"

/* Icon only */
className="flex h-8 w-8 items-center justify-center rounded-xl
           bg-slate-100 text-slate-500 transition hover:bg-slate-200"

/* Loading state */
<span className="h-4 w-4 animate-spin rounded-full
                 border-2 border-white/30 border-t-white" />
```

### 2.3 Input & Form

```tsx
/* Input text */
className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5
           text-sm text-text outline-none transition-all duration-150
           placeholder:text-slate-400
           focus:border-primary/40 focus:ring-2 focus:ring-primary/15"

/* Error state */
className="border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100"

/* Disabled */
className="disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50"

/* Textarea */
className="w-full resize-none rounded-xl border border-slate-200 bg-white
           px-3.5 py-2.5 text-sm text-text outline-none
           focus:border-primary/40 focus:ring-2 focus:ring-primary/15"

/* Dengan prefix icon */
<div className="relative">
    <Icon className="pointer-events-none absolute left-3.5 top-1/2
                     -translate-y-1/2 h-4 w-4 text-slate-400" />
    <input className="... pl-10" />
</div>

/* Dengan suffix unit */
<div className="relative">
    <input className="... pr-12" />
    <span className="pointer-events-none absolute right-3.5 top-1/2
                     -translate-y-1/2 text-xs text-slate-400">kg</span>
</div>
```

### 2.4 Select

```
WAJIB pakai: import { Select } from '@/Components/UI/Select'
JANGAN pakai <select> native di halaman manapun.
Fallback: import { SelectNative } from '@/Components/UI/SelectNative'
```

### 2.5 Toggle Switch

```tsx
<label className="flex cursor-pointer items-start gap-3">
    <div className="relative mt-0.5 shrink-0">
        <input type="checkbox" className="sr-only" checked={checked}
               onChange={e => onChange(e.target.checked)} />
        <div className={`h-5 w-9 rounded-full transition-colors duration-200
                        ${checked ? 'bg-primary' : 'bg-slate-200'}`} />
        <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full
                        bg-white shadow-sm transition-transform duration-200
                        ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
    <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400">{description}</p>}
    </div>
</label>
```

### 2.6 Badge / Chip

```tsx
/* Base */
<span className="inline-flex items-center gap-1 rounded-full
                 px-2.5 py-0.5 text-[11px] font-semibold {colorClass}">
    {label}
</span>

/* Dengan icon */
<span className="inline-flex items-center gap-1 rounded-full
                 px-2.5 py-1 text-[11px] font-semibold {colorClass}">
    <Icon className="h-3 w-3" />
    {label}
</span>
```

#### Warna Badge per Konteks:

**Status Pesanan:**
```
baru        → bg-blue-50 text-blue-600
diproses    → bg-amber-50 text-amber-600
selesai     → bg-emerald-50 text-emerald-600
dibatalkan  → bg-red-50 text-red-500
```

**Kondisi Produk:**
```
mentah  → bg-amber-50 text-amber-700
mateng  → bg-emerald-50 text-emerald-700
```

**Golongan Timbang Hidup:**
```
A → bg-blue-50 text-blue-600
B → bg-indigo-50 text-indigo-600
C → bg-purple-50 text-purple-600
```

**Sub-type Eceran:**
```
paket_pass     → bg-violet-50 text-violet-700
paket_nasi_box → bg-amber-50 text-amber-700
babi_adat      → bg-rose-50 text-rose-700
```

**Adat:**
```
Batak / Nias → bg-violet-50 text-violet-700
Tanpa Adat   → bg-slate-100 text-slate-500
```

**Source Pesanan:**
```
admin   → bg-secondary text-primary
pembeli → bg-violet-50 text-violet-600
```

**Loyalti Tier:**
```
bronze   → bg-amber-50 text-amber-700 ring-1 ring-amber-200
silver   → bg-slate-100 text-slate-600 ring-1 ring-slate-300
gold     → bg-yellow-50 text-yellow-700 ring-1 ring-yellow-300
platinum → bg-violet-50 text-violet-700 ring-1 ring-violet-300
```

**Harga & Promo:**
```
harga menyusul → bg-accent-2/10 text-accent-2
cashback       → bg-accent-2/10 text-accent-2
free ongkir    → bg-emerald-50 text-emerald-600
full payment   → bg-primary/10 text-primary
dp             → bg-amber-50 text-amber-700
```

### 2.7 Field Label, Error, Hint

```tsx
/* Label */
<label className="mb-1.5 block text-sm font-medium text-slate-700">
    {label}
    {required && <span className="ml-1 text-red-400">*</span>}
    {optional && <span className="ml-1.5 text-xs font-normal text-slate-400">opsional</span>}
</label>

/* Error */
<p className="mt-1.5 text-xs text-red-500">{error}</p>

/* Hint */
<p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
    <Info className="h-3 w-3 shrink-0" />
    {hint}
</p>
```

### 2.8 Form Section (dua kolom — admin)

```tsx
<div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
    <div className="pt-1">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {description && (
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
        )}
    </div>
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.06]">
        {children}
    </div>
</div>

/* Wrapper semua section */
<div className="space-y-5">{sections}</div>
```

### 2.9 Empty State

```tsx
<div className="flex flex-col items-center gap-3 py-14 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{description}</p>
    </div>
    {/* Optional CTA */}
    <Link className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white">
        {actionLabel}
    </Link>
</div>
```

### 2.10 Divider dengan Label

```tsx
/* Section label atas list */
<div className="flex items-center gap-2 px-1 mb-2">
    <Icon className="h-3.5 w-3.5 text-slate-400" />
    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
    </p>
</div>

/* Garis tipis */
<div className="h-px bg-slate-100 my-1" />
```

### 2.11 Alert — SweetAlert2

```
Semua melalui @/lib/alert — JANGAN import Swal langsung.

alertSukses(pesan)        → toast pojok kanan bawah, timer 3.5 detik
alertError(pesan)         → modal centered
alertPeringatan(pesan)    → modal centered
konfirmasiHapus(nama)     → modal + nama item
konfirmasi(judul, pesan)  → modal umum
konfirmasiStatus(aksi, noOrder) → modal ubah status

Aturan tombol:
  Konfirmasi → kanan (order: 2), bg-primary rounded-xl
  Batal      → kiri  (order: 1), bg-slate-100 rounded-xl
  Danger     → kanan, bg-red-600

Backdrop: rgba(15,23,42,0.45) + backdrop-filter: blur(4px)
Popup    : rounded-2xl, font Instrument Sans
Semua teks dalam Bahasa Indonesia.
```

---

## 3. LAYOUT PER PANEL

### 3.1 Admin Panel

**Layout:** AdminLayout (sidebar + topbar)
**Max width konten:** max-w-7xl mx-auto
**Tidak ada** header bg-primary per halaman.

**Page header admin:**
```tsx
<div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            {sectionLabel}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 lg:text-4xl">
            {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
        </p>
    </div>
    <div className="flex flex-wrap items-center gap-3">
        {/* Action buttons */}
    </div>
</div>
```

**Admin Topbar:**
```
Fixed top, bg-white/70 backdrop-blur-sm, border-b border-primary/10

Kiri  : Search bar (max-w-sm, rounded-full bg-secondary/40)
Kanan : Bell notif → divider → LiveClock → divider → ProfileDropdown

LiveClock:
  Jam    : text-[15px] font-bold tabular-nums text-text
  Tanggal: text-[11px] font-medium text-slate-400

ProfileDropdown:
  Trigger : avatar inisial bg-primary + nama + role + ChevronDown
  Dropdown: rounded-2xl shadow-lg ring-1 ring-black/5
  Menu    : Profil Saya | Pengaturan | ── | Keluar (text-red-500)
  Logout  : router.post(route('logout'))
```

---

### 3.2 Pelanggan Panel

**Layout:** PelangganLayout
```tsx
<div className="min-h-screen bg-bg">
    <main className="pb-24">{children}</main>
    <BottomNavbar /> {/* 5 tab */}
</div>
```

**Page header pelanggan (WAJIB di semua halaman):**
```tsx
<header className="relative overflow-hidden bg-primary text-white">
    {/* Blob 1 */}
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40" style={{
        background: 'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.22), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,255,255,0.16), transparent 40%)'
    }} />
    {/* Circle kanan atas */}
    <div aria-hidden className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full opacity-10"
         style={{ background: 'rgba(255,255,255,0.5)' }} />
    {/* Circle kiri bawah */}
    <div aria-hidden className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full opacity-10"
         style={{ background: 'rgba(255,255,255,0.5)' }} />

    <div className="relative mx-auto w-full max-w-7xl px-5 pt-10 pb-14 sm:px-8">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-white/75">{subLabel}</p>
                <h1 className="mt-1.5 text-2xl font-bold leading-snug sm:text-3xl">{title}</h1>
                <p className="mt-2 text-sm text-white/60">{description}</p>
            </div>
            {/* Icon box kanan */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center
                            rounded-2xl bg-white/20 ring-2 ring-white/30 backdrop-blur-sm">
                <Icon className="h-5 w-5 text-white" />
            </div>
        </div>
    </div>
</header>

{/* Konten — overlap ke header */}
<div className="relative -mt-6">
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-8">
        {/* konten */}
    </div>
</div>
```

**Bottom Navbar Pelanggan (5 tab):**
```
Tab    : Beranda | Menu | Keranjang | Pesanan | Profil
Icon   : Home | UtensilsCrossed | ShoppingCart | ClipboardList | User
Aktif  : text-primary + dot h-1 w-1 rounded-full bg-primary di bawah icon
Nonaktif: text-slate-400
Keranjang badge: absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-white text-[10px]
Style  : fixed bottom-0, bg-white/90 backdrop-blur-md, border-t border-primary/10, pb-4, z-50
```

---

### 3.3 Produksi Panel

**Layout:** ProduksiLayout
```tsx
<div className="min-h-screen bg-bg">
    <main className="pb-24">{children}</main>
    <BottomNavbar /> {/* 3 tab */}
</div>
```

**Page header:** Sama persis dengan pelanggan (bg-primary + blob + circle + overlap -mt-6).

**Bottom Navbar Produksi (3 tab):**
```
Tab    : Beranda | Pesanan | Riwayat
Icon   : Home | ClipboardList | History
Pesanan badge: jumlah pesanan status 'diproses'
Style  : sama dengan pelanggan
```

---

### 3.4 Landing Page (Guest)

**Layout:** Standalone, tidak pakai AdminLayout/PelangganLayout.
**Tidak ada** sidebar, topbar admin, atau bottom navbar.

**Navbar Landing:**
```
Fixed top, transparent → bg-white/88 backdrop-blur saat scroll
Kiri : Logo + "Ringgit Catering"
Kanan: Link navigasi (Layanan, Menu) + tombol "Pesan Sekarang" (bg-primary)
Transisi smooth via scroll event
```

**Hero Section:**
```
min-h-screen, bg gradient dari primary-700 ke primary
Floating SVG dekoratif (gambar daging/bahan) dengan opacity 0.05, animasi float
Konten: badge chip "BARU", H1 besar, deskripsi, dua CTA button, stats row
Scroll indicator di bawah
```

**Section lainnya:**
```
Layanan    : 3 card grid, card-hover pattern
Menu       : 4–6 card grid, bg-secondary
How It Works: 4 step horizontal dengan nomor
Testimoni  : bg gradient primary, card glass bg-white/10
CTA        : centered, max-w-680px
Footer     : bg-text (dark), teks putih
```

**Animasi landing:**
```css
.section-reveal { opacity: 0; transform: translateY(32px);
                  transition: opacity 0.8s, transform 0.8s; }
.section-reveal.visible { opacity: 1; transform: translateY(0); }
.card-hover { transition: transform 0.25s, box-shadow 0.25s; }
.card-hover:hover { transform: translateY(-6px);
                    box-shadow: 0 20px 40px -12px rgba(122,143,107,0.18); }
```

---

## 4. KOMPONEN SPESIFIK

### 4.1 Order Timeline (Horizontal)

```
Step circle: h-8 w-8 rounded-full

State:
  done    → bg-primary ring-primary/15 text-white + icon CheckCheck
  active  → bg-primary ring-primary/20 text-white + pulse animate-ping
  pending → bg-white ring-slate-200 text-slate-300 + nomor

Garis konektor: h-0.5, split kiri/kanan per step
  done/active → bg-primary | pending → bg-slate-200

Label:
  active → text-[11px] font-semibold text-primary
  done   → text-[11px] font-semibold text-slate-600
  pending→ text-[11px] text-slate-300
Sub-label: text-[10px]

Panel Admin   : 3 step (baru → diproses → selesai)
Panel Pelanggan: 4 step (baru → menunggu_verifikasi → diproses → selesai)
```

### 4.2 Order Items Table

```
Dua grup: 🐷 Timbang Hidup | 📦 Eceran & Paket
Section label: text-[11px] uppercase tracking-wider text-slate-400

Per item row:
  bg-white rounded-2xl px-4 py-3.5
  ring-1 ring-black/[0.06]
  hover:ring-primary/20 hover:shadow-sm

Layout: kiri (nama + badges + info + notes) | kanan (subtotal bold primary)
Info row: qty font-medium text-slate-700 | × harga text-slate-400
Notes box: bg-slate-50 rounded-xl px-3 py-2.5 text-xs
```

### 4.3 Two-Column Page Layout

```tsx
/* Detail halaman */
<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
    <div className="space-y-4">{/* konten utama */}</div>
    <div className="lg:sticky lg:top-4 space-y-4">{/* sidebar */}</div>
</div>

/* Kasir POS */
<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_420px] lg:items-start">
```

### 4.4 Stat Card

```tsx
/* Standard */
<div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5
                transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary">
        <Icon className="h-4 w-4 text-primary" />
    </div>
    <p className="mt-3 text-2xl font-bold tabular-nums text-text">{value}</p>
    <p className="mt-0.5 text-xs font-medium text-slate-400">{label}</p>
</div>

/* Accent (pendapatan utama) */
<div className="... bg-primary text-white">
    {/* icon box: bg-white/15, value: text-white, label: text-white/70 */}
    {/* change badge: bg-white/20 text-white */}
</div>
```

---

## 5. WAKTU & INPUT KHUSUS

### 5.1 Time Picker

```
Range     : 05:00 — 18:00
Menit     : hanya 00 dan 30 (total 27 opsi)
Komponen  : Select custom (@/Components/UI/Select)
BUKAN     : <input type="time">

Label UI:
  pickup   → "Ambil di outlet pukul"
  delivery → "Kirim dari outlet jam"

Generate opsi:
  for hour 5–18, minute [0, 30], skip 18:30
  value: "08:00", label: "08.00"
```

### 5.2 Adat Picker (Timbang Hidup)

```
Step 1 — Kelompok (toggle pill):
  [Batak] [Nias] [Tanpa Adat] [Lainnya]

Step 2:
  Batak   → multi-select: Lengkap|Kepala|Aliang|Somba|Soit|Ekor|Jeroan
            Pilih Lengkap → disable semua lain
  Nias    → otomatis Simbi-Simbi
  Lainnya → textarea bebas
  Tanpa Adat → tidak ada step lagi

Catatan: is_half=true → SEMBUNYIKAN adat picker
Storage: adat_group (string) + adat_parts (JSON array)
```

---

## 6. FORMAT HELPERS

```ts
/* Rupiah */
const fmt = (n: number | null | undefined): string => {
    if (n == null) return '—';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(n);
};

/* Harga null → chip, bukan teks */
const isPricePending = price === null || price === undefined;

/* Kg */
const fmtKg = (n: number) => `${parseFloat(n.toFixed(1))} kg`;

/* Tanggal panjang: "Minggu, 12 Januari 2025" */
const fmtDateLong = (v: string) => new Date(v).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
});

/* Tanggal pendek: "12 Jan 2025" */
const fmtDateShort = (v: string) => new Date(v).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
});

/* Jam: "08:00" */
const fmtTime = (t: string | null) => t ? t.substring(0, 5) : '—';

/* Label jam dengan konteks */
const displayTime = (type: string, time: string | null) => {
    if (!time) return '—';
    const t = time.substring(0, 5);
    return type === 'takeaway' ? `Ambil di outlet pukul ${t}` : `Kirim dari outlet jam ${t}`;
};

/* Order type */
const displayType = (t: string) => t === 'takeaway' ? 'Pickup' : 'Delivery';
```

---

## 7. GRID LAYOUT

```
Halaman menu pelanggan : grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
Grid card admin        : grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
Stat cards admin (4)   : grid-cols-2 lg:grid-cols-4
Stat produksi (3)      : grid-cols-3
Form dua kolom         : lg:grid-cols-[200px_1fr]
Detail + sidebar       : lg:grid-cols-[1fr_360px]
Kasir POS              : lg:grid-cols-[1fr_420px]
```

---

## 8. PRINT

```css
@media print {
    .no-print { display: none !important; }
    body * { visibility: hidden; }
    #print-area, #print-area * { visibility: visible; }
    #print-area { position: absolute; left: 0; top: 0; width: 100%; }
    @page { size: A4 portrait; margin: 16mm 14mm; }
    body { font-family: 'Courier New', monospace; font-size: 11pt; color: #000; }
    .print-table { border-collapse: collapse; width: 100%; }
    .print-table th, .print-table td { border: 1px solid #000; padding: 5px 8px; }
    .print-table th { background: #f0f0f0; font-weight: bold; }
    .print-table thead { display: table-header-group; }
    .print-table tr { page-break-inside: avoid; }
    .print-group + .print-group { page-break-before: always; }
}
```

---

## 9. ATURAN WAJIB

```
❌ JANGAN hardcode warna hex — pakai CSS variable atau Tailwind class
❌ JANGAN pakai <select> native — pakai Select dari @/Components/UI/Select
❌ JANGAN pakai <input type="time"> — pakai Select dengan opsi 05:00–18:00
❌ JANGAN pakai browser confirm/alert/prompt — pakai @/lib/alert
❌ JANGAN import Swal langsung — selalu dari @/lib/alert
❌ JANGAN tampilkan integer ID di URL — semua ID harus hashid (string)
❌ JANGAN tampilkan harga null sebagai "Rp 0" — pakai chip "Harga Menyusul"
❌ JANGAN buat Select custom sendiri — sudah ada di @/Components/UI/Select
❌ JANGAN skip hover animation pada card yang klikable
❌ JANGAN hardcode teks bahasa Inggris untuk UI — semua Bahasa Indonesia

✅ SELALU font Instrument Sans
✅ SELALU rounded-2xl untuk card, rounded-xl untuk input/button
✅ SELALU rounded-full untuk badge/chip status
✅ SELALU -mt-6 + pb-14 untuk header overlap di panel user/produksi
✅ SELALU pb-24 di main layout user & produksi (ruang bottom navbar)
✅ SELALU hover:-translate-y-1 hover:shadow-md pada card klikable
✅ SELALU loading state saat form submit (spinner + disabled)
✅ SELALU Bahasa Indonesia untuk semua teks UI dan alert
✅ SELALU blob dekoratif + circle ornamen di header panel user/produksi
✅ SELALU konfirmasi SweetAlert2 sebelum aksi destruktif (hapus, batalkan)
```

---

## 10. REFERENSI KOMPONEN

| Komponen                   | Import Path                                      |
|----------------------------|--------------------------------------------------|
| Select custom              | @/Components/UI/Select                           |
| Alert & konfirmasi         | @/lib/alert                                      |
| AdminLayout                | @/Layouts/AdminLayout                            |
| PelangganLayout            | @/Layouts/PelangganLayout                        |
| ProduksiLayout             | @/Layouts/ProduksiLayout                         |
| BottomNavbar pelanggan     | @/Components/Pelanggan/BottomNavbar              |
| BottomNavbar produksi      | @/Components/Produksi/BottomNavbar               |
| OrderTimeline admin        | @/Components/Admin/Pesanan/OrderTimeline         |
| OrderTimeline pelanggan    | @/Components/Pelanggan/OrderTimelineUser         |
| OrderItemsTable            | @/Components/Admin/Pesanan/OrderItemsTable       |
| TierPicker keranjang       | @/Components/Pelanggan/TierPicker                |
| AddToCartSheet             | @/Components/Pelanggan/AddToCartSheet            |
| PaymentVerifyCard          | @/Components/Admin/Pesanan/PaymentVerifyCard     |
| TierBadge loyalti          | @/Components/Admin/Pelanggan/TierBadge           |
| PrintPreview               | @/Components/Admin/Print/PrintPreview            |
