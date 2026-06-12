import { ReactNode } from "react";
import { Providers } from "./providers";
import "./globals.css"; // Assuming standard Tailwind styling imports

export const metadata = {
  title: "KeetCode - The Ultimate Competitive Programming Arena",
  description: "Verify your competitive coding prowess in real-time matchups on KeetCode.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-550 min-h-screen antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
