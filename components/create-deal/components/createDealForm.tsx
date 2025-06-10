'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { useFirebase } from "@/components/firebase-provider";
import { useLanguage } from "@/components/language-provider";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import BasicInfoSection from "./sections/basicInfoSection";
import ImageUploadSection from "./sections/imageUploadSection";
import CategorySection from "./sections/categorySection";
import FeatureSection from "./sections/featureSection";
import SpecificationSection from "./sections/specificationSection";
import InventorySection from "./sections/inventorySection";
import PreviewSection from "./sections/previewSection";

import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type ProductImage = {
  file: File;
  preview: string;
  isPrimary: boolean;
  uploading?: boolean;
  progress?: number;
};

type Feature = {
  id: string;
  text: string;
};

type Specification = {
  id: string;
  key: string;
  value: string;
};

export default function CreateDealForm() {
  const router = useRouter();
  const { user } = useFirebase();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("basic");
  const [duration, setDuration] = useState(24);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState("10");
  const [sku, setSku] = useState("");

  const [features, setFeatures] = useState<Feature[]>([
    { id: crypto.randomUUID(), text: "" },
  ]);
  const [specifications, setSpecifications] = useState<Specification[]>([
    { id: crypto.randomUUID(), key: "", value: "" },
  ]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("elektronik");
  const [subcategory, setSubcategory] = useState("");
  const [companyName, setCompanyName] = useState("")

  const validateForm = () => {
    if (!title) {
      toast({
        title: t("Fel"),
        description: t("Ange en titel för erbjudandet."),
        variant: "destructive",
      });
      setActiveTab("basic");
      return false;
    }
    if (!companyName) {
      toast({
        title: t("Fel"),
        description: t("Ange företagsnamn."),
        variant: "destructive",
      });
      setActiveTab("basic");
      return false;
    }

    if (!description) {
      toast({
        title: t("Fel"),
        description: t("Ange en beskrivning för erbjudandet."),
        variant: "destructive",
      });
      setActiveTab("basic");
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: t("Fel"),
        description: t("Ange ett giltigt pris för erbjudandet."),
        variant: "destructive",
      });
      setActiveTab("basic");
      return false;
    }
    if (images.length === 0) {
      toast({
        title: t("Fel"),
        description: t("Ladda upp minst en bild för erbjudandet."),
        variant: "destructive",
      });
      setActiveTab("images");
      return false;
    }
    if (!category) {
      toast({
        title: t("Fel"),
        description: t("Välj en kategori."),
        variant: "destructive",
      });
      setActiveTab("basic");
      return false;
    }
    if (!subcategory) {
      toast({
        title: t("Fel"),
        description: t("Välj en underkategori."),
        variant: "destructive",
      });
      setActiveTab("basic");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const storage = getStorage();
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          if (img.preview.startsWith("https://")) {
            return { url: img.preview, isPrimary: img.isPrimary };
          }
          const fileRef = ref(storage, `deals/${crypto.randomUUID()}`);
          await uploadBytes(fileRef, img.file);
          const url = await getDownloadURL(fileRef);
          return { url, isPrimary: img.isPrimary };
        })
      );

      const dealData = {
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category,
        subcategory,
        inStock,
        stockQuantity: parseInt(stockQuantity),
        sku,
        features: features.filter((f) => f.text),
        specifications: specifications.filter((s) => s.key && s.value),
        images: uploadedImages,
        imageUrl: uploadedImages.find((img) => img.isPrimary)?.url || "",
        duration,
        expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
        companyName,
      };

      await addDoc(collection(db, "deals"), dealData);

      toast({
        title: t("Succé"),
        description: t("Erbjudandet har sparats!"),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Fel vid uppladdning:", err);
      toast({
        title: t("Fel"),
        description: t("Något gick fel vid sparande. Försök igen."),
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-6 border border-purple-600 rounded-lg bg-white shadow-md">
        <h1 className="text-3xl font-bold mb-6">{t("Create Deal")}</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 gap-2 rounded-md bg-gray-100 p-1 mb-6">
              <TabsTrigger value="basic" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-purple-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white">{t("Grundläggande")}</TabsTrigger>
              <TabsTrigger value="images" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-purple-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white">{t("Bilder")}</TabsTrigger>
              <TabsTrigger value="details" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-purple-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white">{t("Detaljer")}</TabsTrigger>
              <TabsTrigger value="inventory" className="rounded-full px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-purple-200 data-[state=active]:bg-purple-600 data-[state=active]:text-white">{t("Lager")}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoSection
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                price={price}
                setPrice={setPrice}
                originalPrice={originalPrice}
                setOriginalPrice={setOriginalPrice}
                companyName={companyName}
                setCompanyName={setCompanyName}
              />

              <CategorySection
                category={category}
                setCategory={setCategory}
                subcategory={subcategory}
                setSubcategory={setSubcategory}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("Varaktighet")}
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={12}>12 timmar</option>
                  <option value={24}>24 timmar</option>
                  <option value={36}>36 timmar</option>
                </select>
              </div>
            </TabsContent>

            <TabsContent value="images">
              <ImageUploadSection images={images} setImages={setImages} />
            </TabsContent>

            <TabsContent value="details">
              <FeatureSection features={features} setFeatures={setFeatures} />
              <SpecificationSection
                specifications={specifications}
                setSpecifications={setSpecifications}
              />
            </TabsContent>

            <TabsContent value="inventory">
              <InventorySection
                inStock={inStock}
                setInStock={setInStock}
                stockQuantity={stockQuantity}
                setStockQuantity={setStockQuantity}
                sku={sku}
                setSku={setSku}
              />
            </TabsContent>
          </Tabs>

          <PreviewSection
            title={title}
            description={description}
            price={price}
            originalPrice={originalPrice}
            category={category}
            subcategory={subcategory}
            images={images}
            features={features}
            specifications={specifications}
            inStock={inStock}
            stockQuantity={stockQuantity}
            sku={sku}
            duration={duration}
            companyName={companyName}
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-white font-semibold hover:from-purple-700 hover:to-pink-700"
          >
            {t("Skapa erbjudande")}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
