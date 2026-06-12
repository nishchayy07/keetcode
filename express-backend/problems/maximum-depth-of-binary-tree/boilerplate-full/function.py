import sys

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

##USER_CODE_HERE##

if __name__ == "__main__":
    data = sys.stdin.read().split()
    size = int(data[0])
    if size == 0:
        print(0)
    else:
        vals = [int(x) for x in data[1:size+1]]
        nodes = [TreeNode(v) if v != -1 else None for v in vals]
        for i in range(size):
            if nodes[i] is None:
                continue
            l, r = 2*i+1, 2*i+2
            if l < size:
                nodes[i].left = nodes[l]
            if r < size:
                nodes[i].right = nodes[r]
        print(maxDepth(nodes[0]))
