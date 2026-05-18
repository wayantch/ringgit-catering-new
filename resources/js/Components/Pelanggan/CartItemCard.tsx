import CartItemCardEceran from './CartItemCardEceran';
import CartItemCardTimbang from './CartItemCardTimbang';

export interface CartItemMenuTier {
    kode: string;
    is_half: boolean;
    berat_min: number;
    berat_max: number | null;
    harga_mentah: number;
    harga_matang: number;
    cashback: number;
}

export interface CartItemVariant {
    id: string;
    label: string;
    harga: number;
}

export interface CartItemMenuItem {
    id: string;
    name: string;
    image: string | null;
    sub_type: 'saksang' | 'panggang' | 'sop_tulang' | 'paket_pass' | null;
    is_bundle: boolean;
    bundle_desc: string | null;
    free_ongkir_km: number | null;
    min_price: number | null;
    is_price_pending: boolean;
    category: {
        type: 'timbang_hidup' | 'olahan' | 'eceran' | null;
    };
    tiers: CartItemMenuTier[];
    variants: CartItemVariant[];
}

export interface CartItemTimbangHidup {
    id: string;
    menu_type: 'timbang_hidup';
    menu_item: CartItemMenuItem;
    tier: CartItemMenuTier | null;
    berat: number;
    kondisi: 'mentah' | 'mateng';
    harga_per_kg: number | null;
    subtotal: number | null;
    adat_group: 'batak' | 'nias' | 'tanpa_adat' | 'lainnya' | null;
    adat_parts: string[];
    adat_notes: string | null;
    notes: string | null;
}

export interface CartItemEceran {
    id: string;
    menu_type: 'eceran';
    menu_item: CartItemMenuItem;
    variant: CartItemVariant | null;
    qty: number;
    subtotal: number | null;
    notes: string | null;
}

export type CartItem = CartItemTimbangHidup | CartItemEceran;

interface CartItemCardProps {
    item: CartItem;
}

export default function CartItemCard({ item }: CartItemCardProps) {
    return item.menu_type === 'timbang_hidup' ? (
        <CartItemCardTimbang item={item} />
    ) : (
        <CartItemCardEceran item={item} />
    );
}
