import sys
from collections import deque

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

##USER_CODE_HERE##

if __name__ == "__main__":
    data = sys.stdin.read().split()
    idx = 0
    size = int(data[idx]); idx += 1
    if size == 0:
        print(-1)
    else:
        vals = [int(data[idx+i]) for i in range(size)]; idx += size
        nodes = [TreeNode(v) if v != -1 else None for v in vals]
        for i in range(size):
            if nodes[i] is None: continue
            l, r = 2*i+1, 2*i+2
            if l < size: nodes[i].left = nodes[l]
            if r < size: nodes[i].right = nodes[r]
        target = int(data[idx])
        result = searchBST(nodes[0], target)
        if result is None:
            print(-1)
        else:
            q = deque([result])
            out = []
            while q:
                cur = q.popleft()
                out.append(str(cur.val))
                if cur.left: q.append(cur.left)
                if cur.right: q.append(cur.right)
            print(" ".join(out))
