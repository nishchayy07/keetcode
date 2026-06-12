import prismaClient from "./src/db";

async function main() {
  const submissions = await prismaClient.submission.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { testcases: true },
  });

  console.log("Submissions:");
  for (const s of submissions) {
    console.log(`ID: ${s.id}, Status: ${s.status}, Created: ${s.createdAt}`);
    console.log(`Testcases:`);
    for (const tc of s.testcases) {
      console.log(`  TC Index: ${tc.index}, Status: ${tc.status}, Token: ${tc.judge0TrackingId}, Time: ${tc.time}, Memory: ${tc.memory}`);
    }
    console.log("-------------------");
  }
}

main().catch(console.error);
