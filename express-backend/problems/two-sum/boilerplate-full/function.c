#include <stdio.h>
#include <stdlib.h>

##USER_CODE_HERE##

int main() {
  int num1, num2;
  if (scanf("%d %d", &num1, &num2) == 2) {
    int result = solve(num1, num2);
    printf("%d\n", result);
  }
  return 0;
}
