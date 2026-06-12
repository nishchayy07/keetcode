package main

import "fmt"

type TreeNode struct {
    Val   int
    Left  *TreeNode
    Right *TreeNode
}

##USER_CODE_HERE##

func main() {
    var size int
    fmt.Scan(&size)
    if size == 0 {
        fmt.Println(0)
        return
    }
    vals := make([]int, size)
    for i := 0; i < size; i++ {
        fmt.Scan(&vals[i])
    }
    nodes := make([]*TreeNode, size)
    for i, v := range vals {
        if v != -1 {
            nodes[i] = &TreeNode{Val: v}
        }
    }
    for i := 0; i < size; i++ {
        if nodes[i] == nil { continue }
        if 2*i+1 < size { nodes[i].Left = nodes[2*i+1] }
        if 2*i+2 < size { nodes[i].Right = nodes[2*i+2] }
    }
    fmt.Println(solve(nodes[0]))
}
