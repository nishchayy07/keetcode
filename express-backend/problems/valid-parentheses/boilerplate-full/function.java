import java.util.*;
import java.io.*;

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = sc.next();
        System.out.println(new Solution().isValid(s) ? "true" : "false");
    }
}
