import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { source } from "../source";
import "./globals.css";

export const metadata = {
  title: "Urban Cowboy Component Library",
  description: "Public component documentation built from the real booking-engine components.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider
          search={{
            enabled: true,
            options: {
              type: "static",
              api: `${process.env.NEXT_PUBLIC_DOCS_BASE_PATH ?? ""}/search-index.json`,
            },
          }}
        >
          <DocsLayout
            tree={source.pageTree}
            nav={{ title: "Urban Cowboy" }}
            githubUrl="https://github.com/REVREBEL/urban-cowboy-booking-engine"
          >
            {children}
          </DocsLayout>
        </RootProvider>
      </body>
    </html>
  );
}
