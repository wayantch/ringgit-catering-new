<?php

use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;

beforeEach(function (): void {
    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql.database', 'ringgit-catering-db');
    Config::set('database.connections.mysql.host', '127.0.0.1');
    Config::set('database.connections.mysql.port', '3306');
});

it('keeps the print page empty until a date filter is applied', function (): void {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.print.index'));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Print/Index')
            ->where('printData.has_filters', false)
            ->where('printData.groups', [])
            ->where('printData.grand_total', 0)
    );
});

it('returns only diproses orders grouped by booking date and sorted by time', function (): void {
    $admin = User::factory()->admin()->create();
    $uniqueSuffix = Str::uuid()->toString();
    $dateSeed = str_replace('-', '', $uniqueSuffix);
    $month = (hexdec(substr($dateSeed, 0, 2)) % 12) + 1;
    $day = (hexdec(substr($dateSeed, 2, 2)) % 27) + 1;
    $bookingDate = sprintf('2099-%02d-%02d', $month, $day);

    $category = MenuCategory::query()->firstOrCreate(
        ['type' => 'timbang_hidup'],
        [
            'name' => 'Timbang Hidup',
            'slug' => 'timbang-hidup',
            'description' => 'Kategori timbang hidup untuk print test',
            'sort_order' => 1,
            'is_active' => true,
        ],
    );

    $menuItem = MenuItem::create([
        'category_id' => $category->id,
        'name' => 'Babi Test Print '.$uniqueSuffix,
        'base_price' => 100000,
        'unit' => 'kg',
        'is_available' => true,
        'sort_order' => 1,
        'menu_type' => 'timbang_hidup',
    ]);

    $firstOrder = Order::create([
        'source' => 'admin',
        'order_number' => 'ORD-20990101-PRINT-001-'.$uniqueSuffix,
        'customer_name' => 'Cetak Satu',
        'customer_phone' => '081200000001',
        'order_type' => 'takeaway',
        'booking_date' => $bookingDate,
        'booking_time' => '07:15:00',
        'pickup_time' => '07:15:00',
        'delivery_time' => null,
        'order_status' => 'diproses',
        'subtotal' => 120000,
        'total_amount' => 120000,
        'dp_amount' => 30000,
        'remaining_amount' => 90000,
    ]);

    OrderItem::create([
        'order_id' => $firstOrder->id,
        'menu_item_id' => $menuItem->id,
        'menu_name' => 'Babi Test Print '.$uniqueSuffix,
        'menu_category_type' => 'timbang_hidup',
        'menu_unit' => 'kg',
        'kondisi_produk' => 'adat',
        'adat_type' => 'batak_kepala,batak_ekor',
        'quantity' => 1.5,
        'unit_price' => 80000,
        'subtotal' => 120000,
    ]);

    Payment::create([
        'order_id' => $firstOrder->id,
        'type' => 'dp',
        'expected_amount' => 30000,
        'unique_code' => 111,
        'status' => 'verified',
        'verified_at' => Carbon::parse('2037-01-02 08:30:00'),
    ]);

    $secondOrder = Order::create([
        'source' => 'admin',
        'order_number' => 'ORD-20990101-PRINT-002-'.$uniqueSuffix,
        'customer_name' => 'Cetak Dua',
        'customer_phone' => '081200000002',
        'order_type' => 'delivery',
        'booking_date' => $bookingDate,
        'booking_time' => '09:30:00',
        'pickup_time' => null,
        'delivery_time' => '09:30:00',
        'order_status' => 'diproses',
        'subtotal' => 50000,
        'total_amount' => 50000,
        'dp_amount' => 0,
        'remaining_amount' => 0,
    ]);

    OrderItem::create([
        'order_id' => $secondOrder->id,
        'menu_item_id' => $menuItem->id,
        'menu_name' => 'Ayam Panggang '.$uniqueSuffix,
        'menu_category_type' => 'olahan',
        'menu_unit' => 'porsi',
        'kondisi_produk' => 'panggang',
        'adat_type' => null,
        'quantity' => 2,
        'unit_price' => 25000,
        'subtotal' => 50000,
    ]);

    Payment::create([
        'order_id' => $secondOrder->id,
        'type' => 'pelunasan',
        'expected_amount' => 50000,
        'unique_code' => 222,
        'status' => 'verified',
        'verified_at' => Carbon::parse('2037-01-03 14:45:00'),
    ]);

    Order::create([
        'source' => 'admin',
        'order_number' => 'ORD-20990101-PRINT-003-'.$uniqueSuffix,
        'customer_name' => 'Tidak Muncul',
        'customer_phone' => '081200000003',
        'order_type' => 'takeaway',
        'booking_date' => $bookingDate,
        'booking_time' => '06:00:00',
        'pickup_time' => '06:00:00',
        'delivery_time' => null,
        'order_status' => 'baru',
        'subtotal' => 75000,
        'total_amount' => 75000,
        'dp_amount' => 0,
        'remaining_amount' => 0,
    ]);

    $response = $this->actingAs($admin)->get(route('admin.print.index', [
        'tanggal' => $bookingDate,
    ]));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Print/Index')
            ->where('printData.has_filters', true)
            ->where('printData.range_exceeded', false)
            ->where('printData.groups.0.booking_date', $bookingDate)
            ->where('printData.groups.0.rows.0.customer_name', 'Cetak Satu')
            ->where('printData.groups.0.rows.0.detail_label', 'Babi Test Print '.$uniqueSuffix.' — Adat Batak — Kepala, Ekor')
            ->where('printData.groups.0.rows.0.payment_method', 'dp')
            ->where('printData.groups.0.rows.0.payment_date', '02/01/2037')
            ->where('printData.groups.0.rows.0.jam', '07:15')
            ->where('printData.groups.0.rows.1.customer_name', 'Cetak Dua')
            ->where('printData.groups.0.rows.1.detail_label', 'Ayam Panggang '.$uniqueSuffix.' — Panggang')
            ->where('printData.groups.0.rows.1.payment_method', 'pembayaran penuh')
            ->where('printData.groups.0.rows.1.payment_date', '03/01/2037')
            ->where('printData.groups.0.rows.1.jam', '09:30')
            ->where('printData.grand_total', 170000)
    );
});

it('rejects print ranges longer than seven days', function (): void {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.print.index', [
        'dari' => '2099-01-01',
        'sampai' => '2099-01-09',
    ]));

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('Admin/Print/Index')
            ->where('printData.has_filters', true)
            ->where('printData.range_exceeded', true)
            ->where('printData.groups', [])
            ->where('printData.grand_total', 0)
    );
});
