#include <stdio.h>
#include <stdlib.h>
#include <string.h>

##USER_CODE_HERE##

int main() {
    char s[10005];
    if (scanf("%s", s) == 1) {
        printf("%s\n", solve(s) ? "true" : "false");
    }
    return 0;
}
