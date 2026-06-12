import { Bell, Code2, LogIn, Sun, Moon, Trophy, MessageSquare, Search, User } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";
import { useUserProfile } from "../context/UserProfileContext";
import axios from "axios";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "relative text-[var(--keet-text-primary)] font-medium text-sm after:absolute after:bottom-[-18px] after:left-0 after:right-0 after:h-[2px] after:bg-[var(--keet-accent-primary)] after:rounded-full transition-colors"
    : "relative text-[var(--keet-text-secondary)] hover:text-[var(--keet-text-primary)] font-medium text-sm transition-colors";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { profileId: dbProfileId } = useUserProfile();
  const { user } = useUser();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  // Use DB profileId once ensure resolves; fall back to Clerk user data in the meantime
  // so the Profile link is always visible immediately after sign-in.
  const clerkFallbackHandle = user
    ? (user.username || user.primaryEmailAddress?.emailAddress?.split("@")[0] || user.id)
        .toLowerCase()
        .replace(/[^a-z0-9_.]/g, "")
    : "";
  const userProfileHandle = dbProfileId ?? clerkFallbackHandle;

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Debounced search query to backend
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await axios.get(`/api/profiles/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error("Search profiles error:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md border-b theme-transition ${
        isDark
          ? "bg-zinc-950/85 border-white/[0.07]"
          : "bg-white/85 border-zinc-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              aria-label="KeetCode home"
            >
              <div className="relative">
                <Code2
                  className={`h-5 w-5 transition-all duration-300 ${
                    isDark
                      ? "text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                      : "text-indigo-600 group-hover:drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]"
                  }`}
                />
              </div>
              <span className="font-bold text-base tracking-tight text-[var(--keet-text-primary)]">
                Keet<span className={isDark ? "text-cyan-400" : "text-indigo-600"}>Code</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
              <NavLink to="/problems"  className={navItemClass} id="nav-problems">Problems</NavLink>
              <SignedIn>
                {userProfileHandle && (
                  <NavLink to={`/u/@${userProfileHandle}`} className={navItemClass}>
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 opacity-70" />
                      Profile
                    </span>
                  </NavLink>
                )}
              </SignedIn>
            </nav>
          </div>

          {/* Right: Search + Theme toggle + Notification + Auth */}
          <div className="flex items-center gap-3">

            {/* Command-Palette Style Search Bar */}
            <div className="relative w-40 sm:w-56">
              <div className="relative">
                <Search className={`absolute left-2.5 top-2.5 h-3.5 w-3.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`} />
                <input
                  type="text"
                  placeholder="Search user profile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border theme-transition focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-zinc-900/40 border-zinc-800 text-zinc-100 placeholder-zinc-500"
                      : "bg-slate-100 border-zinc-200 text-zinc-800 placeholder-zinc-400"
                  }`}
                />
              </div>

              {/* Dropdown Results */}
              {isSearchFocused && (searchQuery.trim().length > 0 || searchResults.length > 0) && (
                <div className={`absolute right-0 w-64 mt-1.5 max-h-60 overflow-y-auto rounded-2xl border p-1 backdrop-blur-md shadow-xl theme-transition z-50 ${
                  isDark ? "bg-zinc-950/90 border-zinc-800" : "bg-white/90 border-zinc-200"
                }`}>
                  {loadingSearch ? (
                    <div className="text-center py-3 text-xs font-mono text-zinc-500">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-3 text-xs text-zinc-500">
                      No profiles found
                    </div>
                  ) : (
                    searchResults.map((p) => (
                      <button
                        key={p.clerkUserId}
                        onClick={() => {
                          setSearchQuery("");
                          navigate(`/u/@${p.profileId}`);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left theme-transition ${
                          isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                        }`}
                      >
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center border text-[10px] font-bold theme-transition ${
                          isDark ? "bg-zinc-850 border-zinc-750 text-indigo-400" : "bg-indigo-50 border-indigo-150 text-indigo-600"
                        }`}>
                          {p.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-semibold truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                            {p.displayName}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-500 truncate">
                            @{p.profileId}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ── Theme Toggle ── */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`relative p-2 rounded-lg transition-all duration-200 group ${
                isDark
                  ? "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                  : "text-zinc-500 hover:text-zinc-800 hover:bg-black/5"
              }`}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              id="btn-theme-toggle"
            >
              <span className="relative block h-5 w-5">
                {isDark ? (
                  <Sun key="sun" className="h-5 w-5 animate-theme-icon-in" />
                ) : (
                  <Moon key="moon" className="h-5 w-5 animate-theme-icon-in" />
                )}
              </span>
            </button>



            {/* Auth Buttons */}
            <SignedOut>
              <Link
                to="/sign-in"
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                  isDark
                    ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                }`}
                id="btn-signin"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign in
              </Link>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center pl-1">
                <UserButton
                  afterSignOutUrl="/"
                />
              </div>
            </SignedIn>

          </div>
        </div>
      </div>
    </header>
  );
}

