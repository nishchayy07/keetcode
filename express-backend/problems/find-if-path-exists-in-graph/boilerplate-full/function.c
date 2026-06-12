#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int parent[200005];

int find(int x) {
    if (parent[x] != x) parent[x] = find(parent[x]);
    return parent[x];
}

##USER_CODE_HERE##

int main() {
    int n, m;
    if (scanf("%d %d", &n, &m) != 2) return 0;
    int (*edges)[2] = (int (*)[2])malloc(m * sizeof(int[2]));
    for (int i = 0; i < m; i++) scanf("%d %d", &edges[i][0], &edges[i][1]);
    int src, dst; scanf("%d %d", &src, &dst);
    printf("%s\n", solve(n, m, edges, src, dst) ? "true" : "false");
    free(edges);
    return 0;
}
