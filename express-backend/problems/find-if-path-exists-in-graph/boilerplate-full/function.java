import java.util.*;
import java.io.*;

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), m = sc.nextInt();
        int[][] edges = new int[m][2];
        for (int i = 0; i < m; i++) {
            edges[i][0] = sc.nextInt();
            edges[i][1] = sc.nextInt();
        }
        int src = sc.nextInt(), dst = sc.nextInt();
        System.out.println(new Solution().validPath(n, edges, src, dst) ? "true" : "false");
    }
}
