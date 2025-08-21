'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";
import { useFirebase } from "@/components/firebase-provider";
import { useLanguage } from "@/components/language-provider";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import BasicInfoSection from "./sections/basicInfoSection";
import ImageUploadSection from "./sections/imageUploadSection";
import CategorySection from "./sections/categorySection";
import FeatureSection from "./sections/featureSection";
import SpecificationSection from "./sections/specificationSection";
import InventorySection from "./sections/inventorySection";
import PreviewSection from "./sections/previewSection";

import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { ProductImage, Feature, Specification } from "@/components/types/deal";

const calculateFeePercentage = (duration: number): number => {
  if (duration <= 12) return 3;
  if (duration <= 24) return 4;
  if (duration <= 36) return 5;
  if (duration <= 48) return 6;
  if (duration <= 72) return 7;
  if (duration <= 96) return 8;
  if (duration <= 120) return 9;
  return 10;
};

type CreateDealFormProps = {
  defaultValues?: any;
  isEditing?: boolean;
};

export default function CreateDealForm({ defaultValues }: CreateDealFormProps) {
  const router = useRouter();
  const { user, userType } = useFirebase();
  const { t } = useLanguage();
  const { toast } = useToast();

  const isEditing = !!defaultValues?.id;
  const [activeTab, setActiveTab] = useState("basic");
  const [duration, setDuration] = useState(24);
  const [feePercentage, setFeePercentage] = useState<number>(calculateFeePercentage(24));
  const [images, setImages] = useState<ProductImage[]>([]);
  const [inStock, setInStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState("10");
  const [sku, setSku] = useState("");

  const [features, setFeatures] = useState<Feature[]>([{ id: crypto.randomUUID(), text: "" }]);
  const [specifications, setSpecifications] = useState<Specification[]>([{ id: crypto.randomUUID(), key: "", value: "" }]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("elektronik");
  const [subcategory, setSubcategory] = useState("");
  const [companyName, setCompanyName] = useState("");

  const maxDuration =
    userType === "company" ? 336 :
      userType === "customer" ? 168 :
        userType === "admin" || userType === "superadmin" ? 336 : 168;

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title || "");
      setDescription(defaultValues.description || "");
      setPrice(defaultValues.price?.toString() || "");
      setOriginalPrice(defaultValues.originalPrice?.toString() || "");
      setCategory(defaultValues.category || "");
      setSubcategory(defaultValues.subcategory || "");
      setCompanyName(defaultValues.companyName || "");
      setImages(defaultValues.images || []);
      setDuration(defaultValues.duration || 24);
      setFeePercentage(defaultValues.feePercentage ?? calculateFeePercentage(defaultValues.duration || 24));
      setInStock(defaultValues.inStock ?? true);
      setStockQuantity(defaultValues.stockQuantity?.toString() || "10");
      setSku(defaultValues.sku || "");
      setFeatures(defaultValues.features || []);
      setSpecifications(defaultValues.specifications || []);
    }
  }, [defaultValues]);

  const validateForm = () => {
    if (
      !title ||
      !companyName ||
      !description ||
      !price ||
      isNaN(Number(price)) ||
      Number(price) <= 0 ||
      images.length === 0 ||
      !category ||
      !subcategory
    ) {
      toast({ title: t("Fel"), description: t("Kontrollera att alla fält är ifyllda korrekt."), variant: "destructive" });
      setActiveTab("basic");
      return false;
    }
    if (duration > maxDuration) {
      toast({ title: t("Fel"), description: t("Vald varaktighet överskrider tillåten gräns för din roll."), variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const storage = getStorage();

      const uploadedOrKept = await Promise.all(
        images.map(async (img) => {
          if (img.url && /^https?:\/\//i.test(img.url)) {
            return {
              url: img.url,
              isPrimary: !!img.isPrimary,
              alt: img.alt?.trim() || undefined,
            };
          }
          if (img.file) {
            const fileRef = ref(storage, `deals/${crypto.randomUUID()}`);
            await uploadBytes(fileRef, img.file);
            const url = await getDownloadURL(fileRef);
            return {
              url,
              isPrimary: !!img.isPrimary,
              alt: img.alt?.trim() || undefined,
            };
          }
          return null;
        })
      );

      let imagesToSave = (uploadedOrKept.filter(Boolean) as Array<{ url: string; isPrimary: boolean; alt?: string }>)
        .filter((img, idx, arr) => arr.findIndex((x) => x.url === img.url) === idx);

      if (imagesToSave.length > 0 && !imagesToSave.some((i) => i.isPrimary)) {
        imagesToSave[0].isPrimary = true;
      }

      const cleanImage = (img: { url: string; isPrimary: boolean; alt?: string }) => {
        const out: any = { url: img.url, isPrimary: !!img.isPrimary };
        if (img.alt && img.alt.length > 0) out.alt = img.alt;
        return out;
      };
      imagesToSave = imagesToSave.map(cleanImage);

      const cleanedFeatures = (features || [])
        .filter((f) => f?.text && f.text.trim().length > 0)
        .map((f) => ({ id: f.id, text: f.text.trim() }));

      const cleanedSpecs = (specifications || [])
        .filter((s) => s?.key && s?.value && s.key.trim().length > 0 && s.value.trim().length > 0)
        .map((s) => ({ id: s.id, key: s.key.trim(), value: s.value.trim() }));

      const normalizedAccountType: 'company' | 'customer' =
        userType === 'customer' ? 'customer' : 'company';

      const editableFields = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category: category || '',
        subcategory: subcategory || '',
        inStock: !!inStock,
        stockQuantity: parseInt(stockQuantity, 10),
        sku: sku || '',
        features: cleanedFeatures,
        specifications: cleanedSpecs,
        images: imagesToSave,
        imageUrl: imagesToSave.find((img) => img.isPrimary)?.url || imagesToSave[0]?.url || '',
        duration,
        feePercentage,
      };

      const stripUndefined = (obj: Record<string, any>) =>
        Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

      if (isEditing && defaultValues?.id) {
        const updatePayload = {
          ...stripUndefined(editableFields),
          updatedAt: serverTimestamp(),
        };
        await updateDoc(doc(db, "deals", defaultValues.id), updatePayload);
        toast({ title: t("Succé"), description: t("Ändringarna har sparats!") });
      } else {
        const createPayload = {
          ...stripUndefined(editableFields),
          expiresAt: null,
          createdAt: serverTimestamp(),
          companyId: user?.uid || null,
          companyName: companyName.trim(),
          role: userType,
          accountType: normalizedAccountType,
          isBoosted: false,
          boostType: null,
          boostStart: null,
          boostEnd: null,
          status: "pending",
        };
        await addDoc(collection(db, "deals"), createPayload);
        toast({ title: t("Succé"), description: t("Erbjudandet har sparats!") });
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Fel vid uppladdning:", err);
      toast({ title: t("Fel"), description: t("Något gick fel vid sparande. Försök igen."), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 border border-purple-600 rounded-lg bg-white shadow-md">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? t("Redigera erbjudande") : t("Skapa erbjudande")}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 gap-2 rounded-md bg-gray-100 p-1 mb-6">
            <TabsTrigger value="basic">{t("Grundläggande")}</TabsTrigger>
            <TabsTrigger value="images">{t("Bilder")}</TabsTrigger>
            <TabsTrigger value="details">{t("Detaljer")}</TabsTrigger>
            <TabsTrigger value="inventory">{t("Lager")}</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoSection {...{ title, setTitle, description, setDescription, price, setPrice, originalPrice, setOriginalPrice, companyName, setCompanyName }} />
            <CategorySection {...{ category, setCategory, subcategory, setSubcategory }} />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("Varaktighet")}</label>
              <select
                value={duration}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setDuration(value);
                  setFeePercentage(calculateFeePercentage(value));
                }}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm"
              >
                {[12, 24, 36, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336]
                  .filter((h) => h <= maxDuration)
                  .map((h) => {
                    const label = h <= 48 ? `${h} timmar` : `${h / 24} dagar`;
                    return (
                      <option key={h} value={h}>
                        {label}
                      </option>
                    );
                  })}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                {t("Serviceavgift")}: <span className="font-medium">{feePercentage}%</span>
              </p>
            </div>
          </TabsContent>

          <TabsContent value="images">
            <ImageUploadSection images={images} setImages={setImages} />
          </TabsContent>

          <TabsContent value="details">
            <FeatureSection features={features} setFeatures={setFeatures} />
            <SpecificationSection specifications={specifications} setSpecifications={setSpecifications} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventorySection {...{ inStock, setInStock, stockQuantity, setStockQuantity, sku, setSku }} />
          </TabsContent>
        </Tabs>

        <PreviewSection {...{ title, description, price, originalPrice, category, subcategory, images, features, specifications, inStock, stockQuantity, sku, duration, companyName }} />

        <button type="submit" className="mt-6 w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-white font-semibold hover:from-purple-700 hover:to-pink-700">
          {isEditing ? t("Spara ändringar") : t("Skapa erbjudande")}
        </button>
      </form>
    </div>
  );
}
