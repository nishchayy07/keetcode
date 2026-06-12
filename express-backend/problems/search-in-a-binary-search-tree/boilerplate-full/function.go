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
        fmt.Println(-1)
        return
    }
    vals := make([]int, size)
    for i := 0; i < size; i++ { fmt.Scan(&vals[i]) }
    nodes := make([]*TreeNode, size)
    for i, v := range vals {
        if v != -1 { nodes[i] = &TreeNode{Val: v} }
    }
    for i := 0; i < size; i++ {
        if nodes[i] == nil { continue }
        if 2*i+1 < size { nodes[i].Left = nodes[2*i+1] }
        if 2*i+2 < size { nodes[i].Right = nodes[2*i+2] }
    }
    var target int
    fmt.Scan(&target)
    result := solve(nodes[0], target)
    if result == nil { fmt.Println(-1); return }
    q := []*TreeNode{result}
    first := true
    for len(q) > 0 {
        cur := q[0]; q = q[1:]
        if !first { fmt.Print(" ") }
        fmt.Print(cur.Val)
        first = false
        if cur.Left != nil { q = append(q, cur.Left) }
        if cur.Right != nil { q = append(q, cur.Right) }
    }
    fmt.Println()
}
