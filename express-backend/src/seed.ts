import prisma from "./db";
import { LANGUAGE_MAPPING } from "./language";

async function main() {
  console.log("Seeding database...");

  // 1. Seed Languages
  for (const lang of Object.values(LANGUAGE_MAPPING)) {
    await prisma.language.upsert({
      where: { id: lang.internal },
      update: {
        name: lang.name,
        judge0Id: lang.judge0,
      },
      create: {
        id: lang.internal,
        name: lang.name,
        judge0Id: lang.judge0,
      },
    });
  }
  console.log("Languages seeded.");

  // 1.5 Seed Mock User
  await prisma.user.upsert({
    where: { id: "user-id-123" },
    update: {},
    create: {
      id: "user-id-123",
      email: "test@example.com",
      name: "Test User",
      password: "password123", // In a real app, this would be hashed
      role: "USER",
    },
  });
  console.log("Mock user seeded.");

  // 2. Seed Problems
  const problem1 = await prisma.problem.upsert({
    where: { slug: "two-sum" },
    update: {},
    create: {
      title: "Two Sum",
      description: "Find the sum of two given elements. Both the numbers will always be 0 or positive.",
      slug: "two-sum",
      difficulty: "EASY",
      hidden: false,
    },
  });

  const problem2 = await prisma.problem.upsert({
    where: { slug: "max-element" },
    update: {},
    create: {
      title: "Max Element",
      description: "Find the maximum element in a given array.",
      slug: "max-element",
      difficulty: "MEDIUM",
      hidden: false,
    },
  });
  console.log("Problems seeded.");

  // 3. Seed Default Code for Two Sum
  const twoSumBoilerplates = [
    { langId: LANGUAGE_MAPPING.js.internal, code: `function sum(a, b) {\n  // Write your code here\n  return a + b;\n}` },
    { langId: LANGUAGE_MAPPING.cpp.internal, code: `int sum(int num1, int num2) {\n    // Implementation goes here\n    return 0;\n}` },
    { langId: LANGUAGE_MAPPING.rs.internal, code: `fn sum(num1: i32, num2: i32) -> i32 {\n    // Implementation goes here\n    0\n}` }
  ];

  for (const bp of twoSumBoilerplates) {
    await prisma.defaultCode.upsert({
      where: {
        problemId_languageId: {
          problemId: problem1.id,
          languageId: bp.langId,
        },
      },
      update: { code: bp.code },
      create: {
        problemId: problem1.id,
        languageId: bp.langId,
        code: bp.code,
      },
    });
  }

  // Seed Default Code for Max Element
  const maxElementBoilerplates = [
    { langId: LANGUAGE_MAPPING.js.internal, code: `function maxElement(arr) {\n  // Write your code here\n  return Math.max(...arr);\n}` },
    { langId: LANGUAGE_MAPPING.cpp.internal, code: `int maxElement(std::vector<int> arr) {\n    // Implementation goes here\n    return 0;\n}` },
    { langId: LANGUAGE_MAPPING.rs.internal, code: `fn max_element(arr: Vec<i32>) -> i32 {\n    // Implementation goes here\n    0\n}` }
  ];

  for (const bp of maxElementBoilerplates) {
    await prisma.defaultCode.upsert({
      where: {
        problemId_languageId: {
          problemId: problem2.id,
          languageId: bp.langId,
        },
      },
      update: { code: bp.code },
      create: {
        problemId: problem2.id,
        languageId: bp.langId,
        code: bp.code,
      },
    });
  }
  console.log("Default codes seeded.");


  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
