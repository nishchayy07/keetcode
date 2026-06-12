import { Response, Router } from "express";
import prismaClient from "../db";
import clerkAuthMiddleware, { ClerkRequest } from "../middleware/clerkAuth";
import jwt from "jsonwebtoken";

const router = Router();

// 0. Ensure profile exists (idempotent upsert — frontend calls this after sign-in)
//    Works as a local-dev fallback when Clerk webhooks can't reach localhost.
router.post("/ensure", clerkAuthMiddleware, async (req: ClerkRequest, res: Response) => {
  const clerkUserId = req.clerkUserId!;

  try {
    // Prefer metadata sent from frontend (Clerk useUser hook is the most reliable source)
    // Fall back to JWT decode claims if not provided
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const decoded = jwt.decode(token) as Record<string, any> | null;

    const email: string      = req.body.email      ?? decoded?.email      ?? "";
    const firstName: string  = req.body.firstName  ?? decoded?.first_name ?? "";
    const lastName: string   = req.body.lastName   ?? decoded?.last_name  ?? "";
    const username: string   = req.body.username   ?? decoded?.username   ?? "";

    const displayName =
      `${firstName} ${lastName}`.trim() || username || email.split("@")[0] || "User";

    // Return existing profile immediately if found
    const existing = await prismaClient.userProfile.findUnique({
      where: { clerkUserId },
    });
    if (existing) {
      // Ensure User record exists to satisfy foreign key constraints for submissions
      await prismaClient.user.upsert({
        where: { id: clerkUserId },
        update: {},
        create: {
          id: clerkUserId,
          email: email || `${clerkUserId}@clerk.com`,
          name: displayName,
          password: "clerk",
        },
      });
      return res.json({ created: false, profile: existing });
    }

    // Derive a unique profileId handle
    let baseProfileId = (username || email.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, "");
    if (baseProfileId.length < 3) baseProfileId = "user_" + baseProfileId;

    let profileId = baseProfileId;
    let counter = 1;
    while (true) {
      const conflict = await prismaClient.userProfile.findUnique({ where: { profileId } });
      if (!conflict) break;
      profileId = `${baseProfileId}${counter}`;
      counter++;
    }

    // Create corresponding User record first to satisfy foreign key constraints
    await prismaClient.user.upsert({
      where: { id: clerkUserId },
      update: {},
      create: {
        id: clerkUserId,
        email: email || `${clerkUserId}@clerk.com`,
        name: displayName,
        password: "clerk",
      },
    });

    const newProfile = await prismaClient.userProfile.create({
      data: {
        clerkUserId,
        profileId,
        displayName,
        bio: "Welcome to my KeetCode profile!",
        problemsSolved: 0,
      },
    });

    console.log("[profiles/ensure] Created profile:", newProfile);
    return res.json({ created: true, profile: newProfile });
  } catch (err: any) {
    console.error("[profiles/ensure] Error:", err);
    return res.status(500).json({ message: "Failed to ensure profile", error: err.message });
  }
});

