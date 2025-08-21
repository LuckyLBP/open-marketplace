import { useEffect, useState } from 'react';
import { Clock, Flame } from 'lucide-react';

interface Props {
    expiresAt: Date;
    className?: string;
}

export const TimeLeftLabel = ({ expiresAt, className = '' }: Props) => {
    const [label, setLabel] = useState<string | null>(null);
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        if (!expiresAt || isNaN(new Date(expiresAt).getTime())) {
            setLabel(null);
            return;
        }

        const update = () => {
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setLabel('Erbjudandet har gått ut');
                setIsUrgent(false);
                return;
            }

            const secondMs = 1000;
            const minuteMs = 60 * secondMs;
            const hourMs = 60 * minuteMs;
            const dayMs = 24 * hourMs;

            // Urgent om < 48 timmar kvar
            if (diff < 48 * hourMs) {
                const seconds = Math.floor((diff / secondMs) % 60);
                const minutes = Math.floor((diff / minuteMs) % 60);
                const hours = Math.floor((diff / hourMs) % 24) + Math.floor(diff / dayMs) * 24;
                setLabel(`${hours}h ${minutes}m ${seconds}s`);
                setIsUrgent(true);
            } else {
                const days = Math.max(1, Math.ceil(diff / dayMs));
                setLabel(`${days} dagar kvar`);
                setIsUrgent(false);
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!label) return null;

    return (
        <div
            className={`inline-flex items-center gap-2 w-fit px-3 py-1.5 text-sm font-semibold rounded-full shadow-lg transition-all 
        ${isUrgent
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white animate-pulse'
                    : 'bg-gray-800 text-white'}
        ${className}`}
        >
            {isUrgent ? <Flame className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {label}
        </div>
    );
};
