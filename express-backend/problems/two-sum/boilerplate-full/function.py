import sys

##USER_CODE_HERE##

if __name__ == "__main__":
    lines = sys.stdin.read().split()
    if len(lines) >= 2:
        num1 = int(lines[0])
        num2 = int(lines[1])
        print(sum(num1, num2))
