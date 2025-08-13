"use client";

import Image from "next/image";
import { useLanguage } from "@/components/language-provider";
import { TimeLeftLabel } from "@/components/deals/timeLeftLabel";
import { ProductImage, Feature, Specification } from "@/components/types/deal";

interface PreviewSectionProps {
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;
  subcategory: string;
  images: ProductImage[];
  features: Feature[];
  specifications: Specification[];
  inStock: boolean;
  stockQuantity: string;
  sku: string;
  duration: number;
  companyName: string;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({
  title,
  description,
  price,
  originalPrice,
  category,
  subcategory,
  images,
  features,
  specifications,
  inStock,
  stockQuantity,
  sku,
  duration,
  companyName,
}) => {
  const { t } = useLanguage();
  const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

  return (
    <div className="bg-gray-50 border rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">{t("Förhandsgranskning")}</h2>

      {/* Företag */}
      <p className="text-sm text-gray-700 font-medium mb-2">
        {t("Företag")}: {companyName}
      </p>

      {/* Bilder */}
      {images.length > 0 && (
        <div className="flex space-x-2 overflow-x-auto mb-4">
          {images.map((img, i) => (
            <div key={i} className="relative w-32 h-32 flex-shrink-0 border rounded overflow-hidden">
              <Image src={img.preview} alt={`image-${i}`} fill objectFit="cover" />
            </div>
          ))}
        </div>
      )}

      {/* Titel och beskrivning */}
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">{description}</p>

      {/* Pris */}
      <div className="mb-2">
        <span className="text-green-600 font-semibold text-lg">{price} kr</span>
        {originalPrice && (
          <span className="ml-2 line-through text-gray-400">{originalPrice} kr</span>
        )}
      </div>

      <div className="text-sm text-purple-700 font-medium mb-2">
        <TimeLeftLabel expiresAt={expiresAt} />
      </div>

      {/* Kategori */}
      <p className="text-sm text-gray-500 mb-2">
        {t("Kategori")}: {category} / {subcategory}
      </p>

      {/* Lagerinfo */}
      <p className="text-sm text-gray-500 mb-2">
        {inStock ? `${t("I lager")} (${stockQuantity} st)` : t("Slut i lager")}
      </p>
      {sku && <p className="text-sm text-gray-400">{t("SKU")}: {sku}</p>}

      {/* Funktioner */}
      {features.length > 0 && (
        <ul className="list-disc pl-5 mt-4 mb-2">
          {features.map((f) => f.text && (
            <li key={f.id} className="text-sm">{f.text}</li>
          ))}
        </ul>
      )}

      {/* Specifikationer */}
      {specifications.length > 0 && (
        <div className="mt-4 space-y-1">
          {specifications.map((s) =>
            s.key && s.value ? (
              <div key={s.id} className="text-sm flex justify-between">
                <span className="text-gray-600">{s.key}</span>
                <span className="text-gray-800 font-medium">{s.value}</span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

export default PreviewSection;
