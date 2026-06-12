import java.util.*;
import java.io.*;

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int size_arr = sc.nextInt();
            List<Integer> arr = new ArrayList<>();
            for (int i = 0; i < size_arr; ++i) {
                arr.add(sc.nextInt());
            }
            System.out.println(new Solution().solve(arr));
        }
    }
}
