import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton } from "../../components/SignOutButton";
import { can, getAdminSession, publicSession } from "../../lib/session";

export const dynamic = "force-dynamic";

/**
 * Every route in this group is protected by a verified Access session. UI
 * hiding is not authorization: capability checks are repeated at the API
 * boundary in W1.4. Booking Studio enablement is unrelated to this guard.
 */
export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getAdminSession();
  if (!session) redirect("/login?next=%2F");
  const viewer = publicSession(session);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold">
              Urban Cowboy · Admin
            </Link>
            {can(session, "settings") && (
              <span className="rounded border border-border px-2 py-1 text-xs text-muted-foreground">
                Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{viewer?.email || "Authenticated"}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main id="admin-main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
