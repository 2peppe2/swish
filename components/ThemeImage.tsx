"use client"

import Image, { type ImageProps } from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

type ThemeImageProps = Omit<ImageProps, "src" | "alt"> & {
  alt: string
  lightSrc: string
  darkSrc: string
}

export function ThemeImage({ lightSrc, darkSrc, alt, ...props }: ThemeImageProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (!mounted) return null

  const src = resolvedTheme === "dark" ? darkSrc : lightSrc

  return <Image src={src} alt={alt} {...props} />
}
