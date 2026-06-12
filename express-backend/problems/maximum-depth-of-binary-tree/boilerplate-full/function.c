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

int main() {
    int size;
    if (scanf("%d", &size) != 1 || size == 0) { printf("0\n"); return 0; }
    struct TreeNode** nodes = (struct TreeNode**)calloc(size, sizeof(struct TreeNode*));
    for (int i = 0; i < size; i++) {
        int v; scanf("%d", &v);
        if (v != -1) nodes[i] = newNode(v);
    }
    for (int i = 0; i < size; i++) {
        if (!nodes[i]) continue;
        int l = 2*i+1, r = 2*i+2;
        if (l < size) nodes[i]->left = nodes[l];
        if (r < size) nodes[i]->right = nodes[r];
    }
    printf("%d\n", solve(nodes[0]));
    free(nodes);
    return 0;
}
