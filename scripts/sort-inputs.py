from pathlib import Path
from collections import defaultdict
import re

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

for path in Path("./src/").rglob("*"):
    if path.suffix not in [".js", ".jsx"]:
        continue

    with open(path) as file:
        file = file.read()
        lines = file.splitlines()
        i = 0
        # does not catch line comments
        import_lines = defaultdict(set)

        for i, line in enumerate(lines):
            if 'await import(' in line:
                match = re.search("""await import\("(.*)"\)""", line)
                if match is None:
                    print("regex failed. line:")
                    print(line)
                imp = match.groups()[0]
                tag, name = imp, imp
                if (w := imp.rfind('/')) != -1:
                    tag, name = (imp[:w], imp[w:])

                import_lines[get_tag(tag, name)].add((name, i))

            elif not (len(lines[i]) == 0 or line[:2] == "//"):
                break

        end_of_imports = i

        new_imports = []
        for k in sorted(import_lines.keys()):
            for _, i in sorted(import_lines[k]):
                new_imports.append(lines[i])
            new_imports.append('')
        
        new_file = '\n'.join(new_imports) + "\n\n" + "\n".join(lines[end_of_imports:])


        print()
        print()
        print()
        print(path)
        print('='*200)
        print(new_file[:1000])
