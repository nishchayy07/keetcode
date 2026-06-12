import fs from "fs";
import path from "path";
import prismaClient from "./src/db";

// Matches LANGUAGE_MAPPING internal IDs in src/language/index.ts
// c=4, cpp=2, java=5, python=6, go=7
const LANGUAGE_CONFIGS = [
  { key: "cpp",    internalId: 2,  ext: "cpp"  },
  { key: "c",      internalId: 4,  ext: "c"    },
  { key: "java",   internalId: 5,  ext: "java" },
  { key: "python", internalId: 6,  ext: "py"   },
  { key: "go",     internalId: 7,  ext: "go"   },
] as const;

const PROBLEMS_DIR = path.resolve(__dirname, "problems");

interface ProblemSeed {
  slug: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

const PROBLEMS_TO_SEED: ProblemSeed[] = [
  { slug: "two-sum",                        title: "Two Sum",                            difficulty: "EASY" },
  { slug: "max-element",                    title: "Max Element",                        difficulty: "MEDIUM" },
  { slug: "classroom",                      title: "Classroom",                          difficulty: "MEDIUM" },
  { slug: "reverse-linked-list",            title: "Reverse Linked List",                difficulty: "EASY" },
  { slug: "maximum-depth-of-binary-tree",   title: "Maximum Depth of Binary Tree",       difficulty: "EASY" },
  { slug: "search-in-a-binary-search-tree", title: "Search in a Binary Search Tree",     difficulty: "EASY" },
  { slug: "find-if-path-exists-in-graph",   title: "Find if Path Exists in Graph",       difficulty: "EASY" },
  { slug: "valid-parentheses",              title: "Valid Parentheses",                  difficulty: "EASY" },
  { slug: "climbing-stairs",                title: "Climbing Stairs",                    difficulty: "EASY" },
];

async function ensureLanguagesExist() {
  const languageData = [
    { id: 2, name: "C++",    judge0Id: 54 },
    { id: 4, name: "C",      judge0Id: 50 },
    { id: 5, name: "Java",   judge0Id: 62 },
    { id: 6, name: "Python", judge0Id: 71 },
    { id: 7, name: "Go",     judge0Id: 60 },
  ];

  for (const lang of languageData) {
    await prismaClient.language.upsert({
      where: { id: lang.id },
      update: {},
      create: { id: lang.id, name: lang.name, judge0Id: lang.judge0Id },
    });
  }
  console.log("✅ Languages ensured in DB");
}

async function seedProblem(problem: ProblemSeed) {
  const problemDir = path.join(PROBLEMS_DIR, problem.slug);

  // Read Problem.md for description
  const descriptionPath = path.join(problemDir, "Problem.md");
  const description = fs.existsSync(descriptionPath)
    ? fs.readFileSync(descriptionPath, "utf-8")
    : "";

  // Upsert the Problem record
  const dbProblem = await prismaClient.problem.upsert({
    where: { slug: problem.slug },
    update: {
      title: problem.title,
      description,
      difficulty: problem.difficulty,
      hidden: false,
    },
    create: {
      title: problem.title,
      description,
      slug: problem.slug,
      difficulty: problem.difficulty,
      hidden: false,
    },
  });

  console.log(`  📝 Problem upserted: ${problem.title} (id: ${dbProblem.id})`);

  // For each language, read boilerplate and upsert DefaultCode
  for (const lang of LANGUAGE_CONFIGS) {
    const boilerplatePath = path.join(
      problemDir,
      "boilerplate",
      `function.${lang.ext}`
    );

    if (!fs.existsSync(boilerplatePath)) {
      console.warn(`    ⚠️  Missing boilerplate for ${lang.key}: ${boilerplatePath}`);
      continue;
    }

    const code = fs.readFileSync(boilerplatePath, "utf-8");

    await prismaClient.defaultCode.upsert({
      where: {
        problemId_languageId: {
          problemId: dbProblem.id,
          languageId: lang.internalId,
        },
      },
      update: { code },
      create: {
        problemId: dbProblem.id,
        languageId: lang.internalId,
        code,
      },
    });

    console.log(`    ✅ DefaultCode set for ${lang.key}`);
  }
}

async function main() {
  console.log("🌱 Starting problem seed...\n");

  await ensureLanguagesExist();
  console.log();

  for (const problem of PROBLEMS_TO_SEED) {
    console.log(`🔧 Seeding: ${problem.slug}`);
    try {
      await seedProblem(problem);
    } catch (err) {
      console.error(`  ❌ Failed to seed ${problem.slug}:`, err);
    }
    console.log();
  }

  console.log("🎉 Seeding complete!");
  await prismaClient.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await prismaClient.$disconnect();
  process.exit(1);
});
