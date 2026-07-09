import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoopLens",
  description: "Proof-of-work dashboard for AI-assisted development loops."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
