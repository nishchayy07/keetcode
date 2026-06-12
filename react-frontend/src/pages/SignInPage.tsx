import { SignIn } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";

export function SignInPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 theme-transition ${
      isDark ? "bg-zinc-950" : "bg-slate-50"
    }`}>
      <div className="relative w-full max-w-md">
        {/* Subtle glow orbs */}
        {isDark ? (
          <>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-400/5 rounded-full blur-3xl pointer-events-none" />
          </>
        )}
        
        <div className="relative z-10 w-full flex justify-center">
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
