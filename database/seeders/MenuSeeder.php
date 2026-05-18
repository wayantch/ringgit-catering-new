<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    private const FALLBACK_IMAGE = 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=1200';

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all pork-based item names
        $allPorkItems = [
            'Daging Babi Segar',
            'Usus Babi',
            'Jantung Babi',
            'Saksang',
            'Panggang Babi',
            'Sop Tulang Babi',
            'Saksang Porsi',
            'Panggang Porsi',
            'Sop Tulang Porsi',
        ];

        // Delete non-pork items
        MenuItem::whereNotIn('name', $allPorkItems)->delete();

        $categories = [
            ['name' => 'Timbang Hidup', 'type' => 'timbang_hidup'],
            ['name' => 'Daging Olahan', 'type' => 'olahan'],
            ['name' => 'Porsi Eceran', 'type' => 'eceran'],
        ];

        $itemNames = [
            'timbang_hidup' => [
                'Daging Babi Segar',
                'Usus Babi',
                'Jantung Babi',
            ],
            'olahan' => [
                'Saksang',
                'Panggang Babi',
                'Sop Tulang Babi',
            ],
            'eceran' => [
                'Saksang Porsi',
                'Panggang Porsi',
                'Sop Tulang Porsi',
            ],
        ];

        foreach ($categories as $index => $cat) {
            MenuCategory::updateOrCreate(
                ['type' => $cat['type']],
                [
                    'name' => $cat['name'],
                    'slug' => Str::slug($cat['name']),
                    'description' => $cat['name'] . ' untuk pelanggan',
                    'sort_order' => $index + 1,
                    'is_active' => true,
                ]
            );

            // create some sample items for each category
            foreach ($itemNames[$cat['type']] as $i => $name) {

                MenuItem::updateOrCreate(
                    ['name' => $name],
                    [
                        'category_id' => null,
                        'description' => $this->getItemDescription($cat['type'], $name),
                        'image' => $this->getItemImageUrl($cat['type'], $name),
                        // Use rounded thousand values so prices look like typical IDs (e.g. 23000)
                        'base_price' => $cat['type'] === 'eceran' ? rand(15, 45) * 1000 : rand(30, 150) * 1000,
                        'unit' => $cat['type'] === 'timbang_hidup' ? 'kg' : ($cat['type'] === 'eceran' ? 'pcs' : 'porsi'),
                        'is_available' => true,
                        'stock_quantity' => 100,
                        'min_order_hours' => $cat['type'] === 'eceran' ? 72 : 24,
                        'sort_order' => $i + 1,
                    ]
                );
            }
        }
    }

    private function getItemDescription(string $type, string $name): string
    {
        $descriptions = [
            'timbang_hidup' => [
                'Daging Babi Segar' => 'Daging babi segar berkualitas tinggi, siap untuk dimasak atau diproses sesuai kebutuhan Anda.',
                'Daging Babi Pilihan Premium' => 'Daging babi pilihan premium dengan kualitas terbaik, cocok untuk hidangan spesial.',
                'Usus Babi' => 'Usus babi bersih dan segar, sempurna untuk membuat olahan tradisional.',
                'Jantung Babi' => 'Jantung babi segar, kaya nutrisi dan cocok untuk berbagai masakan.',
                'Hati Babi' => 'Hati babi berkualitas, bahan ideal untuk masakan tradisional dan modern.',
                'Tulang Babi' => 'Tulang babi segar untuk membuat kaldu dan sup yang gurih.',
            ],
            'olahan' => [
                'Saksang' => 'Saksang babi tradisional dengan bumbu khas yang nikmat dan menggugah selera.',
                'Panggang Babi' => 'Daging babi yang dipanggang sempurna dengan bumbu yang lezat.',
                'Sop Tulang Babi' => 'Sup tulang babi yang gurih dengan kaldu yang kaya rasa.',
                'Babi Goreng Crispy' => 'Babi goreng dengan tekstur crispy di luar dan lembut di dalam.',
                'Daging Babi Kuah Kental' => 'Daging babi dengan kuah kental yang nikmat dan menggugah selera.',
                'Bumbu Babi Kemasan' => 'Bumbu siap pakai untuk memasak babi dengan cita rasa otentik.',
            ],
            'eceran' => [
                'Saksang Porsi' => 'Saksang tradisional dalam porsi pas untuk 1-2 orang.',
                'Panggang Porsi' => 'Panggang babi dalam porsi individual yang praktis.',
                'Sop Tulang Porsi' => 'Sop tulang babi dalam kemasan higienis, siap disajikan.',
                'Babi Goreng Porsi' => 'Babi goreng crispy dalam porsi menarik.',
                'Paket Nasi + Babi' => 'Paket hemat berisi nasi dengan pilihan lauk babi.',
                'Sambal Babi Kemasan' => 'Sambal babi kemasan yang siap disajikan dengan berbagai hidangan.',
            ],
        ];

        return $descriptions[$type][$name] ?? 'Menu pilihan berkualitas dari Ringgit Catering.';
    }

    private function getItemImageUrl(string $type, string $name): string
    {
        $images = [
            'Daging Babi Segar' => 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Daging Babi Pilihan Premium' => 'https://images.pexels.com/photos/1927377/pexels-photo-1927377.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Usus Babi' => 'https://images.pexels.com/photos/8309615/pexels-photo-8309615.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Jantung Babi' => 'https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Hati Babi' => 'https://images.pexels.com/photos/566566/pexels-photo-566566.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Tulang Babi' => 'https://images.pexels.com/photos/533325/pexels-photo-533325.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Saksang' => 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Panggang Babi' => 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Sop Tulang Babi' => 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Babi Goreng Crispy' => 'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Daging Babi Kuah Kental' => 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Bumbu Babi Kemasan' => 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Saksang Porsi' => 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Panggang Porsi' => 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Sop Tulang Porsi' => 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Babi Goreng Porsi' => 'https://images.pexels.com/photos/410648/pexels-photo-410648.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Paket Nasi + Babi' => 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'Sambal Babi Kemasan' => 'https://images.pexels.com/photos/6941019/pexels-photo-6941019.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ];

        $fallbackByType = [
            'timbang_hidup' => 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'olahan' => 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg?auto=compress&cs=tinysrgb&w=1200',
            'eceran' => 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1200',
        ];

        return $images[$name] ?? $fallbackByType[$type] ?? self::FALLBACK_IMAGE;
    }
}
