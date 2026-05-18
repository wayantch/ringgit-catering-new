export type CategoryType = 'timbang_hidup' | 'olahan' | 'eceran';

export type KondisiValue =
    | 'adat'
    | 'saksang'
    | 'panggang'
    | 'sop'
    | 'mentah'
    | 'mateng'
    | 'satuan';

export const KONDISI_OPTIONS: Record<
    CategoryType,
    Array<{ value: KondisiValue; label: string; emoji: string }>
> = {
    timbang_hidup: [
        { value: 'adat', label: 'Adat', emoji: '🏺' },
        { value: 'saksang', label: 'Saksang', emoji: '🍲' },
        { value: 'panggang', label: 'Panggang', emoji: '🔥' },
        { value: 'sop', label: 'Sop', emoji: '🥣' },
    ],
    olahan: [
        { value: 'mentah', label: 'Mentah', emoji: '🥩' },
        { value: 'mateng', label: 'Mateng', emoji: '🍳' },
    ],
    eceran: [
        { value: 'satuan', label: 'Satuan', emoji: '🛒' },
        { value: 'adat', label: 'Adat', emoji: '🏺' },
    ],
};

export const ADAT_OPTIONS = [
    { value: 'batak_lengkap', label: 'Batak — Lengkap', group: 'Adat Batak' },
    { value: 'batak_kepala', label: 'Batak — Kepala', group: 'Adat Batak' },
    { value: 'batak_aliang', label: 'Batak — Aliang', group: 'Adat Batak' },
    { value: 'batak_somba', label: 'Batak — Somba', group: 'Adat Batak' },
    { value: 'batak_soit', label: 'Batak — Soit', group: 'Adat Batak' },
    { value: 'batak_ekor', label: 'Batak — Ekor', group: 'Adat Batak' },
    { value: 'batak_jeroan', label: 'Batak — Jeroan', group: 'Adat Batak' },
    {
        value: 'nias_simbi_simbi',
        label: 'Nias — Simbi-Simbi',
        group: 'Adat Nias',
    },
    { value: 'lainnya', label: 'Lainnya', group: 'Lainnya' },
] as const;

export const requiresAdat = (kondisi: KondisiValue | ''): boolean =>
    kondisi === 'adat';
