package main

import "fmt"

##USER_CODE_HERE##

func main() {
    var n, m int
    fmt.Scan(&n, &m)
    edges := make([][2]int, m)
    for i := 0; i < m; i++ {
        fmt.Scan(&edges[i][0], &edges[i][1])
    }
    var src, dst int
    fmt.Scan(&src, &dst)
    if solve(n, edges, src, dst) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}
