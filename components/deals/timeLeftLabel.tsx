'use client';

import { useEffect, useState } from 'react';

type Props = {
    expiresAt: Date;
};

export function TimeLeftLabel({ expiresAt }: Props) {
    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff / (1000 * 60)) % 60);

            if (diff <= 0) {
                setTimeLeft("Erbjudandet har gått ut");
            } else if (diff < 48 * 60 * 60 * 1000) {
                setTimeLeft(`${hours}h ${minutes}min kvar`);
            } else {
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                setTimeLeft(`${days} dagar kvar`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60 * 1000); 

        return () => clearInterval(interval);
    }, [expiresAt]);

    return (
        <p className="text-sm text-muted-foreground italic">
            {timeLeft}
        </p>
    );
}
