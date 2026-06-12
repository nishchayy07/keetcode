import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { useTheme } from "./context/ThemeContext";
import { UserProfileProvider } from "./context/UserProfileContext";
import { RootLayout } from "./components/RootLayout";
import { Landing } from "./pages/Landing";
import { ProblemsDirectory } from "./pages/ProblemsDirectory";
import { WorkspaceClient } from "./pages/WorkspaceClient";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { ProfilePage } from "./pages/ProfilePage";
import axios from "axios";

// Configure Axios defaults from Vite env with a safe local fallback.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
axios.defaults.baseURL = API_BASE_URL;

// Interceptor to add Authorization header dynamically if user token exists
axios.interceptors.request.use((config) => {
  if (config.headers?.Authorization) {
    return config;
  }
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clerk Publishable Key — set VITE_CLERK_PUBLISHABLE_KEY in your .env file
// Get your key from: https://dashboard.clerk.com → API Keys
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_ZXhwZXJ0LWdyaXp6bHktNDcuY2xlcmsuYWNjb3VudHMuZGV2JA";

/**
 * Build a Clerk `appearance` object that works in both dark and light mode.
 *
 * IMPORTANT: Clerk renders its UI inside an <iframe> (or shadow DOM) where
 * Tailwind CSS is NOT loaded, so `elements` class-name strings are ignored.
 * We must use the `variables` API — Clerk injects these as CSS custom
 * properties directly into its own document, so they work everywhere,
 * including the footer row that previously stayed white.
 */
function buildClerkAppearance(isDark: boolean) {
  return {
    layout: {
      socialButtonsPlacement: "bottom" as const,
      logoPlacement: "none" as const,
    },
    variables: {
      // Brand
      colorPrimary:            isDark ? "#22d3ee" : "#4f46e5",
      colorPrimaryForeground:  isDark ? "#09090b" : "#ffffff",
      colorDanger:             "#f43f5e",
      fontFamily:              "Inter, system-ui, sans-serif",
      fontFamilyButtons:       "Inter, system-ui, sans-serif",
      fontSize:                "14px",
      borderRadius:            "0.75rem",

      // ── Card / modal background — this is the key fix:
      //    colorBackground controls the ENTIRE card including the footer row
      colorBackground:         isDark ? "#18181b" : "#ffffff",

      // Input surfaces
      colorInputBackground:    isDark ? "#09090b" : "#f8fafc",
      colorInputText:          isDark ? "#f4f4f5" : "#0f172a",

      // Text
      colorText:               isDark ? "#f4f4f5" : "#0f172a",
      colorTextSecondary:      isDark ? "#a1a1aa" : "#475569",
      colorTextOnPrimaryBackground: isDark ? "#09090b" : "#ffffff",

      // Neutrals (borders, dividers, placeholder text)
      colorNeutral:            isDark ? "#71717a" : "#94a3b8",

      // Shadow
      colorShimmer:            isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    },
    elements: {
      // Card wrapper — override border & shadow since variables handles bg
      card: {
        border:     isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
        boxShadow:  isDark
          ? "0 0 40px rgba(34,211,238,0.04), 0 8px 32px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(0,0,0,0.10)",
      },
      // Footer area — force same background so it never stays white
      footer: {
        background: isDark ? "#18181b" : "#ffffff",
        borderTop:  isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
      },
      // Social buttons
      socialButtonsBlockButton: {
        border:      isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
        background:  isDark ? "#27272a" : "#f8fafc",
        color:       isDark ? "#f4f4f5" : "#1e293b",
      },
      // Primary action button
      formButtonPrimary: {
        background:  isDark ? "#22d3ee" : "#4f46e5",
        color:       isDark ? "#09090b" : "#ffffff",
        fontWeight:  "700",
      },
      // Inputs
      formFieldInput: {
        border:      isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0",
        background:  isDark ? "#09090b" : "#f8fafc",
        color:       isDark ? "#f4f4f5" : "#0f172a",
      },
    },
  };
}

function AppInner() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={buildClerkAppearance(isDark)}
    >
      <UserProfileProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/problems" element={<ProblemsDirectory />} />
              <Route path="/problem/:problemId" element={<WorkspaceClient />} />
              <Route path="/sign-in/*" element={<SignInPage />} />
              <Route path="/sign-up/*" element={<SignUpPage />} />
              <Route path="/u/:profileId" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserProfileProvider>
    </ClerkProvider>
  );
}

function App() {
  return <AppInner />;
}

export default App;

