import React from 'react';
import { Deal } from '../types/deal';

interface DealListProps {
    deals: Deal[];
    title: string;
    emptyText?: string;
    loading?: boolean;
}

export const DealList: React.FC<DealListProps> = ({ deals, title, emptyText }) => {
    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">{emptyText || 'Inga erbjudanden.'}</p>
            ) : (
                <ul className="list-disc list-inside space-y-1">
                    {deals.map((deal) => (
                        <li key={deal.id}>{deal.title}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};