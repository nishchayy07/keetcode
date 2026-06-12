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

int main() {
    int size;
    std::cin >> size;
    if (size == 0) { std::cout << 0 << std::endl; return 0; }
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
    std::cout << Solution().solve(nodes[0]) << std::endl;
    return 0;
}
