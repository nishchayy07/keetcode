#include <stdio.h>
#include <stdlib.h>

struct ListNode {
    int val;
    struct ListNode* next;
};

##USER_CODE_HERE##

int main() {
    int size;
    if (scanf("%d", &size) != 1) return 0;
    struct ListNode* head = NULL;
    struct ListNode* tail = NULL;
    for (int i = 0; i < size; i++) {
        int v;
        scanf("%d", &v);
        struct ListNode* node = (struct ListNode*)malloc(sizeof(struct ListNode));
        node->val = v;
        node->next = NULL;
        if (!head) head = node;
        else tail->next = node;
        tail = node;
    }
    struct ListNode* result = solve(head);
    int first = 1;
    while (result) {
        if (!first) printf(" ");
        printf("%d", result->val);
        first = 0;
        result = result->next;
    }
    printf("\n");
    return 0;
}
