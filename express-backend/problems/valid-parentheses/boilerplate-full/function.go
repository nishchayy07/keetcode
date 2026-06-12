package main

import (
    "fmt"
    "strings"
)

##USER_CODE_HERE##

func main() {
    var s string
    fmt.Scan(&s)
    s = strings.TrimSpace(s)
    if solve(s) {
        fmt.Println("true")
    } else {
        fmt.Println("false")
    }
}
