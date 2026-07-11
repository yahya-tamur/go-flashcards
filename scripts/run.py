import os
import sys
from pathlib import Path
if (Path.cwd().name != "go-flashcards"):
    print("Script must be called from the go-flashcards folder!")
    exit()

if "format" in sys.argv:
    from sort_imports import sort_imports
    print("\nSorting imports.\n")
    sort_imports()

    print("\nRunning prettier.\n")
    os.system("npx prettier ./src -w")

    print("\nRunning cargo format.\n")
    os.system("cd src-tauri && cargo fmt")

if "lint" in sys.argv:
    print("\nRunning ESLint.\n")
    os.system("npx eslint . --fix")

    print("\nRunning cargo clippy.\n")
    os.system("cd src-tauri && cargo clippy")

if "status" in sys.argv:
    print("\nRunning git status.\n")
    os.system("git status")

    print("\nCounting lines of code.\n")
    os.system("cloc ./src/ ./src-tauri/src/ ./scripts")