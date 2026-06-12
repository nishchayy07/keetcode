import sys

##USER_CODE_HERE##

if __name__ == "__main__":
    data = sys.stdin.read().split()
    idx = 0
    n, m = int(data[idx]), int(data[idx+1]); idx += 2
    edges = []
    for _ in range(m):
        u, v = int(data[idx]), int(data[idx+1]); idx += 2
        edges.append([u, v])
    source, destination = int(data[idx]), int(data[idx+1])
    print("true" if validPath(n, edges, source, destination) else "false")
