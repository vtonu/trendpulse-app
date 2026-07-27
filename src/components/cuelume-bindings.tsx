import { useEffect } from "react"
import { bind } from "cuelume"

export function CuelumeBindings() {
  useEffect(() => {
    bind()
  }, [])

  return null
}
