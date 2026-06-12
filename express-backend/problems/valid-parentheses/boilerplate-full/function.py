import sys

##USER_CODE_HERE##

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print("true" if isValid(s) else "false")
