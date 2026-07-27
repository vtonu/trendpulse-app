import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { CuelumeBindings } from "@/components/cuelume-bindings.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark">
      <CuelumeBindings />
      <App />
    </ThemeProvider>
  </StrictMode>
)
