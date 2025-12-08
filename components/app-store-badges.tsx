"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface AppStoreBadgesProps {
  appStoreUrl?: string
  playStoreUrl?: string
  className?: string
}

export function AppStoreBadges({
  appStoreUrl = "#",
  playStoreUrl = "#",
  className = ""
}: AppStoreBadgesProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 items-center ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Link
          href={appStoreUrl}
          className="block"
          aria-label="Download on the App Store"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/badges/app-store-badge.svg"
            alt="Download on the App Store"
            width={160}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Link
          href={playStoreUrl}
          className="block"
          aria-label="Get it on Google Play"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/images/badges/google-play-badge.svg"
            alt="Get it on Google Play"
            width={180}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
      </motion.div>
    </div>
  )
}
