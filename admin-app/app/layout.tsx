import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Urban Cowboy — Admin Portal",
    template: "%s · Urban Cowboy Admin",
  },
  description: "Authenticated administration for the Urban Cowboy booking engine.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
