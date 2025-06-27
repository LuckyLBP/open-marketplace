'use client';

import { Clock, ShoppingCart, TrendingUp, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FloatingAdPreview({ deal }: { deal: any }) {
    const discount =
        deal.originalPrice && deal.originalPrice > deal.price
            ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
            : 0;

    const imageUrl = deal.imageUrl || deal.images?.[0]?.url || '';

    return (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform transition-all duration-500">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 text-center relative">
                <div className="flex items-center justify-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span className="font-bold text-sm uppercase tracking-wide">BOOST ERBJUDANDE</span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                            src={imageUrl}
                            alt={deal.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm text-gray-900 truncate">{deal.title}</h3>
                                <p className="text-xs text-gray-600 truncate">{deal.description}</p>
                            </div>

                            {discount > 0 && (
                                <Badge className="bg-red-500 text-white text-xs ml-2 flex-shrink-0">
                                    -{discount}%
                                </Badge>
                            )}
                        </div>

                        <div className="mb-2">
                            {deal.originalPrice && (
                                <div className="text-xs line-through text-gray-500">
                                    {new Intl.NumberFormat('sv-SE', {
                                        style: 'currency',
                                        currency: 'SEK',
                                    }).format(deal.originalPrice)}
                                </div>
                            )}
                            <div className="text-lg font-bold text-red-600">
                                {new Intl.NumberFormat('sv-SE', {
                                    style: 'currency',
                                    currency: 'SEK',
                                }).format(deal.price)}
                            </div>
                        </div>

                        <div className="flex items-center text-xs text-orange-600 mb-3">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="font-medium">Förhandsvisning</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Köp nu
                    </Button>
                    <Button variant="outline" className="px-4 text-sm">
                        <TrendingUp className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-100">
                <span className="text-xs text-gray-400">Sponsrat innehåll (förhandsvisning)</span>
            </div>
        </div>
    );
}
