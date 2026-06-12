#include <stdio.h>
#include <stdlib.h>

##USER_CODE_HERE##

int main() {
  int size_arr;
  if (scanf("%d", &size_arr) == 1) {
    int* arr = (int*)malloc(size_arr * sizeof(int));
    for (int i = 0; i < size_arr; ++i) {
      if (scanf("%d", &arr[i]) != 1) break;
    }
    int result = solve(arr, size_arr);
    printf("%d\n", result);
    free(arr);
  }
  return 0;
}
