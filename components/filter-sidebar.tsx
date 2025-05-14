"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronDown, ChevronUp, FilterIcon, X } from "lucide-react";

type FilterSidebarProps = {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    priceRange: [number, number];
    maxPrice: number;
    onPriceRangeChange: (range: [number, number]) => void;
    durations: number[];
    selectedDurations: number[];
    onDurationChange: (duration: number) => void;
    onClearFilters: () => void;
    onApplyFilters: () => void;
    isMobile?: boolean;
};

export function FilterSidebar({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRange,
    maxPrice,
    onPriceRangeChange,
    durations,
    selectedDurations,
    onDurationChange,
    onClearFilters,
    onApplyFilters,
    isMobile = false
}: FilterSidebarProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [localPriceRange, setLocalPriceRange] =
        useState<[number, number]>(priceRange);

    const handlePriceInputChange = (index: number, value: string) => {
        const newValue = Number.parseInt(value) || 0;
        const newRange = [...localPriceRange] as [number, number];
        newRange[index] = newValue;
        setLocalPriceRange(newRange);
    };

    const handleSliderChange = (value: number[]) => {
        setLocalPriceRange([value[0], value[1]]);
    };

    const handleApply = () => {
        onPriceRangeChange(localPriceRange);
        onApplyFilters();
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        onClearFilters();
        setLocalPriceRange([0, maxPrice]);
        if (isMobile) {
            setIsOpen(false);
        }
    };

    const content = (
        <div className="space-y-6">
            <div>
                <h3 className="font-medium mb-3">{t("Category")}</h3>
                <div className="space-y-2">
                    <div
                        className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
                            selectedCategory === "all"
                                ? "bg-purple-100 text-purple-700"
                                : "hover:bg-gray-100"
                        }`}
                        onClick={() => onCategoryChange("all")}
                    >
                        <span>{t("All Categories")}</span>
                        {selectedCategory === "all" && (
                            <Check className="h-4 w-4" />
                        )}
                    </div>
                    {categories.map((category) => (
                        <div
                            key={category}
                            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
                                selectedCategory === category
                                    ? "bg-purple-100 text-purple-700"
                                    : "hover:bg-gray-100"
                            }`}
                            onClick={() => onCategoryChange(category)}
                        >
                            <span>
                                {t(
                                    category.charAt(0).toUpperCase() +
                                        category.slice(1)
                                )}
                            </span>
                            {selectedCategory === category && (
                                <Check className="h-4 w-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="font-medium mb-3">{t("Duration")}</h3>
                <div className="space-y-2">
                    {durations.map((duration) => (
                        <div
                            key={duration}
                            className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
                                selectedDurations.includes(duration)
                                    ? "bg-purple-100 text-purple-700"
                                    : "hover:bg-gray-100"
                            }`}
                            onClick={() => onDurationChange(duration)}
                        >
                            <span>{duration}h</span>
                            {selectedDurations.includes(duration) && (
                                <Check className="h-4 w-4" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <h3 className="font-medium mb-4">{t("Price Range")}</h3>
                <div className="space-y-6">
                    <Slider
                        defaultValue={[localPriceRange[0], localPriceRange[1]]}
                        value={[localPriceRange[0], localPriceRange[1]]}
                        max={maxPrice}
                        step={10}
                        onValueChange={handleSliderChange}
                        className="mb-6"
                    />
                    <div className="flex items-center space-x-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="price-min">{t("Min")}</Label>
                            <Input
                                type="number"
                                id="price-min"
                                value={localPriceRange[0]}
                                onChange={(e) =>
                                    handlePriceInputChange(0, e.target.value)
                                }
                                min={0}
                                max={localPriceRange[1]}
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="price-max">{t("Max")}</Label>
                            <Input
                                type="number"
                                id="price-max"
                                value={localPriceRange[1]}
                                onChange={(e) =>
                                    handlePriceInputChange(1, e.target.value)
                                }
                                min={localPriceRange[0]}
                                max={maxPrice}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-y-2 pt-4">
                <Button
                    onClick={handleApply}
                    className="bg-purple-600 hover:bg-purple-700"
                >
                    {t("Apply")}
                </Button>
                <Button variant="outline" onClick={handleClear}>
                    {t("Clear Filters")}
                </Button>
            </div>
        </div>
    );

    // Mobile version with toggle
    if (isMobile) {
        return (
            <div className="mb-4">
                <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center">
                        <FilterIcon className="h-4 w-4 mr-2" />
                        {t("Filter")}
                    </div>
                    {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </Button>

                {isOpen && (
                    <Card className="p-4 mt-2 border rounded-lg shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-lg">
                                {t("Filter")}
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {content}
                    </Card>
                )}
            </div>
        );
    }

    // Desktop version
    return <div className="sticky top-4">{content}</div>;
}
