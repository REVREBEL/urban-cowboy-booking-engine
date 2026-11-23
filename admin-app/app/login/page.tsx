import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Sign in required" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Admin sign-in required</h1>
      <p className="text-sm text-muted-foreground">
        This application is protected by Cloudflare Access. Your session, multi-factor
        authentication and logout are handled there; this app only verifies the Access
        assertion on the server. If you have an active Access session, continue to the
        admin portal. Otherwise your Access policy will prompt you to sign in.
      </p>
      <div>
        <Button asChild size="small">
          <Link href="/">Continue to admin portal</Link>
        </Button>
      </div>
    </main>
  );
}
