"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ImageSliderProps {
  images: {
    src: string
    alt: string
  }[]
  autoSlideInterval?: number
  className?: string
}

export function ImageSlider({
  images,
  autoSlideInterval = 3500,
  className = ""
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const newIndex = Math.min(prevIndex + 1, images.length - 1)
      return newIndex
    })
  }, [images.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }, [])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-slide functionality - moves one position at a time
  useEffect(() => {
    if (!isHovered && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          // Loop back to start when reaching the end
          if (prevIndex >= images.length - 1) {
            return 0
          }
          return prevIndex + 1
        })
      }, autoSlideInterval)
      return () => clearInterval(interval)
    }
  }, [isHovered, autoSlideInterval, images.length])

  // Scroll to the active image
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const imageWidth = container.scrollWidth / images.length
      container.scrollTo({
        left: currentIndex * imageWidth,
        behavior: 'smooth'
      })
    }
  }, [currentIndex, images.length])

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide()
    }
    if (touchStart - touchEnd < -75) {
      prevSlide()
    }
  }

  if (images.length === 0) return null

  const showNavigation = currentIndex > 0 || currentIndex < images.length - 1

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="App screenshots carousel"
    >
      {/* Main slider container - responsive grid */}
      <div className="relative w-full overflow-hidden">
        {/* Navigation arrows */}
        {showNavigation && (
          <>
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all shadow-lg ${
                currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= images.length - 1}
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all shadow-lg ${
                currentIndex >= images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
              }`}
              aria-label="Next slide"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 md:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-8 lg:px-12"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex-shrink-0 transition-all duration-500 ${
                // Responsive widths
                // Mobile: Show 1 full image (90% width)
                // Tablet: Show 2-3 images
                // Desktop: Show 3-4 images
                // Large desktop: Show all or 5 images
                'w-[85vw] sm:w-[45vw] md:w-[35vw] lg:w-[28vw] xl:w-[22vw] 2xl:w-[18vw]'
              } ${
                index === currentIndex
                  ? 'scale-100 opacity-100'
                  : 'scale-95 opacity-70 hover:opacity-90 hover:scale-98'
              }`}
              onClick={() => goToSlide(index)}
            >
              <div className="relative aspect-[9/19.5] w-full overflow-hidden rounded-2xl shadow-2xl border border-border/20 bg-gradient-to-b from-background to-muted/20 cursor-pointer group">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 85vw, (max-width: 768px) 45vw, (max-width: 1024px) 35vw, (max-width: 1280px) 28vw, (max-width: 1536px) 22vw, 18vw"
                  priority={index === 0}
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10 dark:ring-white/10" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? "true" : "false"}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="text-center mt-2 text-sm text-muted-foreground">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
