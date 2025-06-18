"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface Specification {
  id: string;
  key: string;
  value: string;
}

interface SpecificationSectionProps {
  specifications: Specification[];
  setSpecifications: (specs: Specification[]) => void;
}

const SpecificationSection: React.FC<SpecificationSectionProps> = ({
  specifications,
  setSpecifications,
}) => {
  const { t } = useLanguage();

  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  };

  const removeSpecification = (index: number) => {
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  return (
    <div className="space-y-6 mb-8">
      <h2 className="text-xl font-semibold">{t("Specifikationer")}</h2>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>{t("Lägg till tekniska specifikationer")}</Label>
          <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
            <Plus className="h-4 w-4 mr-1" />
            {t("Lägg till specifikation")}
          </Button>
        </div>

        {specifications.map((spec, index) => (
          <div key={spec.id} className="flex items-center space-x-2">
            <Input
              placeholder={t("Egenskap (t.ex. Skärm)")}
              value={spec.key}
              onChange={(e) => updateSpecification(index, "key", e.target.value)}
            />
            <Input
              placeholder={t("Värde (t.ex. 6.7 tum)")}
              value={spec.value}
              onChange={(e) => updateSpecification(index, "value", e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeSpecification(index)}
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

export default SpecificationSection;