// 1. Search for profiles
router.get("/search", async (req: ClerkRequest, res: Response) => {
  const query = req.query.q as string;
  if (!query) {
    return res.json([]);
  }

  try {
    const cleanQuery = query.startsWith("@") ? query.substring(1) : query;
    const profiles = await prismaClient.userProfile.findMany({
      where: {
        OR: [
          { profileId: { contains: cleanQuery, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    });
    return res.json(profiles);
  } catch (error: any) {
    console.error("Error searching profiles:", error);
    return res.status(500).json({ message: "Failed to search profiles", error: error.message });
  }
});

// 2. Get profile by profileId (handle, e.g. @username) or clerkUserId
router.get("/:profileId", async (req: ClerkRequest, res: Response) => {
  const profileId = (req.params.profileId || "") as string;
  try {
    const isClerkId = !profileId.startsWith("@");
    const cleanProfileId = profileId.startsWith("@") ? profileId.substring(1) : profileId;

    const profile = await prismaClient.userProfile.findFirst({
      where: isClerkId
        ? { clerkUserId: profileId }
        : { profileId: { equals: cleanProfileId, mode: "insensitive" } },
      include: {
        followers: {
          include: {
            follower: true,
          },
        },
        following: {
          include: {
            followee: true,
          },
        },
      },
    }) as any;

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Map the relations to return clean objects for followers/following list
    const followersList = profile.followers.map((f: any) => f.follower);
    const followingList = profile.following.map((f: any) => f.followee);

    return res.json({
      clerkUserId: profile.clerkUserId,
      profileId: `@${profile.profileId}`,
      displayName: profile.displayName,
      bio: profile.bio,
      problemsSolved: profile.problemsSolved,
      followers: followersList,
      following: followingList,
      followersCount: followersList.length,
      followingCount: followingList.length,
    });
  } catch (error: any) {
    console.error("Error retrieving profile:", error);
    return res.status(500).json({ message: "Failed to retrieve profile", error: error.message });
  }
});

// 3. Edit profile details (displayName, bio)
router.put("/:profileId", clerkAuthMiddleware, async (req: ClerkRequest, res: Response) => {
  const profileId = (req.params.profileId || "") as string;
  const { displayName, bio } = req.body;
  const authClerkUserId = req.clerkUserId;

  try {
    const cleanProfileId = profileId.startsWith("@") ? profileId.substring(1) : profileId;
    const profile = await prismaClient.userProfile.findFirst({
      where: {
        OR: [
          { clerkUserId: authClerkUserId },
          { profileId: cleanProfileId }
        ]
      },
    });

    if (!profile || profile.clerkUserId !== authClerkUserId) {
      return res.status(403).json({ message: "Unauthorized to edit this profile" });
    }

    const updatedProfile = await prismaClient.userProfile.update({
      where: { id: profile.id },
      data: {
        displayName: displayName || profile.displayName,
        bio: bio !== undefined ? bio : profile.bio,
      },
    });

    return res.json({
      clerkUserId: updatedProfile.clerkUserId,
      profileId: `@${updatedProfile.profileId}`,
      displayName: updatedProfile.displayName,
      bio: updatedProfile.bio,
      problemsSolved: updatedProfile.problemsSolved,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
});

// 4. Toggle Follow/Unfollow a user
router.post("/:profileId/follow", clerkAuthMiddleware, async (req: ClerkRequest, res: Response) => {
  const profileId = (req.params.profileId || "") as string; // Profile we want to follow
  const followerClerkId = req.clerkUserId; // Current logged-in user

  if (!followerClerkId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Find target user profile
    const cleanProfileId = profileId.startsWith("@") ? profileId.substring(1) : profileId;
    const targetProfile = await prismaClient.userProfile.findFirst({
      where: { profileId: { equals: cleanProfileId, mode: "insensitive" } },
    });

    if (!targetProfile) {
      return res.status(404).json({ message: "Target profile not found" });
    }

    if (targetProfile.clerkUserId === followerClerkId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Ensure the follower also has a profile in our database
    const followerProfile = await prismaClient.userProfile.findUnique({
      where: { clerkUserId: followerClerkId },
    });

    if (!followerProfile) {
      return res.status(400).json({ message: "Follower profile does not exist" });
    }

    // Check if follow relation already exists
    const existingFollow = await prismaClient.followRelation.findUnique({
      where: {
        followerId_followeeId: {
          followerId: followerClerkId,
          followeeId: targetProfile.clerkUserId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prismaClient.followRelation.delete({
        where: {
          followerId_followeeId: {
            followerId: followerClerkId,
            followeeId: targetProfile.clerkUserId,
          },
        },
      });
      return res.json({ following: false, message: "Unfollowed successfully" });
    } else {
      // Follow
      await prismaClient.followRelation.create({
        data: {
          followerId: followerClerkId,
          followeeId: targetProfile.clerkUserId,
        },
      });
      return res.json({ following: true, message: "Followed successfully" });
    }
  } catch (error: any) {
    console.error("Error toggling follow:", error);
    return res.status(500).json({ message: "Failed to toggle follow status", error: error.message });
  }
});

export default router;
