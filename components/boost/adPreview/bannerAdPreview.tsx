import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export default function BannerAdPreview({ deal }: { deal: any }) {
  const discount =
    deal.originalPrice && deal.originalPrice > deal.price
      ? Math.round(
          ((deal.originalPrice - deal.price) / deal.originalPrice) * 100
        )
      : 0;

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4 rounded-lg shadow-md">
      <div className="flex items-center space-x-3 mb-2">
        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
          <Sparkles className="h-3 w-3 mr-1" />
          Sponsrat
        </Badge>
        <p className="text-xs text-gray-300">(Förhandsgranskning)</p>
      </div>

      <h3 className="text-lg font-bold mb-1 truncate">{deal.title}</h3>

      <p className="text-sm opacity-90 truncate">{deal.description}</p>

      {discount > 0 && (
        <p className="mt-2 text-xs text-green-300 font-semibold">
          Nu {discount}% billigare än ord. pris
        </p>
      )}
    </div>
  );
}
