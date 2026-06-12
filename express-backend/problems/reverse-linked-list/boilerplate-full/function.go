package main

import "fmt"

type ListNode struct {
    Val  int
    Next *ListNode
}

##USER_CODE_HERE##

func main() {
    var size int
    fmt.Scan(&size)
    var head, tail *ListNode
    for i := 0; i < size; i++ {
        var v int
        fmt.Scan(&v)
        node := &ListNode{Val: v}
        if head == nil {
            head = node
            tail = node
        } else {
            tail.Next = node
            tail = node
        }
    }
    result := solve(head)
    first := true
    for result != nil {
        if !first {
            fmt.Print(" ")
        }
        fmt.Print(result.Val)
        first = false
        result = result.Next
    }
    fmt.Println()
}
