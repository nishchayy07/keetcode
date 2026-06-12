def searchBST(root, val):
    if not root:
        return None
    if root.val == val:
        return root
    elif val < root.val:
        return searchBST(root.left, val)
    else:
        return searchBST(root.right, val)
