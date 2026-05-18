interface KategoriStripProps {
    active: string;
    onChange: (value: string) => void;
}

const categories = ['Semua', 'Timbang Hidup', 'Olahan', 'Eceran'];

export default function KategoriStrip({
    active,
    onChange,
}: KategoriStripProps) {
    return (
        <div className="sticky top-0 z-20 -mx-4 border-b border-black/5 bg-[#f7f5ef]/95 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => {
                    const isActive = active === category;

                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => onChange(category)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                                isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'border border-black/5 bg-white text-slate-600 hover:border-primary/20 hover:text-primary'
                            }`}
                        >
                            {category}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
