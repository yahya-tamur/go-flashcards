from pathlib import Path
from collections import defaultdict
import re
import os
from time import perf_counter_ns

if (Path.cwd().name != "go-flashcards"):
    print("Script must be called from the go-flashcards folder!")
    exit()

tag_priorities = {
    "react" : -2,
    "@tauri-apps" : -1,
    '.' : 20,
    '..': -10,
}

name_priorities = {
    'css': -1
}

def get_tag(tag, name):
    l = sum(v for (k, v) in tag_priorities.items() if k in tag)
    r = sum(v for (k, v) in name_priorities.items() if k in name)

    return (l + r, tag)

print("\nSorting imports.\n")

for path in Path("./src/").rglob("*"):
    start = perf_counter_ns()
    if path.suffix not in [".js", ".jsx"]:
        continue

    with open(path) as file:
        file = file.read()
        lines = file.splitlines()
        i = 0

        preamble = []

        while i < len(lines):
            if 'await import(' in lines[i]:
                break
            preamble.append(lines[i])
            i += 1
        preamble = "\n".join(preamble)
        if preamble:
            preamble += "\n"

        import_lines = defaultdict(set)

        while i < len(lines):
            line = lines[i]

            if 'await import(' in line:
                while (';' not in line):
                    i += 1
                    line += "\n" + lines[i]
                match = re.search("""await import\("(.*)"\)""", line)
                if match is None:
                    print("regex failed. line:")
                    print(line)
                imp = match.groups()[0]
                tag, name = imp, imp
                if (w := imp.rfind('/')) != -1:
                    tag, name = (imp[:w], imp[w:])

                import_lines[get_tag(tag, name)].add((name, line))

            elif not (len(lines[i]) == 0):
                break
            
            i += 1

        end_of_imports = i

        new_imports = []
        for k in sorted(import_lines.keys()):
            if (len(import_lines[k]) == 0):
                print("Noooo!")
                exit() 
            for _, line in sorted(import_lines[k]):
                new_imports.append(line)
            new_imports.append('')
        
        new_file = preamble + \
            '\n'.join(new_imports) + \
            ("\n" if end_of_imports < len(lines) else "") + \
            "\n".join(lines[end_of_imports:]) + \
            ("\n" if end_of_imports < len(lines) else "")


    l, r = "\033[0;30m", "\033[0m"
    change = "(unchanged)"
    if new_file != file:
        with open(path, 'w') as file:
            file.write(new_file)
        l, r = "", ""
        change = ""

    print(f"{l}{path}{r} {(perf_counter_ns() - start) // 1_000_000}ms {change}")

print("\nRunning prettier.\n")
os.system("npx prettier ./src -w")

print("\nRunning cargo format.\n")
os.system("cd src-tauri && cargo fmt")

print("\nRunning cargo clippy.\n")
i = os.system("cd src-tauri && cargo clippy")

# maybe only run if no clippy errorrs
if (i == 0):
    print("\nRunning git status.\n")
    os.system("git status")