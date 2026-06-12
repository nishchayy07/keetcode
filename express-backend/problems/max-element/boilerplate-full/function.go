package main
import "fmt"

##USER_CODE_HERE##

func main() {
    var size_arr int
    if _, err := fmt.Scan(&size_arr); err == nil {
        arr := make([]int, size_arr)
        for i := 0; i < size_arr; i++ {
            fmt.Scan(&arr[i])
        }
        fmt.Println(solve(arr))
    }
}
