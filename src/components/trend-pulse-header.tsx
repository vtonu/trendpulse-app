import { Activity } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

type TrendPulseHeaderProps = { lastUpdated: string }

export function TrendPulseHeader({ lastUpdated }: TrendPulseHeaderProps) {
  const { setTheme } = useTheme()

  function toggleTheme() {
    setTheme(
      document.documentElement.classList.contains("dark") ? "light" : "dark"
    )
  }

  return (
    <header className="flex items-start justify-between gap-5 border-b border-border pb-8">
      <div>
        <div className="mb-3 flex items-center gap-2 text-[10px] tracking-[0.18em] text-primary">
          {/* <span className="live-dot size-1.5 rounded-full bg-primary" /> */}
          ranking type beats
        </div>
        <h1 className="font-heading text-2xl font-medium tracking-[-0.06em]">
          trend pulse
        </h1>
      </div>
      <div className="text-right font-heading text-[10px] leading-5 text-muted-foreground">
        <div className="flex items-center justify-end gap-1.5 text-foreground">
          <Activity className="size-3 text-primary" />
          updated daily
        </div>
        <div className="text-foreground">{lastUpdated}</div>
        <div>
          press '
          <button
            type="button"
            data-cuelume-toggle
            onClick={toggleTheme}
            className="underline decoration-muted-foreground/50 underline-offset-2 hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
            aria-label="toggle dark mode "
          >
            d
          </button>
          ' to toggle dark mode
        </div>
      </div>
    </header>
  )
}
