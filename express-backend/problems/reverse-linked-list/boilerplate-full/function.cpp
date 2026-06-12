#include <iostream>
#include <vector>
#include <sstream>

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

##USER_CODE_HERE##

int main() {
    int size;
    std::cin >> size;
    ListNode* head = nullptr;
    ListNode* tail = nullptr;
    for (int i = 0; i < size; i++) {
        int v;
        std::cin >> v;
        ListNode* node = new ListNode(v);
        if (!head) head = node;
        else tail->next = node;
        tail = node;
    }
    ListNode* result = Solution().solve(head);
    bool first = true;
    while (result) {
        if (!first) std::cout << " ";
        std::cout << result->val;
        first = false;
        result = result->next;
    }
    std::cout << std::endl;
    return 0;
}
