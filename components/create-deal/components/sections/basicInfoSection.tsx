"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/language-provider";

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  price: string;
  setPrice: (value: string) => void;
  originalPrice: string;
  setOriginalPrice: (value: string) => void;
  companyName: string;
  setCompanyName: (value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  price,
  setPrice,
  originalPrice,
  setOriginalPrice,
  companyName,
  setCompanyName,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold">{t("Grundläggande information")}</h2>

      <div className="space-y-2">
        <Label htmlFor="title">{t("Titel")} *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("Ange titel för erbjudandet")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">{t("Företagsnamn")} *</Label>
        <Input
          id="companyName"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder={t("Ange företagsnamn")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("Beskrivning")} *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("Beskriv ditt erbjudande")}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t("Pris")} (SEK) *</Label>
          <Input
            id="price"
            type="number"
            min="1"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="originalPrice">{t("Ordinarie pris")} (SEK)</Label>
          <Input
            id="originalPrice"
            type="number"
            min="1"
            step="0.01"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            placeholder={t("Lämna tomt om ej på rea")}
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
