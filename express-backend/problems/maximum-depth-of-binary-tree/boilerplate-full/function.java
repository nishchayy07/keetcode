import java.util.*;
import java.io.*;

class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int x) { val = x; }
}

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int size = sc.nextInt();
        if (size == 0) { System.out.println(0); return; }
        TreeNode[] nodes = new TreeNode[size];
        for (int i = 0; i < size; i++) {
            int v = sc.nextInt();
            if (v != -1) nodes[i] = new TreeNode(v);
        }
        for (int i = 0; i < size; i++) {
            if (nodes[i] == null) continue;
            if (2*i+1 < size) nodes[i].left = nodes[2*i+1];
            if (2*i+2 < size) nodes[i].right = nodes[2*i+2];
        }
        System.out.println(new Solution().maxDepth(nodes[0]));
    }
}
