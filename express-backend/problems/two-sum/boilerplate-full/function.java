import java.util.*;
import java.io.*;

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int num1 = sc.nextInt();
            int num2 = sc.nextInt();
            System.out.println(new Solution().solve(num1, num2));
        }
    }
}
