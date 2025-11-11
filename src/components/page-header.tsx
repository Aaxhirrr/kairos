import DotGridShader from "@/components/DotGridShader"
import RevealOnView from "@/components/reveal-on-view"
import { cn } from "@/lib/utils"

type Props = {
  eyebrow?: string
  title: string
  description: string
  actions?: React.ReactNode
  className?: string
}

export default function PageHeader({ eyebrow, title, description, actions, className }: Props) {
  return (
    <RevealOnView
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900/60 p-6 sm:p-8",
        className
      )}
      intensity="hero"
    >
      <div className="pointer-events-none absolute inset-0 opacity-5 mix-blend-soft-light">
        <DotGridShader />
      </div>
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 text-4xl font-semibold leading-tight text-white">{title}</h1>
          <p className="mt-3 max-w-2xl text-base text-white/70">{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </RevealOnView>
  )
}
