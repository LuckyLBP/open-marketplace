import { useEffect, useState } from 'react';

interface Props {
    expiresAt: Date;
}

export const TimeLeftLabel = ({ expiresAt }: Props) => {
    const [timeLeft, setTimeLeft] = useState<string | null>(null);

    useEffect(() => {
        if (!expiresAt || isNaN(new Date(expiresAt).getTime())) {
            console.warn('Ogiltigt expiresAt-värde:', expiresAt);
            setTimeLeft(null);
            return;
        }

        const updateTimer = () => {
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('Erbjudandet har gått ut');
                return;
            }

            const seconds = Math.floor((diff / 1000) % 60);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (days >= 2) {
                setTimeLeft(`${days} dagar kvar av erbjudandet`);
            } else {
                setTimeLeft(
                    `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`
                );
            }
        };

        updateTimer(); // direkt
        const interval = setInterval(updateTimer, 1000); // varje sekund

        return () => clearInterval(interval);
    }, [expiresAt]);

    if (!timeLeft) return null;

    return (
        <p className="text-sm text-muted-foreground mb-2">
            {timeLeft}
        </p>
    );
};
