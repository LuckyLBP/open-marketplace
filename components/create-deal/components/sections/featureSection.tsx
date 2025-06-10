"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X, Check } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface Feature {
  id: string;
  text: string;
}

interface FeatureSectionProps {
  features: Feature[];
  setFeatures: (features: Feature[]) => void;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  features,
  setFeatures,
}) => {
  const { t } = useLanguage();

  const handleAddFeature = () => {
    setFeatures([...features, { id: crypto.randomUUID(), text: "" }]);
  };

  const handleRemoveFeature = (index: number) => {
    const updated = [...features];
    updated.splice(index, 1);
    setFeatures(updated);
  };

  const handleFeatureChange = (index: number, text: string) => {
    const updated = [...features];
    updated[index].text = text;
    setFeatures(updated);
  };

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold">{t("Nyckelfunktioner")}</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>{t("Lista funktioner eller fördelar")}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddFeature}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("Lägg till funktion")}
          </Button>
        </div>

        {features.map((feature, index) => (
          <div key={feature.id} className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
            <Input
              value={feature.text}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              placeholder={t("Skriv en fördel med produkten")}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveFeature(index)}
              className="text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSection;
