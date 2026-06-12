#include <stdio.h>

##USER_CODE_HERE##

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        printf("%d\n", solve(n));
    }
    return 0;
}
