import sys

##USER_CODE_HERE##

if __name__ == "__main__":
    lines = sys.stdin.read().split()
    if len(lines) > 0:
        size_arr = int(lines[0])
        arr = [int(x) for x in lines[1:size_arr+1]]
        print(maxElement(arr))
