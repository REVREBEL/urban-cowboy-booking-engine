import { Button } from "@/components/ui/Button";

/** Plain form POST so the browser supplies the same-origin Origin header. */
export function SignOutButton() {
  return (
    <form action="/api/auth/logout" method="post">
      <Button type="submit" variant="outline" size="small">
        Sign out
      </Button>
    </form>
  );
}
