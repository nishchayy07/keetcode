package main
import "fmt"

##USER_CODE_HERE##

func main() {
    var num1, num2 int
    if _, err := fmt.Scan(&num1, &num2); err == nil {
        fmt.Println(solve(num1, num2))
    }
}
