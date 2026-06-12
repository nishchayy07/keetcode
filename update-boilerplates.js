const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.resolve(__dirname, 'express-backend', 'problems');

// Definitions of types and signatures for all 9 problems
const PROBLEM_SIGNATURES = {
  "two-sum": {
    origName: "sum",
    c: { ret: "int", params: "int num1, int num2" },
    cpp: { ret: "int", params: "int num1, int num2" },
    java: { ret: "int", params: "int num1, int num2" },
    py: { ret: "int", params: "self, num1: int, num2: int", pyRet: "int" },
    go: { ret: "int", params: "num1 int, num2 int" }
  },
  "max-element": {
    origName: "maxElement",
    c: { ret: "int", params: "int* arr, int arrSize" },
    cpp: { ret: "int", params: "vector<int> arr" },
    java: { ret: "int", params: "List<Integer> arr" },
    py: { ret: "int", params: "self, arr: List[int]", pyRet: "int" },
    go: { ret: "int", params: "arr []int" }
  },
  "classroom": {
    origName: "classroom",
    c: { ret: "int", params: "int* arr, int arrSize" },
    cpp: { ret: "int", params: "vector<int> arr" },
    java: { ret: "int", params: "List<Integer> arr" },
    py: { ret: "int", params: "self, arr: List[int]", pyRet: "int" },
    go: { ret: "int", params: "arr []int" }
  },
  "reverse-linked-list": {
    origName: "reverseList",
    c: { ret: "ListNode*", params: "ListNode* head", prefix: "// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode(int x) : val(x), next(nullptr) {}\n// };\n\n" },
    cpp: { ret: "ListNode*", params: "ListNode* head", prefix: "// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode(int x) : val(x), next(nullptr) {}\n// };\n\n" },
    java: { ret: "ListNode", params: "ListNode head", prefix: "/*\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode(int x) { val = x; }\n * }\n */\n\n" },
    py: { ret: "Optional[ListNode]", params: "self, head: Optional[ListNode]", pyRet: "Optional[ListNode]", prefix: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\n" },
    go: { ret: "*ListNode", params: "head *ListNode", prefix: "// Definition for singly-linked list.\n// type ListNode struct {\n//     Val int\n//     Next *ListNode\n// }\n\n" }
  },
  "maximum-depth-of-binary-tree": {
    origName: "maxDepth",
    c: { ret: "int", params: "TreeNode* root", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    cpp: { ret: "int", params: "TreeNode* root", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    java: { ret: "int", params: "TreeNode root", prefix: "/*\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode(int x) { val = x; }\n * }\n */\n\n" },
    py: { ret: "int", params: "self, root: Optional[TreeNode]", pyRet: "int", prefix: "# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n" },
    go: { ret: "int", params: "root *TreeNode", prefix: "// Definition for a binary tree node.\n// type TreeNode struct {\n//     Val int\n//     Left *TreeNode\n//     Right *TreeNode\n// }\n\n" }
  },
  "search-in-a-binary-search-tree": {
    origName: "searchBST",
    c: { ret: "TreeNode*", params: "TreeNode* root, int val", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    cpp: { ret: "TreeNode*", params: "TreeNode* root, int val", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    java: { ret: "TreeNode", params: "TreeNode root, int val", prefix: "/*\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode(int x) { val = x; }\n * }\n */\n\n" },
    py: { ret: "Optional[TreeNode]", params: "self, root: Optional[TreeNode], val: int", pyRet: "Optional[TreeNode]", prefix: "# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n" },
    go: { ret: "*TreeNode", params: "root *TreeNode, val int", prefix: "// Definition for a binary tree node.\n// type TreeNode struct {\n//     Val int\n//     Left *TreeNode\n//     Right *TreeNode\n// }\n\n" }
  },
  "find-if-path-exists-in-graph": {
    origName: "validPath",
    c: { ret: "bool", params: "int n, int** edges, int edgesSize, int* edgesColSize, int source, int destination" },
    cpp: { ret: "bool", params: "int n, vector<vector<int>>& edges, int source, int destination" },
    java: { ret: "boolean", params: "int n, int[][] edges, int source, int destination" },
    py: { ret: "bool", params: "self, n: int, edges: List[List[int]], source: int, destination: int", pyRet: "bool" },
    go: { ret: "bool", params: "n int, edges [][]int, source int, destination int" }
  },
  "valid-parentheses": {
    origName: "isValid",
    c: { ret: "bool", params: "char* s" },
    cpp: { ret: "bool", params: "string s" },
    java: { ret: "boolean", params: "String s" },
    py: { ret: "bool", params: "self, s: str", pyRet: "bool" },
    go: { ret: "bool", params: "s string" }
  },
  "climbing-stairs": {
    origName: "climbStairs",
    c: { ret: "int", params: "int n" },
    cpp: { ret: "int", params: "int n" },
    java: { ret: "int", params: "int n" },
    py: { ret: "int", params: "self, n: int", pyRet: "int" },
    go: { ret: "int", params: "n int" }
  }
};

const LANGUAGES = [
  { key: 'cpp',    ext: 'cpp' },
  { key: 'c',      ext: 'c' },
  { key: 'java',   ext: 'java' },
  { key: 'py',     ext: 'py' },
  { key: 'go',     ext: 'go' }
];

function generateUserBoilerplate(slug, langKey) {
  const sig = PROBLEM_SIGNATURES[slug][langKey];
  const prefix = sig.prefix || "";

  switch (langKey) {
    case 'cpp':
      return `${prefix}#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    ${sig.ret} solve(${sig.params}) {\n        \n    }\n};\n`;
    case 'java':
      return `${prefix}import java.util.*;\n\nclass Solution {\n    public ${sig.ret} solve(${sig.params}) {\n        \n    }\n}\n`;
    case 'py':
      return `${prefix}class Solution:\n    def solve(${sig.params}) -> ${sig.pyRet}:\n        pass\n`;
    case 'go':
      return `${prefix}package main\n\nimport (\n    "fmt"\n    "math"\n)\n\nfunc solve(${sig.params}) ${sig.ret} {\n    \n}\n`;
    case 'c':
      return `${prefix}#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n${sig.ret} solve(${sig.params}) {\n    \n}\n`;
  }
}

function updateProblemFiles(slug) {
  const prob = PROBLEM_SIGNATURES[slug];
  if (!prob) return;

  const problemDir = path.join(PROBLEMS_DIR, slug);
  if (!fs.existsSync(problemDir)) {
    console.warn(`Warning: Problem directory does not exist: ${problemDir}`);
    return;
  }

  // 1. Update boilerplate folder
  const bpDir = path.join(problemDir, 'boilerplate');
  if (!fs.existsSync(bpDir)) fs.mkdirSync(bpDir, { recursive: true });

  LANGUAGES.forEach(lang => {
    const code = generateUserBoilerplate(slug, lang.key);
    const file = path.join(bpDir, `function.${lang.ext}`);
    fs.writeFileSync(file, code, 'utf-8');
    console.log(`  Updated user boilerplate: ${slug}/boilerplate/function.${lang.ext}`);
  });

  // 2. Update boilerplate-full folder (runner stubs)
  const bpfDir = path.join(problemDir, 'boilerplate-full');
  if (fs.existsSync(bpfDir)) {
    LANGUAGES.forEach(lang => {
      const file = path.join(bpfDir, `function.${lang.ext}`);
      if (fs.existsSync(file)) {
        let runner = fs.readFileSync(file, 'utf-8');
        
        // C++ replacements
        if (lang.key === 'cpp') {
          // Replace ORIGINAL_NAME( with Solution().solve(
          const regex = new RegExp(`\\b${prob.origName}\\(`, 'g');
          runner = runner.replace(regex, `Solution().solve(`);
        }
        // Java replacements
        else if (lang.key === 'java') {
          // Replace Solution.ORIGINAL_NAME( with new Solution().solve(
          const regex = new RegExp(`\\bSolution\\.${prob.origName}\\(`, 'g');
          runner = runner.replace(regex, `new Solution().solve(`);
        }
        // Python replacements
        else if (lang.key === 'python') {
          // Replace ORIGINAL_NAME( with Solution().solve(
          const regex = new RegExp(`\\b${prob.origName}\\(`, 'g');
          runner = runner.replace(regex, `Solution().solve(`);
        }
        // Go / C replacements
        else if (lang.key === 'go' || lang.key === 'c') {
          // Replace ORIGINAL_NAME( with solve(
          const regex = new RegExp(`\\b${prob.origName}\\(`, 'g');
          runner = runner.replace(regex, `solve(`);
        }

        fs.writeFileSync(file, runner, 'utf-8');
        console.log(`  Updated runner harness: ${slug}/boilerplate-full/function.${lang.ext}`);
      }
    });
  }
}

console.log("Starting boilerplate and harness updates...");
Object.keys(PROBLEM_SIGNATURES).forEach(slug => {
  console.log(`Processing ${slug}...`);
  updateProblemFiles(slug);
});
console.log("Boilerplate update complete!");
