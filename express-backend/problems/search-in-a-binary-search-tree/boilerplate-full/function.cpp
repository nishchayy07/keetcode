#include <iostream>
#include <vector>
#include <queue>

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

##USER_CODE_HERE##

void printLevelOrder(TreeNode* root) {
    if (!root) { std::cout << -1 << std::endl; return; }
    std::queue<TreeNode*> q;
    q.push(root);
    bool first = true;
    while (!q.empty()) {
        TreeNode* cur = q.front(); q.pop();
        if (!first) std::cout << " ";
        std::cout << cur->val;
        first = false;
        if (cur->left) q.push(cur->left);
        if (cur->right) q.push(cur->right);
    }
    std::cout << std::endl;
}

int main() {
    int size;
    std::cin >> size;
    if (size == 0) { std::cout << -1 << std::endl; return 0; }
    std::vector<int> vals(size);
    for (int i = 0; i < size; i++) std::cin >> vals[i];
    std::vector<TreeNode*> nodes(size, nullptr);
    for (int i = 0; i < size; i++)
        if (vals[i] != -1) nodes[i] = new TreeNode(vals[i]);
    for (int i = 0; i < size; i++) {
        if (!nodes[i]) continue;
        if (2*i+1 < size) nodes[i]->left = nodes[2*i+1];
        if (2*i+2 < size) nodes[i]->right = nodes[2*i+2];
    }
    int target; std::cin >> target;
    TreeNode* result = Solution().solve(nodes[0], target);
    printLevelOrder(result);
    return 0;
}
