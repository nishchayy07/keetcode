import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =========================================================================
// DATABASE SCHEMA (conceptual prisma/schema.prisma representation)
// =========================================================================
// model UserProfile {
//   id             String   @id @default(uuid())
//   clerkUserId    String   @unique
//   profileId      String   @unique  // e.g., @user123
//   displayName    String
//   bio            String?  @default("Welcome to my KeetCode profile!")
//   problemsSolved Int      @default(0)
//   followersCount Int      @default(0)
//   createdAt      DateTime @default(now())
//   updatedAt      DateTime @updatedAt
// }
// =========================================================================

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get the headers from request for Svix signature verification
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // Get raw request body as text for verification
  const payload = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload and signatures
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const { type, data } = evt;

  // Process user creation webhook
  if (type === "user.created") {
    try {
      const clerkUserId = data.id;
      const email = data.email_addresses?.[0]?.email_address || "";
      const firstName = data.first_name || "";
      const lastName = data.last_name || "";
      const displayName = `${firstName} ${lastName}`.trim() || email.split("@")[0] || "User";

      // Generate a unique base handle
      let baseProfileId = (data.username || email.split("@")[0] || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_.]/g, "");

      if (baseProfileId.length < 3) {
        baseProfileId = "user_" + baseProfileId;
      }

      let profileId = baseProfileId;
      let counter = 1;

      // Resolve database level handle conflicts reactively
      while (true) {
        const existing = await prisma.userProfile.findUnique({
          where: { profileId },
        });
        if (!existing) {
          break;
        }
        profileId = `${baseProfileId}${counter}`;
        counter++;
      }

      // Create new user profile row
      const profile = await prisma.userProfile.create({
        data: {
          clerkUserId,
          profileId,
          displayName,
          bio: "Welcome to my KeetCode profile!",
          problemsSolved: 0,
          followersCount: 0,
        },
      });

      return NextResponse.json({ success: true, profile }, { status: 201 });
    } catch (err: any) {
      console.error("Error creating user profile in database:", err);
      return NextResponse.json({ message: "Database insertion failed", error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Received and ignored non-user-creation event" }, { status: 200 });
}
