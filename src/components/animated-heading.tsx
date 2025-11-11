"use client"

import { useEffect, useMemo, useRef } from "react"
import { animate, stagger } from "motion"
import { cn } from "@/lib/utils"

type AnimatedHeadingProps = {
  className?: string
  /** Lines of text. Each string will be rendered on its own line. */
  lines: string[]
  /** Delay before the streaming effect starts */
  startDelay?: number
  /** Duration of each word's animation */
  durationPerWord?: number
  /** Stagger between words within a line */
  staggerPerWord?: number
  /** Additional delay between lines */
  lineDelay?: number
  /** Starting blur amount in px */
  fromBlurPx?: number
  /** Starting translateY in px */
  fromTranslateYPx?: number
}

export default function AnimatedHeading({
  className,
  lines,
  startDelay = 0,
  durationPerWord = 0.9,
  staggerPerWord = 0.08,
  lineDelay = 0.3,
  fromBlurPx = 16,
  fromTranslateYPx = 14,
}: AnimatedHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null)

  const tokensPerLine = useMemo(() => {
    // Split each line into words and spaces (keep spaces as separate tokens)
    // Example: "Hello world" => ["Hello", " ", "world"]
    return lines.map((line) => line.split(/(\s+)/))
  }, [lines])

  useEffect(() => {
    if (!headingRef.current) return
    const wordSpans = headingRef.current.querySelectorAll<HTMLSpanElement>("[data-word]")

    // Initialize all words to the starting state
    wordSpans.forEach((el) => {
      el.style.opacity = "0"
      el.style.filter = `blur(${fromBlurPx}px)`
      el.style.transform = `translateY(${fromTranslateYPx}px)`
    })

    // Group words by line index for line-by-line staggering
    const wordsByLine = new Map<number, HTMLSpanElement[]>()
    wordSpans.forEach((el) => {
      const lineIndexAttr = el.getAttribute("data-line-index")
      const lineIndex = lineIndexAttr ? Number(lineIndexAttr) : 0
      const arr = wordsByLine.get(lineIndex) ?? []
      arr.push(el)
      wordsByLine.set(lineIndex, arr)
    })

    // Animate each line with an additional line offset, words within the line staggered
    ;[...wordsByLine.entries()]
      .sort((a, b) => a[0] - b[0])
      .forEach(([lineIndex, words]) => {
        animate(
          words,
          { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
          {
            duration: durationPerWord,
            delay: stagger(staggerPerWord, { start: startDelay + lineIndex * lineDelay }),
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          }
        )
      })
  }, [startDelay])

  return (
    <h1 ref={headingRef} className={cn(className)} aria-label={lines.join(" ")}> 
      {/* Visual characters for animation; hidden from screen readers */}
      <span aria-hidden>
        {tokensPerLine.map((tokens, lineIdx) => (
          <span key={`line-${lineIdx}`} className="block">
            {tokens.map((token, idx) => {
              const isSpace = /^\s+$/.test(token)
              if (isSpace) {
                return <span key={`s-${lineIdx}-${idx}`}>{"\u00A0"}</span>
              }
              return (
                <span
                  key={`w-${lineIdx}-${idx}`}
                  data-word
                  data-line-index={lineIdx}
                  className="inline-block will-change-transform"
                >
                  {token}
                </span>
              )
            })}
          </span>
        ))}
      </span>
    </h1>
  )
}
