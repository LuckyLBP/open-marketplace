"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface Specification {
  name: string
  value: string
}

interface SpecificationGroup {
  title: string
  specifications: Specification[]
}

interface ProductSpecificationsProps {
  specifications: SpecificationGroup[]
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  if (!specifications || specifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      {specifications.map((group, groupIndex) => (
        <div key={groupIndex} className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => toggleGroup(group.title)}
          >
            <h3 className="text-lg font-medium">{group.title}</h3>
            <ChevronDown
              className={cn("h-5 w-5 text-muted-foreground transition-transform", {
                "rotate-180": expandedGroups[group.title],
              })}
            />
          </div>
          {expandedGroups[group.title] && (
            <div className="p-4 pt-0">
              <Separator className="mb-4" />
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {group.specifications.map((spec, specIndex) => (
                  <div key={specIndex} className="py-1">
                    <dt className="text-sm font-medium text-muted-foreground">{spec.name}</dt>
                    <dd className="text-sm">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
