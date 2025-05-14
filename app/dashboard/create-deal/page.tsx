"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useFirebase } from "@/components/firebase-provider"
import { useLanguage } from "@/components/language-provider"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Upload, ImageIcon, Trash2, Plus, Star, X, Check } from "lucide-react"

// Define types for our form
type ProductImage = {
  file: File
  preview: string
  isPrimary: boolean
  uploading?: boolean
  progress?: number
  url?: string
}

type Specification = {
  name: string
  value: string
  id: string
}

type SpecificationGroup = {
  title: string
  specifications: Specification[]
  id: string
}

type Feature = {
  text: string
  id: string
}

export default function CreateDeal() {
  const { user } = useFirebase()
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Basic product information
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [originalPrice, setOriginalPrice] = useState("")
  const [duration, setDuration] = useState("12")
  const [category, setCategory] = useState("electronics")

  // Stock information
  const [inStock, setInStock] = useState(true)
  const [stockQuantity, setStockQuantity] = useState("10")
  const [sku, setSku] = useState("")

  // Images
  const [images, setImages] = useState<ProductImage[]>([])

  // Specifications
  const [specificationGroups, setSpecificationGroups] = useState<SpecificationGroup[]>([
    {
      id: crypto.randomUUID(),
      title: "Technical Specifications",
      specifications: [
        { id: crypto.randomUUID(), name: "Brand", value: "" },
        { id: crypto.randomUUID(), name: "Model", value: "" },
      ],
    },
  ])

  // Features
  const [features, setFeatures] = useState<Feature[]>([{ id: crypto.randomUUID(), text: "" }])

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Generate a random SKU if not provided
  useEffect(() => {
    if (!sku) {
      const randomSku = `SKU-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`
      setSku(randomSku)
    }
  }, [sku])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages: ProductImage[] = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isPrimary: images.length === 0, // First image is primary by default
      }))

      setImages((prev) => [...prev, ...newImages])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev]

      // If removing the primary image, set the first remaining image as primary
      if (newImages[index].isPrimary && newImages.length > 1) {
        const nextIndex = index === newImages.length - 1 ? 0 : index + 1
        newImages[nextIndex].isPrimary = true
      }

      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(newImages[index].preview)

      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    )
  }

  const handleAddSpecification = (groupIndex: number) => {
    setSpecificationGroups((prev) => {
      const newGroups = [...prev]
      newGroups[groupIndex].specifications.push({
        id: crypto.randomUUID(),
        name: "",
        value: "",
      })
      return newGroups
    })
  }

  const handleRemoveSpecification = (groupIndex: number, specIndex: number) => {
    setSpecificationGroups((prev) => {
      const newGroups = [...prev]
      newGroups[groupIndex].specifications.splice(specIndex, 1)
      return newGroups
    })
  }

  const handleSpecificationChange = (groupIndex: number, specIndex: number, field: "name" | "value", value: string) => {
    setSpecificationGroups((prev) => {
      const newGroups = [...prev]
      newGroups[groupIndex].specifications[specIndex][field] = value
      return newGroups
    })
  }

  const handleAddSpecificationGroup = () => {
    setSpecificationGroups((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "New Group",
        specifications: [{ id: crypto.randomUUID(), name: "", value: "" }],
      },
    ])
  }

  const handleRemoveSpecificationGroup = (groupIndex: number) => {
    setSpecificationGroups((prev) => {
      const newGroups = [...prev]
      newGroups.splice(groupIndex, 1)
      return newGroups
    })
  }

  const handleSpecificationGroupTitleChange = (groupIndex: number, title: string) => {
    setSpecificationGroups((prev) => {
      const newGroups = [...prev]
      newGroups[groupIndex].title = title
      return newGroups
    })
  }

  const handleAddFeature = () => {
    setFeatures((prev) => [...prev, { id: crypto.randomUUID(), text: "" }])
  }

  const handleRemoveFeature = (index: number) => {
    setFeatures((prev) => {
      const newFeatures = [...prev]
      newFeatures.splice(index, 1)
      return newFeatures
    })
  }

  const handleFeatureChange = (index: number, text: string) => {
    setFeatures((prev) => {
      const newFeatures = [...prev]
      newFeatures[index].text = text
      return newFeatures
    })
  }

  const calculateFeePercentage = (durationHours: number) => {
    switch (durationHours) {
      case 12:
        return 3
      case 24:
        return 4
      case 48:
        return 5
      default:
        return 3
    }
  }

  const validateForm = () => {
    if (!title) {
      toast({
        title: t("Error"),
        description: t("Please enter a title for your deal."),
        variant: "destructive",
      })
      setActiveTab("basic")
      return false
    }

    if (!description) {
      toast({
        title: t("Error"),
        description: t("Please enter a description for your deal."),
        variant: "destructive",
      })
      setActiveTab("basic")
      return false
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      toast({
        title: t("Error"),
        description: t("Please enter a valid price for your deal."),
        variant: "destructive",
      })
      setActiveTab("basic")
      return false
    }

    if (originalPrice && (isNaN(Number(originalPrice)) || Number(originalPrice) <= 0)) {
      toast({
        title: t("Error"),
        description: t("Please enter a valid original price or leave it blank."),
        variant: "destructive",
      })
      setActiveTab("basic")
      return false
    }

    if (images.length === 0) {
      toast({
        title: t("Error"),
        description: t("Please upload at least one image for your deal."),
        variant: "destructive",
      })
      setActiveTab("images")
      return false
    }

    if (inStock && (!stockQuantity || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0)) {
      toast({
        title: t("Error"),
        description: t("Please enter a valid stock quantity."),
        variant: "destructive",
      })
      setActiveTab("inventory")
      return false
    }

    return true
  }

  const uploadImages = async () => {
    if (images.length === 0) return []

    // Mark all images as uploading
    setImages((prev) => prev.map((img) => ({ ...img, uploading: true, progress: 0 })))

    const uploadPromises = images.map(async (image, index) => {
      const storageRef = ref(storage, `deals/${user?.uid}/${Date.now()}_${image.file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, image.file)

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setImages((prev) => {
              const newImages = [...prev]
              if (newImages[index]) {
                newImages[index].progress = progress
              }
              return newImages
            })
          },
          (error) => {
            console.error("Upload error:", error)
            reject(error)
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            setImages((prev) => {
              const newImages = [...prev]
              if (newImages[index]) {
                newImages[index].url = downloadURL
                newImages[index].uploading = false
              }
              return newImages
            })
            resolve(downloadURL)
          },
        )
      })
    })

    try {
      const imageUrls = await Promise.all(uploadPromises)
      return imageUrls
    } catch (error) {
      console.error("Error uploading images:", error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push("/auth/signin")
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Upload all images
      await uploadImages()

      // Find the primary image
      const primaryImage = images.find((img) => img.isPrimary)
      const primaryImageUrl = primaryImage?.url || images[0]?.url

      if (!primaryImageUrl) {
        throw new Error("Failed to upload primary image")
      }

      // Calculate expiration time based on duration
      const durationHours = Number.parseInt(duration)
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + durationHours)

      // Calculate fee percentage
      const feePercentage = calculateFeePercentage(durationHours)

      // Prepare specifications data
      const cleanedSpecGroups = specificationGroups
        .filter((group) => group.title.trim() !== "" && group.specifications.some((spec) => spec.name.trim() !== ""))
        .map((group) => ({
          title: group.title,
          specifications: group.specifications
            .filter((spec) => spec.name.trim() !== "")
            .map((spec) => ({
              name: spec.name,
              value: spec.value,
            })),
        }))

      // Prepare features data
      const cleanedFeatures = features.filter((feature) => feature.text.trim() !== "").map((feature) => feature.text)

      // Add deal to Firestore
      await addDoc(collection(db, "deals"), {
        title,
        description,
        price: Number.parseFloat(price),
        originalPrice: originalPrice ? Number.parseFloat(originalPrice) : null,
        duration: durationHours,
        imageUrl: primaryImageUrl, // Main image for backward compatibility
        images: images.map((img) => ({
          url: img.url,
          alt: title,
          isPrimary: img.isPrimary,
        })),
        companyId: user.uid,
        feePercentage,
        category,
        inStock,
        stockQuantity: inStock ? Number.parseInt(stockQuantity) : 0,
        sku,
        specifications: cleanedSpecGroups.length > 0 ? cleanedSpecGroups : null,
        features: cleanedFeatures.length > 0 ? cleanedFeatures : null,
        expiresAt,
        createdAt: serverTimestamp(),
      })

      toast({
        title: t("Success"),
        description: t("Your deal has been created successfully."),
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating deal:", error)
      toast({
        title: t("Error"),
        description: t("Failed to create deal. Please try again."),
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      images.forEach((image) => {
        URL.revokeObjectURL(image.preview)
      })
    }
  }, [])

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("Create Deal")}</h1>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>{t("Deal Information")}</CardTitle>
              <CardDescription>{t("Fill in the details for your new deal")}</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="basic">{t("Basic Info")}</TabsTrigger>
                  <TabsTrigger value="images">{t("Images")}</TabsTrigger>
                  <TabsTrigger value="details">{t("Details")}</TabsTrigger>
                  <TabsTrigger value="inventory">{t("Inventory")}</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">{t("Title")} *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t("Enter deal title")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t("Description")} *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("Describe your deal")}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">{t("Price")} (SEK) *</Label>
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
                      <Label htmlFor="originalPrice">{t("Original Price")} (SEK)</Label>
                      <div className="relative">
                        <Input
                          id="originalPrice"
                          type="number"
                          min="1"
                          step="0.01"
                          value={originalPrice}
                          onChange={(e) => setOriginalPrice(e.target.value)}
                          placeholder={t("Leave blank if not on sale")}
                        />
                        {originalPrice && Number(originalPrice) > Number(price) && (
                          <Badge className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600">
                            -{Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Duration")} *</Label>
                    <RadioGroup value={duration} onValueChange={setDuration} className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="12" id="duration-12" />
                        <Label htmlFor="duration-12" className="flex-1">
                          {t("12 hours")} - {t("Transaction Fee")}: 3%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="24" id="duration-24" />
                        <Label htmlFor="duration-24" className="flex-1">
                          {t("24 hours")} - {t("Transaction Fee")}: 4%
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="48" id="duration-48" />
                        <Label htmlFor="duration-48" className="flex-1">
                          {t("48 hours")} - {t("Transaction Fee")}: 5%
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Category")} *</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="electronics">{t("Electronics")}</option>
                      <option value="clothing">{t("Clothing")}</option>
                      <option value="home">{t("Home & Garden")}</option>
                      <option value="beauty">{t("Beauty & Health")}</option>
                      <option value="sports">{t("Sports & Outdoors")}</option>
                      <option value="toys">{t("Toys & Games")}</option>
                      <option value="food">{t("Food & Beverages")}</option>
                      <option value="other">{t("Other")}</option>
                    </select>
                  </div>
                </TabsContent>

                {/* Images Tab */}
                <TabsContent value="images" className="space-y-6">
                  <div className="space-y-2">
                    <Label>{t("Product Images")} *</Label>
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
                      <p className="mb-1 font-medium">{t("Upload Images")}</p>
                      <p className="text-sm text-muted-foreground text-center">
                        {t("Drag and drop or click to select multiple images")}
                      </p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{t("Uploaded Images")}</h3>
                        <p className="text-sm text-muted-foreground">{t("Set one image as primary")}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className={`relative border rounded-md overflow-hidden ${
                              image.isPrimary ? "ring-2 ring-purple-600" : ""
                            }`}
                          >
                            <img
                              src={image.preview || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-full aspect-square object-cover"
                            />

                            {image.uploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-full max-w-[80%]">
                                  <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-purple-600 transition-all duration-300"
                                      style={{ width: `${image.progress || 0}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-white text-xs text-center mt-1">
                                    {Math.round(image.progress || 0)}%
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="absolute top-2 right-2 flex space-x-1">
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(index)}
                                className={`p-1 rounded-full ${
                                  image.isPrimary
                                    ? "bg-purple-600 text-white"
                                    : "bg-white/80 text-gray-700 hover:bg-white"
                                }`}
                                title={t("Set as primary image")}
                              >
                                <Star className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="p-1 rounded-full bg-white/80 text-red-600 hover:bg-white"
                                title={t("Remove image")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {image.isPrimary && (
                              <div className="absolute bottom-0 left-0 right-0 bg-purple-600 py-1 px-2">
                                <p className="text-white text-xs text-center">{t("Primary Image")}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>{t("Key Features")}</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddFeature}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t("Add Feature")}
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {features.map((feature, index) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                              <Input
                                value={feature.text}
                                onChange={(e) => handleFeatureChange(index, e.target.value)}
                                placeholder={t("Enter a key feature of your product")}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveFeature(index)}
                            className="h-8 w-8 text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Specifications */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>{t("Specifications")}</Label>
                      <Button type="button" variant="outline" size="sm" onClick={handleAddSpecificationGroup}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t("Add Group")}
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {specificationGroups.map((group, groupIndex) => (
                        <div key={group.id} className="border rounded-md p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <Input
                              value={group.title}
                              onChange={(e) => handleSpecificationGroupTitleChange(groupIndex, e.target.value)}
                              placeholder={t("Group Title")}
                              className="font-medium"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveSpecificationGroup(groupIndex)}
                              className="h-8 w-8 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {group.specifications.map((spec, specIndex) => (
                              <div key={spec.id} className="grid grid-cols-2 gap-2">
                                <Input
                                  value={spec.name}
                                  onChange={(e) =>
                                    handleSpecificationChange(groupIndex, specIndex, "name", e.target.value)
                                  }
                                  placeholder={t("Specification Name")}
                                />
                                <div className="flex items-center space-x-2">
                                  <Input
                                    value={spec.value}
                                    onChange={(e) =>
                                      handleSpecificationChange(groupIndex, specIndex, "value", e.target.value)
                                    }
                                    placeholder={t("Specification Value")}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveSpecification(groupIndex, specIndex)}
                                    className="h-8 w-8 text-red-600 flex-shrink-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddSpecification(groupIndex)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            {t("Add Specification")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="in-stock">{t("In Stock")}</Label>
                      <p className="text-sm text-muted-foreground">{t("Is this product available for purchase?")}</p>
                    </div>
                    <Switch id="in-stock" checked={inStock} onCheckedChange={setInStock} />
                  </div>

                  {inStock && (
                    <div className="space-y-2">
                      <Label htmlFor="stock-quantity">{t("Stock Quantity")}</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="sku">{t("SKU")} (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder={t("Enter product SKU")}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    {t("Creating") + "..."}
                  </>
                ) : (
                  t("Create Deal")
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">* {t("Required fields")}</p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
