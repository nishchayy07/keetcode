#include <stdio.h>
#include <stdlib.h>

struct TreeNode {
    int val;
    struct TreeNode* left;
    struct TreeNode* right;
};

##USER_CODE_HERE##

struct TreeNode* newNode(int val) {
    struct TreeNode* n = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    n->val = val; n->left = n->right = NULL;
    return n;
}

void printLevelOrder(struct TreeNode* root) {
    if (!root) { printf("-1\n"); return; }
    struct TreeNode* q[10001];
    int front = 0, back = 0;
    q[back++] = root;
    int first = 1;
    while (front < back) {
        struct TreeNode* cur = q[front++];
        if (!first) printf(" ");
        printf("%d", cur->val);
        first = 0;
        if (cur->left) q[back++] = cur->left;
        if (cur->right) q[back++] = cur->right;
    }
    printf("\n");
}

int main() {
    int size;
    if (scanf("%d", &size) != 1 || size == 0) { printf("-1\n"); return 0; }
    struct TreeNode** nodes = (struct TreeNode**)calloc(size, sizeof(struct TreeNode*));
    for (int i = 0; i < size; i++) {
        int v; scanf("%d", &v);
        if (v != -1) nodes[i] = newNode(v);
    }
    for (int i = 0; i < size; i++) {
        if (!nodes[i]) continue;
        if (2*i+1 < size) nodes[i]->left = nodes[2*i+1];
        if (2*i+2 < size) nodes[i]->right = nodes[2*i+2];
    }
    int target; scanf("%d", &target);
    struct TreeNode* result = solve(nodes[0], target);
    printLevelOrder(result);
    free(nodes);
    return 0;
}
