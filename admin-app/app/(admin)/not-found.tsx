import Link from "next/link";

export default function AdminNotFound() {
  return (
    <section className="flex flex-col items-start gap-3">
      <h1 className="text-2xl font-semibold">Admin page not found</h1>
      <p className="text-sm text-muted-foreground">
        This route is not part of the Admin Portal. Return to the admin home.
      </p>
      <Link href="/" className="text-sm underline">
        Admin home
      </Link>
    </section>
  );
}
