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
    <div className={cn('space-y-4', isMobile ? 'px-2' : '')}>
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 shadow-sm">
        <CardHeader className={cn('pb-3', isMobile && 'pb-2')}>
          <CardTitle
            className={cn(
              'flex items-center gap-3 font-semibold',
              isMobile ? 'text-base' : 'text-lg'
            )}
          >
            <div
              className={cn(
                'bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg',
                isMobile ? 'p-1.5' : 'p-2'
              )}
            >
              <Filter
                className={cn('text-white', isMobile ? 'h-3 w-3' : 'h-4 w-4')}
              />
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
        <CardContent className={cn('pt-0', isMobile && 'px-4 pb-4')}>
          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selectedCategory !== 'all' && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'bg-white/70 text-purple-700 border-purple-200 hover:bg-white/90 transition-colors cursor-pointer group',
                      isMobile && 'text-xs py-1 px-2'
                    )}
                    onClick={() => onCategoryChange('all')}
                  >
                    <span className="mr-1">
                      {getCategoryIcon(selectedCategory)}
                    </span>
                    {getCategoryDisplayName(selectedCategory)}
                    <X
                      className={cn(
                        'ml-1 group-hover:text-red-500 transition-colors',
                        isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
                      )}
                    />
                  </Badge>
                )}

                {selectedSubcategory && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'bg-white/70 text-indigo-700 border-indigo-200 hover:bg-white/90 transition-colors cursor-pointer group',
                      isMobile && 'text-xs py-1 px-2'
                    )}
                    onClick={() => onSubcategoryChange(selectedSubcategory)}
                  >
                    {getSubcategoryDisplayName(selectedSubcategory)}
                    <X
                      className={cn(
                        'ml-1 group-hover:text-red-500 transition-colors',
                        isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
                      )}
                    />
                  </Badge>
                )}

                {selectedDurations.map((duration) => (
                  <Badge
                    key={duration}
                    variant="secondary"
                    className={cn(
                      'bg-white/70 text-emerald-700 border-emerald-200 hover:bg-white/90 transition-colors cursor-pointer group',
                      isMobile && 'text-xs py-1 px-2'
                    )}
                    onClick={() => onDurationChange(duration)}
                  >
                    <Clock
                      className={cn(
                        'mr-1',
                        isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
                      )}
                    />
                    {duration}h
                    <X
                      className={cn(
                        'ml-1 group-hover:text-red-500 transition-colors',
                        isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
                      )}
                    />
                  </Badge>
                ))}

                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'bg-white/70 text-amber-700 border-amber-200 hover:bg-white/90 transition-colors cursor-pointer group',
                      isMobile && 'text-xs py-1 px-2'
                    )}
                    onClick={() => onPriceRangeChange([0, maxPrice])}
                  >
                    <DollarSign
                      className={cn(
                        'mr-1',
                        isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
                      )}
                    />
                    {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    <X
                      className={cn(
                        'ml-1 group-hover:text-red-500 transition-colors',
                        isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'
                      )}
                    />
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'text-purple-600 hover:text-purple-700 hover:bg-purple-50 w-full border border-purple-200 hover:border-purple-300 transition-all',
                  isMobile ? 'h-10 text-sm' : 'h-8'
                )}
                onClick={onClearFilters}
              >
                <RotateCcw
                  className={cn('mr-2', isMobile ? 'h-4 w-4' : 'h-3 w-3')}
                />
                Återställ Alla Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Card */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className={cn('pb-3', isMobile && 'pb-2')}>
          <CardTitle
            className={cn(
              'flex items-center gap-2 font-medium',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            <Grid3X3
              className={cn(
                'text-purple-600',
                isMobile ? 'h-3 w-3' : 'h-4 w-4'
              )}
            />
            Kategorier
          </CardTitle>
        </CardHeader>
        <CardContent className={cn('pt-0', isMobile && 'px-4 pb-4')}>
          <div
            className={cn('grid grid-cols-1', isMobile ? 'gap-1.5' : 'gap-2')}
          >
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'justify-start font-medium transition-all',
                isMobile ? 'h-9 text-sm' : 'h-10',
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                  : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
              )}
              onClick={() => onCategoryChange('all')}
            >
              <Sparkles
                className={cn('mr-2', isMobile ? 'h-3 w-3' : 'h-4 w-4')}
              />
              Alla Kategorier
            </Button>

            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                className={cn(
                  'justify-start font-medium transition-all',
                  isMobile ? 'h-9 text-sm' : 'h-10',
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md'
                    : 'hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                )}
                onClick={() => onCategoryChange(category)}
              >
                <span className={cn('mr-2', isMobile ? 'text-sm' : 'text-lg')}>
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
          <CardHeader className={cn('pb-3', isMobile && 'pb-2')}>
            <CardTitle
              className={cn(
                'flex items-center gap-2 font-medium',
                isMobile ? 'text-sm' : 'text-base'
              )}
            >
              <Layers
                className={cn(
                  'text-indigo-600',
                  isMobile ? 'h-3 w-3' : 'h-4 w-4'
                )}
              />
              Underkategorier
            </CardTitle>
          </CardHeader>
          <CardContent className={cn('pt-0', isMobile && 'px-4 pb-4')}>
            <div className={cn('space-y-2', isMobile && 'space-y-1.5')}>
              {relevantSubcategories.map((subcategory) => (
                <div
                  key={subcategory}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg hover:bg-slate-50 transition-colors',
                    isMobile ? 'p-1.5' : 'p-2'
                  )}
                >
                  <Checkbox
                    id={subcategory}
                    checked={selectedSubcategory === subcategory}
                    onCheckedChange={() => onSubcategoryChange(subcategory)}
                    className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                  />
                  <Label
                    htmlFor={subcategory}
                    className={cn(
                      'font-medium cursor-pointer flex-1',
                      isMobile ? 'text-xs' : 'text-sm'
                    )}
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
        <CardHeader className={cn('pb-3', isMobile && 'pb-2')}>
          <CardTitle
            className={cn(
              'flex items-center gap-2 font-medium',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            <DollarSign
              className={cn(
                'text-emerald-600',
                isMobile ? 'h-3 w-3' : 'h-4 w-4'
              )}
            />
            Prisintervall
          </CardTitle>
        </CardHeader>
        <CardContent className={cn('pt-0', isMobile && 'px-4 pb-4')}>
          <div className={cn('space-y-4', isMobile && 'space-y-3')}>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div
                  className={cn(
                    'text-muted-foreground',
                    isMobile ? 'text-xs' : 'text-sm'
                  )}
                >
                  Min
                </div>
                <div
                  className={cn(
                    'font-semibold text-emerald-600',
                    isMobile ? 'text-base' : 'text-lg'
                  )}
                >
                  {formatPrice(priceRange[0])}
                </div>
              </div>
              <div className="text-center">
                <div
                  className={cn(
                    'text-muted-foreground',
                    isMobile ? 'text-xs' : 'text-sm'
                  )}
                >
                  Max
                </div>
                <div
                  className={cn(
                    'font-semibold text-emerald-600',
                    isMobile ? 'text-base' : 'text-lg'
                  )}
                >
                  {formatPrice(priceRange[1])}
                </div>
              </div>
            </div>

            <div className={cn(isMobile ? 'px-1' : 'px-2')}>
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
        <CardHeader className={cn('pb-3', isMobile && 'pb-2')}>
          <CardTitle
            className={cn(
              'flex items-center gap-2 font-medium',
              isMobile ? 'text-sm' : 'text-base'
            )}
          >
            <Clock
              className={cn('text-amber-600', isMobile ? 'h-3 w-3' : 'h-4 w-4')}
            />
            Varaktighet
          </CardTitle>
        </CardHeader>
        <CardContent className={cn('pt-0', isMobile && 'px-4 pb-4')}>
          <div
            className={cn('grid grid-cols-1', isMobile ? 'gap-1.5' : 'gap-2')}
          >
            {durations.map((duration) => (
              <Button
                key={duration}
                variant={
                  selectedDurations.includes(duration) ? 'default' : 'outline'
                }
                size="sm"
                className={cn(
                  'justify-start font-medium transition-all',
                  isMobile ? 'h-9 text-sm' : 'h-10',
                  selectedDurations.includes(duration)
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md'
                    : 'hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'
                )}
                onClick={() => onDurationChange(duration)}
              >
                <Clock
                  className={cn('mr-2', isMobile ? 'h-3 w-3' : 'h-4 w-4')}
                />
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
          className={cn(
            'w-full font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg',
            isMobile ? 'h-14 text-base' : 'h-12'
          )}
          onClick={onApplyFilters}
        >
          <Filter className={cn('mr-2', isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
          Använd Filter
        </Button>
      )}
    </div>
  );
}
