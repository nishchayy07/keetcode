#include <iostream>
#include <vector>
#include <utility>

using namespace std;

##USER_CODE_HERE##

int main() {
    int n, m;
    std::cin >> n >> m;
    std::vector<std::pair<int,int>> edges(m);
    for (int i = 0; i < m; i++) std::cin >> edges[i].first >> edges[i].second;
    int src, dst; std::cin >> src >> dst;
    std::cout << (Solution().solve(n, edges, src, dst) ? "true" : "false") << std::endl;
    return 0;
}
