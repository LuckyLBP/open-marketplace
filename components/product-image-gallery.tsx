"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ProductImageGalleryProps {
  images: {
    url: string
    alt: string
    isPrimary?: boolean
  }[]
  title: string
}

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(
    images.findIndex((img) => img.isPrimary) !== -1 ? images.findIndex((img) => img.isPrimary) : 0,
  )
  const [fullscreenOpen, setFullscreenOpen] = useState(false)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)

  const handleThumbnailClick = (index: number) => {
    setActiveIndex(index)
  }

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleFullscreenOpen = (index: number) => {
    setFullscreenIndex(index)
    setFullscreenOpen(true)
  }

  const handleFullscreenPrevious = () => {
    setFullscreenIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleFullscreenNext = () => {
    setFullscreenIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-white">
        <img
          src={images[activeIndex]?.url || "/placeholder.svg?height=600&width=600"}
          alt={images[activeIndex]?.alt || title}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 flex items-center justify-between p-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white/90"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white/90"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-white/80 text-gray-800 shadow-sm backdrop-blur-sm hover:bg-white/90"
          onClick={() => handleFullscreenOpen(activeIndex)}
        >
          <Expand className="h-4 w-4" />
          <span className="sr-only">View fullscreen</span>
        </Button>
      </div>

      {/* Thumbnails */}
      <div className="flex space-x-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={index}
            className={cn(
              "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2",
              activeIndex === index ? "border-purple-600" : "border-transparent hover:border-gray-300",
            )}
            onClick={() => handleThumbnailClick(index)}
          >
            <img
              src={image.url || "/placeholder.svg?height=80&width=80"}
              alt={image.alt || `${title} - Image ${index + 1}`}
              className="h-full w-full object-cover object-center"
            />
            {image.isPrimary && (
              <div className="absolute bottom-0 left-0 right-0 bg-purple-600 py-0.5 text-[10px] text-white">
                Primary
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95">
          <div className="relative h-[80vh] w-full">
            <img
              src={images[fullscreenIndex]?.url || "/placeholder.svg?height=1200&width=1200"}
              alt={images[fullscreenIndex]?.alt || title}
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-between p-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handleFullscreenPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
                <span className="sr-only">Previous image</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                onClick={handleFullscreenNext}
              >
                <ChevronRight className="h-6 w-6" />
                <span className="sr-only">Next image</span>
              </Button>
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="flex space-x-2 bg-black/50 px-4 py-2 rounded-full">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      fullscreenIndex === index ? "bg-white" : "bg-white/50 hover:bg-white/80",
                    )}
                    onClick={() => setFullscreenIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
