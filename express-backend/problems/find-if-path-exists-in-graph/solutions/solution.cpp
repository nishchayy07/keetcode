#include <iostream>
#include <vector>
#include <utility>
#include <queue>
using namespace std;

bool validPath(int n, vector<pair<int,int>>& edges, int source, int destination) {
    vector<vector<int>> adj(n);
    for (auto& e : edges) {
        adj[e.first].push_back(e.second);
        adj[e.second].push_back(e.first);
    }
    vector<bool> visited(n, false);
    queue<int> q;
    q.push(source);
    visited[source] = true;
    while (!q.empty()) {
        int cur = q.front(); q.pop();
        if (cur == destination) return true;
        for (int nb : adj[cur]) {
            if (!visited[nb]) { visited[nb] = true; q.push(nb); }
        }
    }
    return false;
}
