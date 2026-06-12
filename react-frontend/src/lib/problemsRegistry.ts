import { Example } from "../types/problem";

export interface RegistryProblem {
  slug: string;
  examples: Example[];
  constraints: string[];
  boilerplates: Record<string, string>;
}

// Problem signatures containing parameters, return types, and definitions
export const PROBLEM_SIGNATURES: Record<string, {
  cpp: { ret: string; params: string; prefix?: string };
  c: { ret: string; params: string; prefix?: string };
  java: { ret: string; params: string; prefix?: string };
  python: { ret: string; params: string; prefix?: string };
  go: { ret: string; params: string; prefix?: string };
}> = {
  "two-sum": {
    c: { ret: "int", params: "int num1, int num2" },
    cpp: { ret: "int", params: "int num1, int num2" },
    java: { ret: "int", params: "int num1, int num2" },
    python: { ret: "int", params: "self, num1: int, num2: int" },
    go: { ret: "int", params: "num1 int, num2 int" }
  },
  "max-element": {
    c: { ret: "int", params: "int* arr, int arrSize" },
    cpp: { ret: "int", params: "vector<int> arr" },
    java: { ret: "int", params: "List<Integer> arr" },
    python: { ret: "int", params: "self, arr: List[int]" },
    go: { ret: "int", params: "arr []int" }
  },
  "reverse-linked-list": {
    c: { ret: "ListNode*", params: "ListNode* head", prefix: "// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode(int x) : val(x), next(nullptr) {}\n// };\n\n" },
    cpp: { ret: "ListNode*", params: "ListNode* head", prefix: "// Definition for singly-linked list.\n// struct ListNode {\n//     int val;\n//     ListNode *next;\n//     ListNode(int x) : val(x), next(nullptr) {}\n// };\n\n" },
    java: { ret: "ListNode", params: "ListNode head", prefix: "/*\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode(int x) { val = x; }\n * }\n */\n\n" },
    python: { ret: "Optional[ListNode]", params: "self, head: Optional[ListNode]", prefix: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\n" },
    go: { ret: "*ListNode", params: "head *ListNode", prefix: "// Definition for singly-linked list.\n// type ListNode struct {\n//     Val int\n//     Next *ListNode\n// }\n\n" }
  },
  "maximum-depth-of-binary-tree": {
    c: { ret: "int", params: "TreeNode* root", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    cpp: { ret: "int", params: "TreeNode* root", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    java: { ret: "int", params: "TreeNode root", prefix: "/*\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode(int x) { val = x; }\n * }\n */\n\n" },
    python: { ret: "int", params: "self, root: Optional[TreeNode]", prefix: "# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n" },
    go: { ret: "int", params: "root *TreeNode", prefix: "// Definition for a binary tree node.\n// type TreeNode struct {\n//     Val int\n//     Left *TreeNode\n//     Right *TreeNode\n// }\n\n" }
  },
  "search-in-a-binary-search-tree": {
    c: { ret: "TreeNode*", params: "TreeNode* root, int val", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    cpp: { ret: "TreeNode*", params: "TreeNode* root, int val", prefix: "// Definition for a binary tree node.\n// struct TreeNode {\n//     int val;\n//     TreeNode *left;\n//     TreeNode *right;\n//     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n// };\n\n" },
    java: { ret: "TreeNode", params: "TreeNode root, int val", prefix: "/*\n * Definition for a binary tree node.\n * public class TreeNode {\n *     int val;\n *     TreeNode left;\n *     TreeNode right;\n *     TreeNode(int x) { val = x; }\n * }\n */\n\n" },
    python: { ret: "Optional[TreeNode]", params: "self, root: Optional[TreeNode], val: int", prefix: "# Definition for a binary tree node.\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n\n" },
    go: { ret: "*TreeNode", params: "root *TreeNode, val int", prefix: "// Definition for a binary tree node.\n// type TreeNode struct {\n//     Val int\n//     Left *TreeNode\n//     Right *TreeNode\n// }\n\n" }
  },
  "find-if-path-exists-in-graph": {
    c: { ret: "bool", params: "int n, int** edges, int edgesSize, int* edgesColSize, int source, int destination" },
    cpp: { ret: "bool", params: "int n, vector<vector<int>>& edges, int source, int destination" },
    java: { ret: "boolean", params: "int n, int[][] edges, int source, int destination" },
    python: { ret: "bool", params: "self, n: int, edges: List[List[int]], source: int, destination: int" },
    go: { ret: "bool", params: "n int, edges [][]int, source int, destination int" }
  },
  "valid-parentheses": {
    c: { ret: "bool", params: "char* s" },
    cpp: { ret: "bool", params: "string s" },
    java: { ret: "boolean", params: "String s" },
    python: { ret: "bool", params: "self, s: str" },
    go: { ret: "bool", params: "s string" }
  },
  "climbing-stairs": {
    c: { ret: "int", params: "int n" },
    cpp: { ret: "int", params: "int n" },
    java: { ret: "int", params: "int n" },
    python: { ret: "int", params: "self, n: int" },
    go: { ret: "int", params: "n int" }
  }
};

// Utility function to dynamically generate these exact boilerplates per Task 2
export function getStandardBoilerplate(slug: string, langKey: string): string {
  const prob = PROBLEM_SIGNATURES[slug];
  if (!prob) return "";
  const sig = prob[langKey as keyof typeof prob];
  if (!sig) return "";

  const prefix = sig.prefix || "";

  switch (langKey) {
    case 'cpp':
      return `${prefix}#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    // Adjust return type and parameters per problem\n    ${sig.ret} solve(${sig.params}) {\n        \n    }\n};`;
    case 'java':
      return `${prefix}import java.util.*;\n\nclass Solution {\n    // Adjust return type and parameters per problem\n    public ${sig.ret} solve(${sig.params}) {\n        \n    }\n}`;
    case 'python':
      return `${prefix}class Solution:\n    # Adjust return type and parameters per problem\n    def solve(${sig.params}) -> ${sig.ret}:\n        pass`;
    case 'go':
      return `${prefix}package main\n\nimport (\n    "fmt"\n    "math"\n)\n\n// Adjust return type and parameters per problem\nfunc solve(${sig.params}) ${sig.ret} {\n    \n}`;
    case 'c':
      return `${prefix}#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <stdbool.h>\n\n// Adjust return type and parameters per problem\n${sig.ret} solve(${sig.params}) {\n    \n}`;
    default:
      return "";
  }
}

// Generate the registry map with populated standard boilerplates
const BASE_REGISTRY: Record<string, Omit<RegistryProblem, "boilerplates">> = {
  "two-sum": {
    slug: "two-sum",
    examples: [
      { input: "1\n2", output: "3", explanation: "1 + 2 = 3" },
      { input: "100\n100", output: "200", explanation: "100 + 100 = 200" }
    ],
    constraints: [
      "`0 <= num1 <= 10^5`",
      "`0 <= num2 <= 10^5`"
    ]
  },
  "max-element": {
    slug: "max-element",
    examples: [
      { input: "5\n1 2 3 4 5", output: "5", explanation: "The maximum element is 5." },
      { input: "6\n-10 5 20 15 0 8", output: "20", explanation: "The maximum element is 20." }
    ],
    constraints: [
      "`1 <= arr.length <= 10^5`",
      "`-10^9 <= arr[i] <= 10^9`"
    ]
  },
  "reverse-linked-list": {
    slug: "reverse-linked-list",
    examples: [
      { input: "5\n1 2 3 4 5", output: "5 4 3 2 1", explanation: "The list 1→2→3→4→5 becomes 5→4→3→2→1." },
      { input: "3\n1 2 3", output: "3 2 1", explanation: "The list 1→2→3 becomes 3→2→1." }
    ],
    constraints: [
      "`0 <= n <= 5000` (number of nodes)",
      "`-5000 <= Node.val <= 5000`"
    ]
  },
  "maximum-depth-of-binary-tree": {
    slug: "maximum-depth-of-binary-tree",
    examples: [
      { input: "7\n3 9 20 -1 -1 15 7", output: "3", explanation: "The tree has depth 3: root(3) → children(9,20) → grandchildren(15,7)." },
      { input: "1\n1", output: "1", explanation: "A single-node tree has depth 1." }
    ],
    constraints: [
      "`0 <= n <= 10^4` (number of nodes)",
      "`-100 <= Node.val <= 100`"
    ]
  },
  "search-in-a-binary-search-tree": {
    slug: "search-in-a-binary-search-tree",
    examples: [
      { input: "7\n4 2 7 1 3 -1 -1\n2", output: "2 1 3", explanation: "Returns the subtree rooted at node 2, which contains 2, 1, 3." }
    ],
    constraints: [
      "`1 <= n <= 5000` (number of nodes)",
      "`1 <= Node.val <= 10^7`"
    ]
  },
  "find-if-path-exists-in-graph": {
    slug: "find-if-path-exists-in-graph",
    examples: [
      { input: "3 2\n0 1\n1 2\n0 2", output: "true", explanation: "A path 0→1→2 exists." }
    ],
    constraints: [
      "`1 <= n <= 2×10^5`",
      "`0 <= m <= 2×10^5`"
    ]
  },
  "valid-parentheses": {
    slug: "valid-parentheses",
    examples: [
      { input: "()", output: "true", explanation: "A single matched pair is valid." }
    ],
    constraints: [
      "`1 <= s.length <= 10^4`"
    ]
  },
  "climbing-stairs": {
    slug: "climbing-stairs",
    examples: [
      { input: "2", output: "2", explanation: "Two ways: {1,1} and {2}." }
    ],
    constraints: [
      "`1 <= n <= 45`"
    ]
  }
};

export const PROBLEMS_REGISTRY: Record<string, RegistryProblem> = {};

Object.entries(BASE_REGISTRY).forEach(([key, val]) => {
  const boilerplates: Record<string, string> = {};
  ['cpp', 'c', 'java', 'python', 'go'].forEach(lang => {
    boilerplates[lang] = getStandardBoilerplate(key, lang);
  });

  PROBLEMS_REGISTRY[key] = {
    ...val,
    boilerplates
  };
});
