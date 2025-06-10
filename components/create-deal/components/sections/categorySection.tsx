"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/language-provider";

interface CategorySectionProps {
  category: string;
  setCategory: (value: string) => void;
  subcategory: string;
  setSubcategory: (value: string) => void;
}

const categorySubcategoryMap: Record<string, string[]> = {
  elektronik: ["mobiltelefoner", "datorer", "ljud-bild", "wearables", "tillbehor"],
  mode: ["herr", "dam", "barn", "skor", "vaska", "accessoarer"],
  hemmet: ["mobler", "inredning", "kok", "tradgard", "belysning"],
  "halsa-skonhet": ["hudvard", "makeup", "harvard", "dofter", "valmaende"],
  "hobby-fritid": ["sport", "bocker", "spel-konsol", "utomhus", "handarbete"],
  annat: ["mat", "dryck", "present", "ovrigt"],
};

const displayNames: Record<string, string> = {
  elektronik: "Elektronik",
  mode: "Mode",
  hemmet: "Hemmet",
  "halsa-skonhet": "Hälsa & Skönhet",
  "hobby-fritid": "Hobby & Fritid",
  annat: "Annat",
  mobiltelefoner: "Mobiltelefoner",
  datorer: "Datorer",
  "ljud-bild": "Ljud & Bild",
  wearables: "Wearables",
  tillbehor: "Tillbehör",
  herr: "Herr",
  dam: "Dam",
  barn: "Barn",
  skor: "Skor",
  vaska: "Väskor",
  accessoarer: "Accessoarer",
  mobler: "Möbler",
  inredning: "Inredning",
  kok: "Kök",
  tradgard: "Trädgård",
  belysning: "Belysning",
  hudvard: "Hudvård",
  makeup: "Makeup",
  harvard: "Hårvård",
  dofter: "Dofter",
  valmaende: "Välmående",
  sport: "Sport",
  bocker: "Böcker",
  "spel-konsol": "Spel & Konsol",
  utomhus: "Utomhus",
  handarbete: "Handarbete",
  mat: "Mat",
  dryck: "Dryck",
  present: "Present",
  ovrigt: "Övrigt",
};

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  setCategory,
  subcategory,
  setSubcategory,
}) => {
  const { t } = useLanguage();

  const subcategories = categorySubcategoryMap[category] || [];

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-xl font-semibold">{t("Kategori")}</h2>

      {/* Kategori */}
      <div>
        <Label>{t("Välj kategori")}</Label>
        <Select value={category} onValueChange={(val) => {
          setCategory(val);
          setSubcategory(""); // reset subcategory on category change
        }}>
          <SelectTrigger className="w-full mt-1">
            <SelectValue placeholder={t("Välj kategori")} />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(categorySubcategoryMap).map((cat) => (
              <SelectItem key={cat} value={cat}>
                {displayNames[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Underkategori */}
      {subcategories.length > 0 && (
        <div>
          <Label>{t("Välj underkategori")}</Label>
          <Select value={subcategory} onValueChange={setSubcategory}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder={t("Välj underkategori")} />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {displayNames[sub]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CategorySection;
