from collections import deque

def validPath(n, edges, source, destination):
    if source == destination:
        return True
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    visited = set([source])
    q = deque([source])
    while q:
        cur = q.popleft()
        if cur == destination:
            return True
        for nb in adj[cur]:
            if nb not in visited:
                visited.add(nb)
                q.append(nb)
    return False
