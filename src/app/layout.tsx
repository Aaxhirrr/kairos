import type { Metadata } from "next"

import { Providers } from "@/components/providers"
import { THEME_STORAGE_KEY } from "@/components/theme-toggle"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kairos · Polymarket coherence engine",
  description: "Agentic toolkit for spotting mispricing, proving outcomes, and tracking live market context.",
  generator: "v0.dev",
}

const themeInitScript = `
(function(){
  try {
    var storageKey = '${THEME_STORAGE_KEY}';
    var theme = localStorage.getItem(storageKey) || 'dark';
    var root = document.documentElement;
    root.classList.remove('light','dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    var body = document.body;
    if (body) {
      body.classList.remove('light','dark');
      body.classList.add(theme);
    }
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
        <style>{`
:root {
  --font-sans: "Geist", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  --font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
html { font-family: var(--font-sans); }
        `}</style>
      </head>
      <body className="dark">
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
