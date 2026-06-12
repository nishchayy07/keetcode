export interface UserProfile {
  id: string;
  clerkUserId: string;
  profileId: string; // unique, e.g., "@username"
  displayName: string;
  bio: string | null;
  problemsSolved: number;
  followersCount: number;
  followingCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FollowRelation {
  id: string;
  followerId: string; // clerkUserId of follower
  followeeId: string; // clerkUserId of followee
  createdAt: string;
}
