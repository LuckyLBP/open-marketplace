"use client";

import React, { useRef } from "react";
import { Label } from "@/components/ui/label";
import { ImageIcon, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import type { ProductImage } from "@/components/types/deal"; 

interface ImageUploadSectionProps {
  images: ProductImage[];
  setImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  images,
  setImages,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Selected files:", e.target.files);
    if (e.target.files) {
      console.log("Files count:", e.target.files.length);
      const newImages: ProductImage[] = Array.from(e.target.files).map(
        (file) => ({
          file,
          preview: URL.createObjectURL(file),
          isPrimary: images.length === 0,
        })
      );
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = [...images];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);

    if (!updated.some((img) => img.isPrimary) && updated[0]) {
      updated[0].isPrimary = true;
    }

    setImages(updated);
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages(
      images.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold">{t("Bilder")}</h2>

      <div
        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
          multiple
        />

        <div className="mb-2 rounded-full bg-purple-100 p-2">
          <ImageIcon className="h-6 w-6 text-purple-600" />
        </div>
        <p className="mb-1 font-medium">{t("Ladda upp bilder")}</p>
        <p className="text-sm text-muted-foreground text-center">
          {t("Dra & släpp eller klicka för att välja flera bilder")}
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative border rounded-md overflow-hidden ${image.isPrimary ? "ring-2 ring-purple-600" : ""
                }`}
            >
              <img
                src={image.preview}
                alt={`Preview ${index + 1}`}
                className="w-full aspect-square object-cover"
              />

              <div className="absolute top-2 right-2 flex space-x-1">
                <button
                  type="button"
                  onClick={() => handleSetPrimaryImage(index)}
                  className={`p-1 rounded-full ${image.isPrimary
                      ? "bg-purple-600 text-white"
                      : "bg-white/80 text-gray-700 hover:bg-white"
                    }`}
                  title={t("Ange som huvudbild")}
                >
                  <Star className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1 rounded-full bg-white/80 text-red-600 hover:bg-white"
                  title={t("Ta bort bild")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {image.isPrimary && (
                <div className="absolute bottom-0 left-0 right-0 bg-purple-600 py-1 px-2">
                  <p className="text-white text-xs text-center">
                    {t("Huvudbild")}
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

export default ImageUploadSection;
