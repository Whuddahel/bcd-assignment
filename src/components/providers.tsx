"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { DevRoleSwitcher } from "@/components/dev/dev-role-switcher"
import { MockBanner } from "@/components/dev/mock-banner"
import { isDevelopmentMode } from "@/lib/config"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <TooltipProvider delayDuration={300}>
          {isDevelopmentMode && <MockBanner />}
          {children}
          {isDevelopmentMode && <DevRoleSwitcher />}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "oklch(0.11 0.022 280)",
                border: "1px solid oklch(0.22 0.018 280)",
                color: "oklch(0.95 0.010 280)",
              },
            }}
          />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
