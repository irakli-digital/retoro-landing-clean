"use client"

import { useEffect, useState } from "react"

export type DeviceType = "ios" | "android" | "web"

export function useDeviceRedirect() {
  const [deviceType, setDeviceType] = useState<DeviceType>("web")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Ensure we're in the browser environment
    if (typeof window === "undefined") return

    const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera

    // Check for iOS devices
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceType("ios")
    }
    // Check for Android devices
    else if (/android/i.test(userAgent)) {
      setDeviceType("android")
    }
    // Default to web for desktop and other devices
    else {
      setDeviceType("web")
    }
  }, [])

  // Return "web" during SSR to prevent hydration mismatch
  return mounted ? deviceType : "web"
}

export function getCtaUrl(deviceType: DeviceType): string {
  switch (deviceType) {
    case "ios":
      return "https://apps.apple.com/us/app/mypen-ge/id6747668211"
    case "android":
      return "https://play.google.com/store/apps/details?id=com.mypen.webview"
    case "web":
    default:
      return "https://chat.mypen.ge"
  }
}

