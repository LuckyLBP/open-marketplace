"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/language-provider";

interface InventorySectionProps {
  inStock: boolean;
  setInStock: (value: boolean) => void;
  stockQuantity: string;
  setStockQuantity: (value: string) => void;
  sku: string;
  setSku: (value: string) => void;
}

const InventorySection: React.FC<InventorySectionProps> = ({
  inStock,
  setInStock,
  stockQuantity,
  setStockQuantity,
  sku,
  setSku,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold">{t("Lager & Artikelnummer")}</h2>

      {/* Lagerstatus */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="in-stock">{t("I lager?")}</Label>
          <p className="text-sm text-muted-foreground">
            {t("Är denna produkt tillgänglig för köp?")}
          </p>
        </div>
        <Switch
          id="in-stock"
          checked={inStock}
          onCheckedChange={setInStock}
        />
      </div>

      {/* Antal i lager */}
      {inStock && (
        <div className="space-y-2">
          <Label htmlFor="stock-quantity">{t("Antal i lager")}</Label>
          <Input
            id="stock-quantity"
            type="number"
            min="0"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="0"
          />
        </div>
      )}

      {/* SKU */}
      <div className="space-y-2">
        <Label htmlFor="sku">{t("Artikelnummer (SKU)")}</Label>
        <Input
          id="sku"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder={t("Ange produktens artikelnummer")}
        />
      </div>
    </div>
  );
};

export default InventorySection;
