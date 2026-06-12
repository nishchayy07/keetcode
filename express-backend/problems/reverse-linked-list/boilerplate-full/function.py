import sys

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

##USER_CODE_HERE##

if __name__ == "__main__":
    lines = sys.stdin.read().split()
    size = int(lines[0])
    head = None
    tail = None
    for i in range(1, size + 1):
        node = ListNode(int(lines[i]))
        if head is None:
            head = node
            tail = node
        else:
            tail.next = node
            tail = node
    result = reverseList(head)
    vals = []
    while result:
        vals.append(str(result.val))
        result = result.next
    print(" ".join(vals))
