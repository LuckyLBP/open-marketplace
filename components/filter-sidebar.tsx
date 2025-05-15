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
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

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
  const [compactView, setCompactView] = useState(true);

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

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md px-4 py-3 h-fit',
        isMobile && 'mb-6'
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium text-sm">Filter</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setCompactView(!compactView)}
        >
          {compactView ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </Button>
      </div>

      {compactView ? (
        // Compact view: just show category chips and active filters
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-xs rounded-full"
              onClick={() => onCategoryChange('all')}
            >
              Alla
            </Button>
            {categories.slice(0, 5).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => onCategoryChange(category)}
              >
                {getCategoryDisplayName(category)}
              </Button>
            ))}
            {categories.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full"
                onClick={() => setCompactView(false)}
              >
                +{categories.length - 5}
              </Button>
            )}
          </div>

          {/* Active filter badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedSubcategory && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                  onClick={() => onSubcategoryChange(selectedSubcategory)}
                >
                  {getSubcategoryDisplayName(selectedSubcategory)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubcategoryChange(selectedSubcategory);
                    }}
                  >
                    ×
                  </Button>
                </Badge>
              )}

              {selectedDurations.map((duration) => (
                <Badge
                  key={duration}
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                  {duration}h
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onDurationChange(duration)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}

              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => onPriceRangeChange([0, maxPrice])}
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground w-full"
              onClick={onClearFilters}
            >
              Rensa filter
            </Button>
          )}
        </div>
      ) : (
        // Expanded view: show all filter options in accordion
        <Accordion type="multiple" defaultValue={['category']}>
          <AccordionItem value="category" className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              Kategorier
            </AccordionTrigger>
            <AccordionContent className="pt-0 pb-2">
              <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                <div className="flex items-center">
                  <Checkbox
                    id="all"
                    checked={selectedCategory === 'all'}
                    onCheckedChange={() => onCategoryChange('all')}
                    className="h-3.5 w-3.5"
                  />
                  <Label htmlFor="all" className="ml-2 text-xs cursor-pointer">
                    Alla kategorier
                  </Label>
                </div>

                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <Checkbox
                      id={category}
                      checked={selectedCategory === category}
                      onCheckedChange={() => onCategoryChange(category)}
                      className="h-3.5 w-3.5"
                    />
                    <Label
                      htmlFor={category}
                      className="ml-2 text-xs cursor-pointer"
                    >
                      {getCategoryDisplayName(category)}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {selectedCategory !== 'all' && relevantSubcategories.length > 0 && (
            <AccordionItem value="subcategory" className="border-b-0">
              <AccordionTrigger className="py-2 text-sm">
                Underkategorier
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-2">
                <div className="space-y-1 text-xs max-h-32 overflow-y-auto pr-1">
                  {relevantSubcategories.map((subcategory) => (
                    <div key={subcategory} className="flex items-center">
                      <Checkbox
                        id={subcategory}
                        checked={selectedSubcategory === subcategory}
                        onCheckedChange={() => onSubcategoryChange(subcategory)}
                        className="h-3.5 w-3.5"
                      />
                      <Label
                        htmlFor={subcategory}
                        className="ml-2 text-xs cursor-pointer"
                      >
                        {getSubcategoryDisplayName(subcategory)}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="price" className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              Prisintervall
            </AccordionTrigger>
            <AccordionContent className="pt-0 pb-2">
              <div className="px-1">
                <div className="flex justify-between mb-3">
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(priceRange[0])}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatPrice(priceRange[1])}
                  </span>
                </div>

                <Slider
                  min={0}
                  max={maxPrice}
                  step={50}
                  value={priceRange}
                  onValueChange={(value) =>
                    onPriceRangeChange(value as [number, number])
                  }
                  className="mb-1"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="duration" className="border-b-0">
            <AccordionTrigger className="py-2 text-sm">
              Varaktighet
            </AccordionTrigger>
            <AccordionContent className="pt-0 pb-2">
              <div className="flex flex-wrap gap-2 px-1">
                {durations.map((duration) => (
                  <Button
                    key={duration}
                    variant={
                      selectedDurations.includes(duration)
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => onDurationChange(duration)}
                  >
                    {duration} timmar
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <div className="flex justify-between mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={onClearFilters}
            >
              Rensa filter
            </Button>

            {isMobile && (
              <Button
                size="sm"
                className="text-xs h-7 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={onApplyFilters}
              >
                Använd filter
              </Button>
            )}
          </div>
        </Accordion>
      )}
    </div>
  );
}
