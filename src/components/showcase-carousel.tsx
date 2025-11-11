"use client"

import Image from "next/image"
import * as React from "react"
import { cn } from "@/lib/utils"

type Slide = {
  src: string
  caption?: string
  from?: string
  to?: string
}

type Props = {
  images?: Slide[]
  className?: string
}

export default function ShowcaseCarousel({
  images = [
    {
      src: "/placeholder.svg?height=900&width=1600",
      caption: "Hero slide",
      from: "#0f172a",
      to: "#6d28d9",
    },
  ],
  className,
}: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={ref}
      className={cn(
        "h-full w-full overflow-x-auto overflow-y-hidden rounded-[1.35rem] bg-black/40",
        "scroll-smooth",
        className
      )}
      aria-label="Project showcase"
    >
      <div className="flex h-full min-w-full snap-x snap-mandatory gap-4 p-2">
        {images.map((img, i) => (
          <div
            key={i}
            className="relative h-full min-w-full snap-center rounded-[1.2rem] border border-white/10"
            style={{
              backgroundImage: `linear-gradient(135deg, ${img.from ?? "#0f172a"}, ${
                img.to ?? "#6d28d9"
              })`,
            }}
          >
            {/* Media */}
            <div className="relative h-full w-full overflow-hidden rounded-[1.1rem]">
              <Image
                src={img.src || "/placeholder.svg"}
                alt={img.caption || "Showcase image"}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
            </div>

            {/* Caption */}
            {img.caption ? (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs text-white backdrop-blur">
                {img.caption}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
