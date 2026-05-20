import { useEffect, useRef, useState } from 'react';

function useInView() {
    const ref = useRef(null);
    const [vis, setVis] = useState(false);
    useEffect(() => {
        const o = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
setVis(true);
}
            },
            { threshold: 0.1 },
        );

        if (ref.current) {
o.observe(ref.current);
}

        return () => o.disconnect();
    }, []);

    return [ref, vis];
}

interface FadeUpProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}

export default function FadeUp({
    children,
    delay = 0,
    className = '',
}: FadeUpProps) {
    const [ref, vis] = useInView();

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: vis ? 1 : 0,
                transform: vis ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
            }}
        >
            {children}
        </div>
    );
}
