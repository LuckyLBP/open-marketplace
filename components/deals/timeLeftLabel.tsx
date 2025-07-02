import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props {
    expiresAt: Date;
    className?: string; // Tillåter extern styling som t.ex. position
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
                return;
            }

            const seconds = Math.floor((diff / 1000) % 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (diff < 48 * 60 * 60 * 1000) {
                setLabel(`${hours + days * 24}h ${minutes}m ${seconds}s`);
                setIsUrgent(true);
            } else {
                setLabel(`${days} dagar kvar`);
                setIsUrgent(false);
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!label) return null;

    const badgeColor = isUrgent ? 'bg-red-600 text-white' : 'bg-gray-800 text-white';

    return (
        <div className={`inline-flex items-center gap-1 w-fit px-3 py-1 text-xs font-medium rounded-full shadow-sm ${badgeColor} ${className}`}>
            <Clock className="h-3 w-3" />
            {label}
        </div>
    );

};
