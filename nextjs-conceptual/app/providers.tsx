"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider, useTheme } from "next-themes";
import { ReactNode } from "react";

function ClerkThemeProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: "#4f46e5", // glowing indigo
          colorBackground: isDark ? "#09090b" : "#ffffff", // bg-zinc-950 / bg-white
          colorText: isDark ? "#f4f4f5" : "#18181b", // zinc-100 / zinc-900
          colorTextSecondary: isDark ? "#a1a1aa" : "#52525b", // zinc-400 / zinc-600
          colorInputBackground: isDark ? "#09090b" : "#ffffff",
          colorInputText: isDark ? "#f4f4f5" : "#18181b",
          colorBorder: isDark ? "#27272a" : "#e4e4e7", // zinc-800 / zinc-200
        },
        elements: {
          // Explicitly target card and footer elements to map to zinc-950 in dark mode
          card: "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-none rounded-2xl overflow-hidden",
          footer: "bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800/80",
          footerActionText: "text-zinc-500 dark:text-zinc-400",
          footerActionLink: "text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold",
          socialButtonsBlockButton: "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-none rounded-xl",
          formFieldInput: "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-none",
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-none border-0 py-2.5 transition-colors",
          dividerLine: "bg-zinc-200 dark:bg-zinc-800",
          dividerText: "text-zinc-400 dark:text-zinc-500 text-xs",
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkThemeProvider>
        {children}
      </ClerkThemeProvider>
    </ThemeProvider>
  );
}
