import os
from pathlib import Path


def format():
    from sort_imports import sort_imports
    from make_bindings import make_bindings

    print("\nMaking Bindings.")
    make_bindings()

    print("\nSorting imports.\n")
    sort_imports()

    print("\nFormatting javascript.\n")
    os.system("npx --quiet prettier ./src -w")

    print("\nFormatting python.\n")
    os.system("ruff format ./scripts/*.py")

    print("\nFormatting rust.\n")
    os.system("cd src-tauri && cargo fmt")


def lint():
    print("\nLinting python.\n")
    os.system("ruff check ./scripts/*.py --fix")

    print("\nLinting javascript.\n")
    os.system("npx --quiet eslint . --fix")

    print("\nLinting rust.\n")
    os.system("cd src-tauri && cargo clippy")

    print("\nLinting rust for android.\n")
    os.system("cd src-tauri && cargo clippy --target=aarch64-linux-android")

    print("\nLinting rust in release mode.\n")
    os.system("cd src-tauri && cargo clippy --release")


def status():
    print("\nRunning git status.\n")
    os.system("git status")

    print("\nCounting lines of code.\n")
    os.system("cloc ./src/ ./src-tauri/src/ ./scripts")


commands = ["format", "lint", "status"]

if __name__ == "__main__":
    import sys

    if Path.cwd().name != "go-flashcards":
        print("This script is designed to be called from the project root folder.")
        if input("Type 'continue' to run anyway. ") != "continue":
            exit()

    if sum(comm in sys.argv for comm in commands) != 1:
        print(
            f"The available commands are: {', '.join(commands)}. Only run one at a time."
        )
    else:
        for comm in commands:
            if comm in sys.argv:
                eval(f"{comm}()")
