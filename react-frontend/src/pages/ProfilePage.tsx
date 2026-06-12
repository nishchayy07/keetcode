import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { User, Users, BookOpen, Edit2, Check, X, Award } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useUserProfile } from "../context/UserProfileContext";

interface SimpleProfile {
  clerkUserId: string;
  profileId: string;
  displayName: string;
  bio: string | null;
  problemsSolved: number;
}

interface ProfileDetails {
  clerkUserId: string;
  profileId: string;
  displayName: string;
  bio: string | null;
  problemsSolved: number;
  followers: SimpleProfile[];
  following: SimpleProfile[];
  followersCount: number;
  followingCount: number;
}

export function ProfilePage() {
  const { profileId } = useParams<{ profileId: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const { loading: profileContextLoading } = useUserProfile();

  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowHovered, setIsFollowHovered] = useState(false);

  // Edit Mode state
  const [editMode, setEditMode] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [updating, setUpdating] = useState(false);

  // Modals state
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  // Determine if viewing own profile
  const isMe = user && profile && user.id === profile.clerkUserId;

  // Check if following
  const isFollowing = profile && user && profile.followers.some((f) => f.clerkUserId === user.id);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prepend @ if it doesn't exist to match handles in route params
      const param = profileId?.startsWith("@") ? profileId : `@${profileId}`;
      const token = await getToken();
      const res = await axios.get(`/api/profiles/${param}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setProfile(res.data);
      setEditDisplayName(res.data.displayName);
      setEditBio(res.data.bio || "");
    } catch (err: any) {
      // Last-resort: if 404 and signed in, try to create the profile then retry once
      if (err.response?.status === 404 && isSignedIn && user) {
        try {
          const token = await getToken();
          await axios.post(
            "/api/profiles/ensure",
            {
              email:     user.primaryEmailAddress?.emailAddress ?? "",
              firstName: user.firstName ?? "",
              lastName:  user.lastName  ?? "",
              username:  user.username  ?? "",
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Retry the profile fetch after ensure
          const param = profileId?.startsWith("@") ? profileId : `@${profileId}`;
          const res = await axios.get(`/api/profiles/${param}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          setProfile(res.data);
          setEditDisplayName(res.data.displayName);
          setEditBio(res.data.bio || "");
          return;
        } catch (retryErr: any) {
          console.error("[ProfilePage] retry after ensure failed:", retryErr);
          setError(retryErr.response?.data?.message || "Profile not found");
          return;
        }
      }
      console.error(err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for the ensure call to finish before fetching so the profile
    // row is guaranteed to exist in the DB (fixes race condition).
    if (profileContextLoading) return;
    fetchProfile();
  }, [profileId, user, profileContextLoading]);

  const handleFollowToggle = async () => {
    if (!isSignedIn) {
      alert("Please sign in to follow users.");
      return;
    }
    if (!profile) return;

    try {
      const token = await getToken();
      const res = await axios.post(`/api/profiles/${profile.profileId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refetch profile to update follow count and list
      await fetchProfile();
    } catch (err: any) {
      console.error("Follow error:", err);
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setUpdating(true);
    try {
      const token = await getToken();
      const res = await axios.put(`/api/profiles/${profile.profileId}`, {
        displayName: editDisplayName,
        bio: editBio,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setProfile((prev) => prev ? {
        ...prev,
        displayName: res.data.displayName,
        bio: res.data.bio,
      } : null);
      setEditMode(false);
    } catch (err: any) {
      console.error("Save profile error:", err);
      alert(err.response?.data?.message || "Failed to save profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center theme-transition ${
        isDark ? "bg-zinc-950 text-zinc-400" : "bg-slate-50 text-zinc-500"
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm font-mono">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center theme-transition ${
        isDark ? "bg-zinc-950 text-zinc-400" : "bg-slate-50 text-zinc-500"
      }`}>
        <div className="text-center max-w-md px-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <X className="h-6 w-6" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>Profile Not Found</h2>
          <p className="text-sm mb-6">{error || "The requested profile does not exist."}</p>
          <Link to="/" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition-all">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-4rem)] theme-transition ${
      isDark ? "bg-zinc-950 text-zinc-300" : "bg-slate-50 text-zinc-600"
    }`}>
      {/* Background orbs */}
      <div className="relative overflow-hidden pt-12 pb-16">
        {isDark ? (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-violet-400/5 rounded-full blur-[120px] pointer-events-none" />
          </>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Card */}
          <div className={`border rounded-2xl p-6 sm:p-8 theme-transition shadow-sm ${
            isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-white border-zinc-200"
          }`}>
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-zinc-800/10 dark:border-zinc-200/10">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                {/* Avatar */}
                <div className={`h-24 w-24 rounded-full flex items-center justify-center border font-bold text-3xl theme-transition ${
                  isDark
                    ? "bg-zinc-850 border-zinc-700 text-indigo-400"
                    : "bg-indigo-50 border-indigo-150 text-indigo-600"
                }`}>
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>

                {/* Profile IDs and Bio */}
                <div className="flex-1">
                  {editMode ? (
                    <div className="flex flex-col gap-2.5 max-w-xs">
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold theme-transition focus:ring-1 focus:ring-indigo-500 outline-none ${
                          isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
                        }`}
                        placeholder="Display Name"
                      />
                    </div>
                  ) : (
                    <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight theme-transition ${
                      isDark ? "text-white" : "text-zinc-900"
                    }`}>
                      {profile.displayName}
                    </h1>
                  )}
                  <p className="text-sm font-mono text-zinc-500 mt-1">{profile.profileId}</p>
                  
                  {editMode ? (
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className={`w-full max-w-md mt-3 px-3 py-1.5 rounded-lg border text-xs leading-relaxed theme-transition focus:ring-1 focus:ring-indigo-500 outline-none resize-none ${
                        isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
                      }`}
                      placeholder="Add a bio..."
                      rows={3}
                    />
                  ) : (
                    <p className={`text-sm mt-3 max-w-md font-light leading-relaxed ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}>
                      {profile.bio || "This user hasn't added a bio yet."}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isMe ? (
                  editMode ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={updating}
                        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditDisplayName(profile.displayName);
                          setEditBio(profile.bio || "");
                          setEditMode(false);
                        }}
                        className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                          isDark
                            ? "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300"
                            : "bg-white hover:bg-zinc-50 border-zinc-250 text-zinc-600"
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                        isDark
                          ? "bg-zinc-850 hover:bg-zinc-800 border-zinc-800 text-zinc-300"
                          : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600"
                      }`}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Profile
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleFollowToggle}
                    onMouseEnter={() => setIsFollowHovered(true)}
                    onMouseLeave={() => setIsFollowHovered(false)}
                    className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 ${
                      isFollowing
                        ? isFollowHovered
                          ? "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
                          : isDark
                            ? "bg-zinc-800 border border-zinc-700 text-zinc-300"
                            : "bg-white border border-zinc-200 text-zinc-650"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                    }`}
                  >
                    {isFollowing ? (
                      isFollowHovered ? (
                        <>
                          <X className="h-3.5 w-3.5" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Following
                        </>
                      )
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              
              {/* Problems Solved Card */}
              <div className={`border rounded-xl p-4 sm:p-5 theme-transition flex flex-col items-center justify-center text-center ${
                isDark ? "bg-zinc-950/40 border-zinc-800/80" : "bg-slate-50 border-zinc-200"
              }`}>
                <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 border border-indigo-500/20">
                  <Award className="h-4 w-4" />
                </div>
                <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight theme-transition ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}>
                  {profile.problemsSolved}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mt-1">
                  Problems Solved
                </div>
              </div>

              {/* Followers Card */}
              <button
                onClick={() => setModalType("followers")}
                className={`border rounded-xl p-4 sm:p-5 theme-transition flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-[0.98] ${
                  isDark ? "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700" : "bg-slate-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-2 border border-cyan-500/20">
                  <Users className="h-4 w-4" />
                </div>
                <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight theme-transition ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}>
                  {profile.followersCount}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mt-1">
                  Followers
                </div>
              </button>

              {/* Following Card */}
              <button
                onClick={() => setModalType("following")}
                className={`border rounded-xl p-4 sm:p-5 theme-transition flex flex-col items-center justify-center text-center hover:scale-[1.02] active:scale-[0.98] ${
                  isDark ? "bg-zinc-950/40 border-zinc-800/80 hover:border-zinc-700" : "bg-slate-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center mb-2 border border-violet-500/20">
                  <User className="h-4 w-4" />
                </div>
                <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight theme-transition ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}>
                  {profile.followingCount}
                </div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500 mt-1">
                  Following
                </div>
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* Modals for Followers / Following list */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl theme-transition animate-scale-up ${
            isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/10 dark:border-zinc-200/10">
              <h3 className="text-lg font-bold capitalize flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                {modalType === "followers" ? "Followers" : "Following"} ({modalType === "followers" ? profile.followersCount : profile.followingCount})
              </h3>
              <button
                onClick={() => setModalType(null)}
                className={`p-1.5 rounded-lg border theme-transition ${
                  isDark ? "hover:bg-zinc-800 border-zinc-850 text-zinc-400" : "hover:bg-zinc-50 border-zinc-150 text-zinc-500"
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal List */}
            <div className="max-h-[300px] overflow-y-auto mt-4 pr-1 scrollbar-thin">
              {((modalType === "followers" ? profile.followers : profile.following) || []).length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  No {modalType} yet.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {((modalType === "followers" ? profile.followers : profile.following) || []).map((userItem) => (
                    <Link
                      key={userItem.clerkUserId}
                      to={`/u/@${userItem.profileId}`}
                      onClick={() => setModalType(null)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border theme-transition ${
                        isDark
                          ? "bg-zinc-950/40 border-zinc-850 hover:bg-zinc-800/40 hover:border-zinc-800"
                          : "bg-slate-50/60 border-zinc-150 hover:bg-zinc-100/60 hover:border-zinc-200"
                      }`}
                    >
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border font-bold text-sm theme-transition ${
                        isDark ? "bg-zinc-800 border-zinc-750 text-indigo-400" : "bg-indigo-50 border-indigo-150 text-indigo-600"
                      }`}>
                        {userItem.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate text-zinc-900 dark:text-white">
                          {userItem.displayName}
                        </div>
                        <div className="text-xs font-mono text-zinc-500 truncate mt-0.5">
                          @{userItem.profileId}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
