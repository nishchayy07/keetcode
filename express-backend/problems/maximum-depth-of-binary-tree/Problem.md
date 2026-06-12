## Maximum Depth of Binary Tree

Given the root of a binary tree, return its maximum depth.

A binary tree's **maximum depth** is the number of nodes along the longest path from the root node down to the farthest leaf node.

The tree is given in level-order (BFS) format. Null nodes are represented by `-1`.

#### Example 1

Input

```
3
3 9 20 -1 -1 15 7
```

Output

```
3
```

Explanation: The tree has 3 levels: root (3), children (9, 20), grandchildren (15, 7).

#### Example 2

Input

```
1
1
```

Output

```
1
```

#### Example 3

Input

```
5
1 2 3 4 5 -1 -1
```

Output

```
3
```

#### Constraints

- The number of nodes in the tree is in the range `[0, 10^4]`.
- `-100 <= Node.val <= 100`
