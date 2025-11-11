"use client"

import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import { animate, inView, stagger } from "motion"

type RevealOnViewProps = {
  as?: keyof JSX.IntrinsicElements
  className?: string
  children: React.ReactNode
  /** Optional delay per item for staggered lists */
  delay?: number
  style?: CSSProperties
  /** If true, applies a stronger lift/blur for hero content */
  intensity?: "soft" | "hero"
  /** If true, will animate immediate children in a staggered sequence */
  staggerChildren?: boolean
}

export default function RevealOnView({ as = "div", className, children, delay = 0, style, intensity = "soft", staggerChildren = false }: RevealOnViewProps) {
  const Tag = as as any
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const startTranslate = intensity === "hero" ? 28 : 18
    const startBlur = intensity === "hero" ? 16 : 10
    const startScale = intensity === "hero" ? 0.965 : 0.98

    if (staggerChildren) {
      // Parent stays visible; children will handle their own initial state
      element.style.opacity = "1"
      element.style.transform = "none"
      element.style.filter = "none"
    } else {
      element.style.opacity = "0"
      element.style.transform = `translateY(${startTranslate}px) scale(${startScale})`
      element.style.filter = `blur(${startBlur}px)`
    }

    const cleanup = inView(element, () => {
      const targets = staggerChildren
        ? Array.from(element.children) as HTMLElement[]
        : [element]

      // Initialize all targets if we're staggering children
      if (staggerChildren) {
        targets.forEach((t) => {
          t.style.opacity = "0"
          t.style.transform = `translateY(${startTranslate}px) scale(${startScale})`
          t.style.filter = `blur(${startBlur}px)`
        })
      }

      animate(
        targets,
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0px)" },
        { duration: 0.95, delay: targets.length > 1 ? stagger(0.12, { start: delay }) : delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      )
    })

    return () => cleanup()
  }, [delay])

  return (
    <Tag ref={ref} className={className} style={style}>
      {children}
    </Tag>
  )
}
