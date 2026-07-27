import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react"
import type { Artist } from "@/data/artists"
import { cn } from "@/lib/utils"

type TrendRowProps = {
  artist: Artist
  rank: number
  change: number
  selected: boolean
  onSelect: () => void
}

export function TrendRow({
  artist,
  rank,
  change,
  selected,
  onSelect,
}: TrendRowProps) {
  const direction = change > 0 ? "up" : change < 0 ? "down" : "stable"
  const hasLowData = artist.sampleSize !== undefined && artist.sampleSize < 10
  const Icon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : ArrowRight
  return (
    <button
      data-cuelume-press
      onClick={onSelect}
      className={cn(
        "group grid w-full grid-cols-[2rem_minmax(0,1fr)_auto_2.2rem] items-center gap-2 border-b border-border px-3 py-4 text-left transition-colors last:border-b-0 hover:bg-muted/40",
        selected && "bg-primary/6"
      )}
    >
      <span className="font-heading text-[10px] text-muted-foreground">
        {String(rank).padStart(2, "0")}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[13px] font-medium tracking-tight">
          {artist.name} <span className="text-muted-foreground">type beat</span>
        </span>
        {hasLowData && (
          <span className="shrink-0 border border-destructive/50 px-1.5 py-0.5 font-heading text-[8px] tracking-wide text-destructive">
            low data
          </span>
        )}
      </span>
      <span
        className={cn(
          "flex items-center justify-end gap-0.5 font-heading text-[11px] tabular-nums",
          direction === "up"
            ? "text-primary"
            : direction === "down"
              ? "text-destructive"
              : "text-muted-foreground"
        )}
      >
        <Icon className="size-3" />
        {Math.round(Math.abs(change))}%
      </span>
      <span
        key={artist.score}
        className="value-pop text-right font-heading text-xs tabular-nums"
      >
        {(artist.score / 10).toFixed(1)}
      </span>
    </button>
  )
}
