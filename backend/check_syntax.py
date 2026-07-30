import ast, sys
try:
    with open("main.py", "r") as f:
        ast.parse(f.read())
    print("OK: main.py syntax is valid")
except SyntaxError as e:
    print(f"SYNTAX ERROR: {e}")
    sys.exit(1)