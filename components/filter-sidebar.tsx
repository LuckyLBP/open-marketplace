'use client';

import React, { useMemo, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Sparkles,
  Grid3X3,
  Clock,
  DollarSign,
  Layers,
  RotateCcw,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface FilterSidebarProps {
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
  subcategories: string[];
  selectedSubcategory: string | null;
  onSubcategoryChange: (subcategory: string) => void;
}

// Mapping for category display names
const categoryDisplayNames: Record<string, string> = {
  elektronik: 'Elektronik',
  mode: 'Mode',
  hemmet: 'Hemmet',
  'halsa-skonhet': 'Hälsa & Skönhet',
  'hobby-fritid': 'Hobby & Fritid',
  annat: 'Annat',
  other: 'Annat',
};

// Mapping category-subcategory relationships
const categorySubcategoryMap: Record<string, string[]> = {
  elektronik: [
    'mobiltelefoner',
    'datorer',
    'ljud-bild',
    'wearables',
    'tillbehor',
  ],
  mode: ['herr', 'dam', 'barn', 'skor', 'vaska', 'accessoarer'],
  hemmet: ['mobler', 'inredning', 'kok', 'tradgard', 'belysning'],
  'halsa-skonhet': ['hudvard', 'makeup', 'harvard', 'dofter', 'valmaende'],
  'hobby-fritid': ['sport', 'bocker', 'spel-konsol', 'utomhus', 'handarbete'],
  annat: ['mat', 'dryck', 'present', 'ovrigt'],
  other: ['mat', 'dryck', 'present', 'ovrigt'],
};

// Mapping for subcategory display names
const subcategoryDisplayNames: Record<string, string> = {
  mobiltelefoner: 'Mobiltelefoner',
  datorer: 'Datorer',
  'ljud-bild': 'Ljud & Bild',
  wearables: 'Wearables',
  tillbehor: 'Tillbehör',
  herr: 'Herr',
  dam: 'Dam',
  barn: 'Barn',
  skor: 'Skor',
  vaska: 'Väskor',
  accessoarer: 'Accessoarer',
  mobler: 'Möbler',
  inredning: 'Inredning',
  kok: 'Kök',
  tradgard: 'Trädgård',
  belysning: 'Belysning',
  hudvard: 'Hudvård',
  makeup: 'Makeup',
  harvard: 'Hårvård',
  dofter: 'Dofter',
  valmaende: 'Välmående',
  sport: 'Sport',
  bocker: 'Böcker',
  'spel-konsol': 'Spel & Konsol',
  utomhus: 'Utomhus',
  handarbete: 'Handarbete',
  mat: 'Mat',
  dryck: 'Dryck',
  present: 'Present',
  ovrigt: 'Övrigt',
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
  isMobile = false,
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
}: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState([
    'categories',
    'price',
  ]);

  // Format price for display
  const formatPrice = (price: number) => `${price.toLocaleString()} kr`;

  // Filter subcategories based on selected category
  const relevantSubcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];

    // Get the list of subcategories for the selected category
    const relevantSubcategoryKeys =
      categorySubcategoryMap[selectedCategory] || [];

    // Filter the subcategories from the provided list that match the selected category
    return subcategories.filter((sub) => relevantSubcategoryKeys.includes(sub));
  }, [selectedCategory, subcategories]);

  // Get display name for a category
  const getCategoryDisplayName = (category: string) => {
    return (
      categoryDisplayNames[category] ||
      category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')
    );
  };

  // Get display name for a subcategory
  const getSubcategoryDisplayName = (subcategory: string) => {
    return (
      subcategoryDisplayNames[subcategory] ||
      subcategory.charAt(0).toUpperCase() +
        subcategory.slice(1).replace(/-/g, ' ')
    );
  };

  // Count active filters
  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubcategory ? 1 : 0) +
    selectedDurations.length +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'elektronik':
        return '📱';
      case 'mode':
        return '👕';
      case 'hemmet':
        return '🏠';
      case 'halsa-skonhet':
        return '💄';
      case 'hobby-fritid':
        return '🎯';
      default:
        return '📦';
    }
  };

  return (
    <div className={cn('space-y-4', isMobile && 'mb-6')}>
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Filter className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
              Smarta Filter
            </span>
            {activeFilterCount > 0 && (
              <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-sm">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-white/70 text-purple-700 border-purple-200 hover:bg-white/90 transition-colors cursor-pointer group"
                    onClick={() => onCategoryChange('all')}
                  >
                    <span className="mr-1">
                      {getCategoryIcon(selectedCategory)}
                    </span>
                    {getCategoryDisplayName(selectedCategory)}
                    <X className="h-3 w-3 ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                )}

                {selectedSubcategory && (
                  <Badge
                    variant="secondary"
                    className="bg-white/70 text-indigo-700 border-indigo-200 hover:bg-white/90 transition-colors cursor-pointer group"
                    onClick={() => onSubcategoryChange(selectedSubcategory)}
                  >
                    {getSubcategoryDisplayName(selectedSubcategory)}
                    <X className="h-3 w-3 ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                )}

                {selectedDurations.map((duration) => (
                  <Badge
                    key={duration}
                    variant="secondary"
                    className="bg-white/70 text-emerald-700 border-emerald-200 hover:bg-white/90 transition-colors cursor-pointer group"
                    onClick={() => onDurationChange(duration)}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {duration}h
                    <X className="h-3 w-3 ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                ))}

                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <Badge
                    variant="secondary"
                    className="bg-white/70 text-amber-700 border-amber-200 hover:bg-white/90 transition-colors cursor-pointer group"
                    onClick={() => onPriceRangeChange([0, maxPrice])}
                  >
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <X className="h-3 w-3 ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full border border-purple-200 hover:border-purple-300 transition-all"
                onClick={onClearFilters}
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Återställ Alla Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Grid3X3 className="h-4 w-4 text-purple-600" />
            Kategorier
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'justify-start h-10 font-medium transition-all',
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                  : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
              )}
              onClick={() => onCategoryChange('all')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Alla Kategorier
            </Button>

            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'justify-start h-10 font-medium transition-all',
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                    : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                )}
                onClick={() => onCategoryChange(category)}
              >
                <span className="mr-2 text-lg">
                  {getCategoryIcon(category)}
                </span>
                {getCategoryDisplayName(category)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Subcategories Card */}
      {selectedCategory !== 'all' && relevantSubcategories.length > 0 && (
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <Layers className="h-4 w-4 text-indigo-600" />
              Underkategorier
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {relevantSubcategories.map((subcategory) => (
                <div
                  key={subcategory}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Checkbox
                    id={subcategory}
                    checked={selectedSubcategory === subcategory}
                    onCheckedChange={() => onSubcategoryChange(subcategory)}
                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <Label
                    htmlFor={subcategory}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {getSubcategoryDisplayName(subcategory)}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Prisintervall
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Min</div>
                <div className="text-lg font-semibold text-emerald-600">
                  {formatPrice(priceRange[0])}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Max</div>
                <div className="text-lg font-semibold text-emerald-600">
                  {formatPrice(priceRange[1])}
                </div>
              </div>
            </div>

            <div className="px-2">
              <Slider
                min={0}
                max={maxPrice}
                step={50}
                value={priceRange}
                onValueChange={(value) =>
                  onPriceRangeChange(value as [number, number])
                }
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Duration Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Clock className="h-4 w-4 text-amber-600" />
            Varaktighet
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-2">
            {durations.map((duration) => (
              <Button
                key={duration}
                variant={
                  selectedDurations.includes(duration) ? 'default' : 'outline'
                }
                size="sm"
                className={cn(
                  'justify-start h-10 font-medium transition-all',
                  selectedDurations.includes(duration)
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md'
                    : 'hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'
                )}
                onClick={() => onDurationChange(duration)}
              >
                <Clock className="h-4 w-4 mr-2" />
                {duration} Timmar
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Apply Filters Button for Mobile */}
      {isMobile && (
        <Button
          size="lg"
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
          onClick={onApplyFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          Använd Filter
        </Button>
      )}
    </div>
  );
}
