import React from 'react';
import { Deal } from '../types/deal';

interface DealListProps {
  deals: Deal[];
  title: string;
  emptyText?: string;
  loading?: boolean;
}

export const DealList: React.FC<DealListProps> = ({
  deals,
  title,
  emptyText,
}) => {
  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      )}
      {deals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500">{emptyText || 'Inga erbjudanden.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 flex-1">
                  {deal.title}
                </h4>
                <div className="ml-2 flex-shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      deal.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : deal.status === 'expired'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {deal.status === 'active'
                      ? 'Aktiv'
                      : deal.status === 'expired'
                      ? 'Utgången'
                      : 'Väntande'}
                  </span>
                </div>
              </div>

              {deal.description && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {deal.description}
                </p>
              )}

              {deal.companyName && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Företag</p>
                  <p className="text-sm font-medium text-gray-700">
                    {deal.companyName}
                  </p>
                </div>
              )}

              {deal.expiresAt && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500">
                    {deal.status === 'active' ? 'Går ut:' : 'Gick ut:'}{' '}
                    {deal.expiresAt instanceof Date
                      ? deal.expiresAt.toLocaleDateString('sv-SE')
                      : new Date(deal.expiresAt).toLocaleDateString('sv-SE')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
