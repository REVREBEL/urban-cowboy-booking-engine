import Link from "next/link";

/**
 * Protected-ready admin shell. W1.3 adds session verification and role-aware
 * navigation; this slice only establishes the route group, shell boundaries
 * and a non-cached response policy. No data is fetched here.
 */
export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="font-semibold">
            Urban Cowboy · Admin
          </Link>
          <span className="text-xs text-muted-foreground">Next.js foundation</span>
        </div>
      </header>
      <main id="admin-main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
