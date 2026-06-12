## Search in a Binary Search Tree

You are given the root of a binary search tree (BST) and an integer `val`.

Find the node in the BST that the node's value equals `val` and return the subtree rooted at that node. If no such node exists, return `null` (represented as `-1` in output).

The tree and target are given as: first line is the number of nodes, second line is the level-order values (use `-1` for null), third line is the target `val`.

#### Example 1

Input

```
7
4 2 7 1 3 -1 -1
2
```

Output

```
2 1 3
```

Explanation: Returns the subtree rooted at node 2, which has values 2, 1, 3.

#### Example 2

Input

```
7
4 2 7 1 3 -1 -1
5
```

Output

```
-1
```

#### Example 3

Input

```
3
5 3 8 -1 -1 -1 -1
3
```

Output

```
3
```

#### Constraints

- The number of nodes in the tree is in the range `[1, 5000]`.
- `1 <= Node.val <= 10^7`
- The tree is a valid BST.
- `1 <= val <= 10^7`
