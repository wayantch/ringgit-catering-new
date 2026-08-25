import Swal from 'sweetalert2';
import type { SweetAlertResult } from 'sweetalert2';

// ─── Base instance dengan tema global ────────────────────────────────────────

const SwalBase = Swal.mixin({
    // Font & warna
    customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-html',
        confirmButton: 'swal-btn-confirm',
        cancelButton: 'swal-btn-cancel',
        denyButton: 'swal-btn-deny',
        actions: 'swal-actions',
        icon: 'swal-icon',
        timerProgressBar: 'swal-timer-bar',
    },
    buttonsStyling: false, // WAJIB false agar custom class aktif
    reverseButtons: false, // Batal kiri, Konfirmasi kanan
    allowOutsideClick: false,
    allowEscapeKey: true,
    scrollbarPadding: false,
    showClass: {
        popup: 'animate__animated animate__fadeInDown animate__faster',
    },
    hideClass: {
        popup: 'animate__animated animate__fadeOutUp animate__faster',
    },
});

// ─── Toast (pojok kanan bawah) ────────────────────────────────────────────────

function isMobileViewport(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(max-width: 640px)').matches;
}

function getToast(): typeof Swal {
    const mobile = isMobileViewport();

    return Swal.mixin({
        toast: true,
        position: mobile ? 'top' : 'bottom-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        buttonsStyling: false,
        backdrop: false,
        width: mobile ? 'calc(100vw - 1.5rem)' : undefined,
        customClass: {
            popup: mobile ? 'swal-toast swal-toast-mobile' : 'swal-toast',
            title: 'swal-toast-title',
            timerProgressBar: 'swal-toast-timer',
        },
        showClass: {
            popup: mobile
                ? 'animate__animated animate__fadeInDown animate__faster'
                : 'animate__animated animate__slideInRight animate__faster',
        },
        hideClass: {
            popup: mobile
                ? 'animate__animated animate__fadeOutUp animate__faster'
                : 'animate__animated animate__slideOutRight animate__faster',
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });
}

// ─── Alert Sukses (Toast kanan bawah) ────────────────────────────────────────

export function alertSukses(pesan: string, judul = 'Berhasil!') {
    return getToast().fire({
        icon: 'success',
        title: judul,
        text: pesan,
    });
}

// ─── Alert Error ──────────────────────────────────────────────────────────────

export function alertError(pesan: string, judul = 'Terjadi Kesalahan') {
    return SwalBase.fire({
        icon: 'error',
        title: judul,
        text: pesan,
        confirmButtonText: 'Tutup',
    });
}

// ─── Alert Warning ────────────────────────────────────────────────────────────

export function alertPeringatan(pesan: string, judul = 'Perhatian') {
    return SwalBase.fire({
        icon: 'warning',
        title: judul,
        text: pesan,
        confirmButtonText: 'Mengerti',
    });
}

// ─── Alert Info ───────────────────────────────────────────────────────────────

export function alertInfo(pesan: string, judul = 'Informasi') {
    return SwalBase.fire({
        icon: 'info',
        title: judul,
        text: pesan,
        confirmButtonText: 'Oke',
    });
}

// ─── Konfirmasi Hapus ─────────────────────────────────────────────────────────

export function konfirmasiHapus(
    namaItem: string,
    keterangan?: string,
): Promise<SweetAlertResult> {
    return SwalBase.fire({
        icon: 'warning',
        title: 'Hapus Data?',
        html: `
            <p class="swal-hapus-nama">${namaItem}</p>
            <p class="swal-hapus-sub">${keterangan ?? 'Data yang dihapus tidak dapat dikembalikan.'}</p>
        `,
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        focusCancel: true, // default fokus ke Batal (lebih aman)
        reverseButtons: false,
    });
}

// ─── Konfirmasi Umum ─────────────────────────────────────────────────────────

export function konfirmasi(
    judul: string,
    pesan: string,
    opsi?: {
        konfirmasiLabel?: string;
        batalLabel?: string;
        icon?: 'warning' | 'question' | 'info';
        isDanger?: boolean;
    },
): Promise<SweetAlertResult> {
    return SwalBase.fire({
        icon: opsi?.icon ?? 'question',
        title: judul,
        text: pesan,
        showCancelButton: true,
        confirmButtonText: opsi?.konfirmasiLabel ?? 'Ya, Lanjutkan',
        cancelButtonText: opsi?.batalLabel ?? 'Batal',
        reverseButtons: false,
        customClass: {
            popup: 'swal-popup',
            confirmButton: opsi?.isDanger
                ? 'swal-btn-danger'
                : 'swal-btn-confirm',
            cancelButton: 'swal-btn-cancel',
            actions: 'swal-actions',
        },
    });
}

// ─── Konfirmasi Ubah Status ───────────────────────────────────────────────────

export function konfirmasiStatus(
    aksi: string, // "Mulai Proses" | "Tandai Selesai" | "Batalkan"
    orderNumber: string,
    isDanger = false,
): Promise<SweetAlertResult> {
    return SwalBase.fire({
        icon: isDanger ? 'warning' : 'question',
        title: `${aksi}?`,
        html: `<p class="swal-hapus-sub">Pesanan <strong>${orderNumber}</strong> akan diubah statusnya.</p>`,
        showCancelButton: true,
        confirmButtonText: aksi,
        cancelButtonText: 'Batal',
        reverseButtons: false,
        customClass: {
            popup: 'swal-popup',
            confirmButton: isDanger ? 'swal-btn-danger' : 'swal-btn-confirm',
            cancelButton: 'swal-btn-cancel',
            actions: 'swal-actions',
        },
    });
}

// ─── Prompt Teks ─────────────────────────────────────────────────────────────

export async function promptTeks(
    judul: string,
    pesan: string,
    opsi?: {
        placeholder?: string;
        confirmButtonText?: string;
        cancelButtonText?: string;
        required?: boolean;
    },
): Promise<string | null> {
    const result = await SwalBase.fire({
        icon: 'question',
        title: judul,
        text: pesan,
        input: 'text',
        inputPlaceholder: opsi?.placeholder ?? '',
        showCancelButton: true,
        confirmButtonText: opsi?.confirmButtonText ?? 'Simpan',
        cancelButtonText: opsi?.cancelButtonText ?? 'Batal',
        reverseButtons: false,
        inputValidator: (value) => {
            if (opsi?.required !== false && value.trim() === '') {
                return 'Kolom ini wajib diisi.';
            }

            return undefined;
        },
        customClass: {
            popup: 'swal-popup',
            confirmButton: 'swal-btn-confirm',
            cancelButton: 'swal-btn-cancel',
            actions: 'swal-actions',
        },
    });

    if (!result.isConfirmed) {
        return null;
    }

    const value = typeof result.value === 'string' ? result.value.trim() : '';

    return value === '' ? null : value;
}

// ─── Loading (untuk async action) ────────────────────────────────────────────

export function tampilLoading(pesan = 'Mohon tunggu...') {
    SwalBase.fire({
        title: pesan,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
    });
}

export function tutupLoading() {
    Swal.close();
}

// ─── Flash message dari Inertia (dipanggil di app.tsx) ───────────────────────

export function tampilFlash(flash: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}) {
    if (flash.success) {
        alertSukses(flash.success);
    }

    if (flash.error) {
        alertError(flash.error);
    }

    if (flash.warning) {
        alertPeringatan(flash.warning);
    }

    if (flash.info) {
        alertInfo(flash.info);
    }
}

// Re-export Swal asli jika benar-benar perlu custom lanjutan
export { Swal };
