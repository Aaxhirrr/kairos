"use client"

import { useEffect, useState } from "react"

type Props = {
  timeZone?: string
  className?: string
}

export default function LiveClock({ timeZone = "UTC", className = "" }: Props) {
  const [now, setNow] = useState<string>(() =>
    new Date().toLocaleString("en-US", { timeZone, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true, timeZoneName: "short" })
  )

  useEffect(() => {
    const id = setInterval(() => {
      setNow(
        new Date().toLocaleString("en-US", {
          timeZone,
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          timeZoneName: "short",
        })
      )
    }, 1000)
    return () => clearInterval(id)
  }, [timeZone])

  return <div className={className}>{now}</div>
}
