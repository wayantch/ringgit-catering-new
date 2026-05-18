interface CategoryTabBarProps {
    categories: Array<{ id: number; name: string }>;
    activeCategoryId: number | null;
    onSelect: (categoryId: number) => void;
}

export default function CategoryTabBar({
    categories,
    activeCategoryId,
    onSelect,
}: CategoryTabBarProps) {
    return (
        <div className="no-scrollbar flex gap-5 overflow-x-auto border-b border-primary/10 px-4 pb-2">
            {categories.map((category) => {
                const isActive = activeCategoryId === category.id;

                return (
                    <button
                        key={category.id}
                        type="button"
                        className={`relative pb-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                            isActive ? 'text-primary' : 'text-slate-500'
                        }`}
                        onClick={() => onSelect(category.id)}
                    >
                        {category.name}
                        {isActive && (
                            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
