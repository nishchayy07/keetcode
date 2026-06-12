import { Router } from "express";
import prismaClient from "../db";

const router = Router();

router.post("/", async (req, res) => {
  const { data, type } = req.body;
  if (!type || !data) {
    return res.status(400).json({ message: "Missing type or data" });
  }

  // Handle user.created event from Clerk
  if (type === "user.created") {
    const clerkUserId = data.id;
    const email = data.email_addresses?.[0]?.email_address || "";
    const firstName = data.first_name || "";
    const lastName = data.last_name || "";
    const displayName = `${firstName} ${lastName}`.trim() || email.split("@")[0] || "User";

    // Generate unique profileId (handle)
    let baseProfileId = (data.username || email.split("@")[0] || "user")
      .toLowerCase()
      .replace(/[^a-z0-9_.]/g, "");
    
    if (baseProfileId.length < 3) {
      baseProfileId = "user_" + baseProfileId;
    }

    let profileId = baseProfileId;
    let counter = 1;

    try {
      // Resolve conflicts to ensure profileId is unique
      while (true) {
        const existing = await prismaClient.userProfile.findUnique({
          where: { profileId },
        });
        if (!existing) {
          break;
        }
        profileId = `${baseProfileId}${counter}`;
        counter++;
      }

      // Check if profile already exists for this Clerk ID
      const existingProfile = await prismaClient.userProfile.findUnique({
        where: { clerkUserId },
      });

      if (existingProfile) {
        // Make sure User record exists
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
        return res.json({ success: true, message: "Profile already exists", profile: existingProfile });
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

      console.log("Created user profile via webhook:", newProfile);
      return res.json({ success: true, profile: newProfile });
    } catch (err: any) {
      console.error("Webhook user.created error:", err);
      return res.status(500).json({ message: "Failed to create profile", error: err.message });
    }
  }

  return res.json({ received: true });
});

export default router;
