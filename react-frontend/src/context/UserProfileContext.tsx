import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";

interface UserProfileState {
  /** The DB-stored profileId handle (without @), e.g. "nisha" */
  profileId: string | null;
  displayName: string | null;
  /** true while the ensure call is in-flight */
  loading: boolean;
  /** Call this to force a re-fetch (e.g. after sign-in) */
  refresh: () => void;
}

const UserProfileContext = createContext<UserProfileState>({
  profileId: null,
  displayName: null,
  loading: true, // start as true so consumers wait by default
  refresh: () => {},
});

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const { isLoaded, user } = useUser();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  // Start as TRUE — consumers (ProfilePage) must wait until we know the auth state
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    // Clerk hasn't loaded yet — keep loading=true and wait
    if (!isLoaded) return;

    // Clerk loaded but user is NOT signed in — no profile to ensure, unblock immediately
    if (!isSignedIn || !user) {
      setProfileId(null);
      setDisplayName(null);
      setLoading(false);
      return;
    }

    // User is signed in — call ensure and populate the context
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const token = await getToken();
        const res = await axios.post<{ profile: { profileId: string; displayName: string } }>(
          "/api/profiles/ensure",
          {
            email:     user.primaryEmailAddress?.emailAddress ?? "",
            firstName: user.firstName ?? "",
            lastName:  user.lastName  ?? "",
            username:  user.username  ?? "",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!cancelled) {
          // profileId comes back WITHOUT the @ prefix from the ensure endpoint
          const raw = res.data.profile.profileId;
          setProfileId(raw.startsWith("@") ? raw.slice(1) : raw);
          setDisplayName(res.data.profile.displayName);
        }
      } catch (err) {
        console.warn("[UserProfileContext] ensure failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, user?.id, tick]);

  // Dynamic Axios Interceptor to automatically inject the Clerk token to all requests
  useEffect(() => {
    if (!isLoaded) return;

    let interceptorId: number | null = null;
    if (isSignedIn && user) {
      interceptorId = axios.interceptors.request.use(async (config) => {
        try {
          const token = await getToken();
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (e) {
          console.error("[UserProfileProvider] Failed to inject Clerk token:", e);
        }
        return config;
      });
    }

    return () => {
      if (interceptorId !== null) {
        axios.interceptors.request.eject(interceptorId);
      }
    };
  }, [isLoaded, isSignedIn, user?.id, getToken]);

  return (
    <UserProfileContext.Provider value={{ profileId, displayName, loading, refresh }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  return useContext(UserProfileContext);
}
