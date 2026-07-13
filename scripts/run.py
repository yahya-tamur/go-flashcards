import os
import sys
from pathlib import Path
if (Path.cwd().name != "go-flashcards"):
    print("Script must be called from the go-flashcards folder!")
    exit()

if "format" in sys.argv:
    from sort_imports import sort_imports
    from make_bindings import make_bindings

    print("\nMaking Bindings.")
    make_bindings()

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

    print("\nRunning cargo clippy in release mode.\n")
    os.system("cd src-tauri && cargo clippy --release")

if "status" in sys.argv:
    print("\nRunning git status.\n")
    os.system("git status")

    print("\nCounting lines of code.\n")
    os.system("cloc ./src/ ./src-tauri/src/ ./scripts")