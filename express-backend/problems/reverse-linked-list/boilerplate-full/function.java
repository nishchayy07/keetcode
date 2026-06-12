import java.util.*;
import java.io.*;

class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

##USER_CODE_HERE##

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int size = sc.nextInt();
        ListNode head = null, tail = null;
        for (int i = 0; i < size; i++) {
            ListNode node = new ListNode(sc.nextInt());
            if (head == null) head = node;
            else tail.next = node;
            tail = node;
        }
        ListNode result = new Solution().reverseList(head);
        StringBuilder sb = new StringBuilder();
        while (result != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(result.val);
            result = result.next;
        }
        System.out.println(sb.toString());
    }
}
