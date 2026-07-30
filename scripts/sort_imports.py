from pathlib import Path
from collections import defaultdict
import re
from time import perf_counter_ns
import os


def indent(s):
    return len(s) - len(s.lstrip())


def sortMap(string, end, key=None):
    left = string.rfind("{", 0, end)
    if left == -1:
        return string

    right = string.find("}", left, end)

    indent = None
    if "\n" in string[left:right]:
        indent = 0
        while string[left + indent + 2] == " ":
            indent += 1

    words = [w.strip() for w in string[left + 1 : right].split(",") if w.strip()]

    if key is not None:
        words.sort(key=key)
    else:
        words.sort()

    if indent is None:
        return string[:left] + "{ " + ", ".join(words) + " " + string[right:]
    else:
        return (
            string[:left]
            + "{"
            + "".join(["\n" + " " * indent + w + "," for w in words])
            + "\n"
            + " " * (indent - 2)
            + string[right:]
        )


def sort_useContext():

    def contextWordsKey(w):
        if w[:5] == "c_set":
            return w[5:].lower() + "1"
        if w[:2] == "c_":
            return w[2:].lower()
        print(
            "sort useContext warning: context variables should start with c_, but found: ",
            w,
        )
        return w

    print("\nsorting use context\n")

    for path in Path("./src/").rglob("*"):
        # for path in [Path("./src/theme.d.ts")]:
        start = perf_counter_ns()
        if path.suffix not in [".ts", ".tsx"]:
            continue
        with open(path) as file:
            file = file.read()

            end = file.find("useContext(AppContext)")
            if end == -1:
                continue

            new_file = sortMap(file, end, contextWordsKey)

        color_start, color_end = "\x1b[90m", "\x1b[0m"
        change = "(unchanged)"
        if new_file != file:
            with open(path, "w") as file:
                file.write(new_file)
            color_start, color_end = "", ""
            change = ""

        print(
            f"{color_start}{path}{color_end} {(perf_counter_ns() - start) // 1_000_000}ms {change}"
        )


def sort_imports():

    priorities = {
        "react": -20,
        "@tauri-apps": -10,
        "@/": 20,
        "..": 30,
        ".": 40,
    }

    typ_order = {"type": 0, "plain": 1, "dyn": 2}

    def get_key(typ, mod, name):
        priority = sum(v for (k, v) in priorities.items() if k in mod + name)

        return (typ_order[typ], priority, mod)

    for path in Path("./src/").rglob("*"):
        # for path in [Path("./src/theme.d.ts")]:
        start = perf_counter_ns()
        if path.suffix not in [".ts", ".tsx"]:
            continue

        with open(path) as file:
            file = file.read()
            lines = file.splitlines()
            i = 0

            preamble = []

            # yes, don't use /* for initial comment
            while i < len(lines):
                if len(lines[i]) > 0 and lines[i][:2] != "//":
                    break
                preamble.append(lines[i])
                i += 1

            import_lines = defaultdict(set)

            while i < len(lines):
                line = lines[i]
                j = i
                while j + 1 < len(lines) and (
                    (j == i and indent(lines[j + 1]) > indent(lines[i]))
                    or (
                        j != i
                        and (indent(lines[j + 1]) >= indent(lines[i]))
                        and (indent(lines[j]) > indent(lines[i]))
                    )
                ):
                    j += 1

                linetext = "\n".join([x for x in lines[i : j + 1] if x])

                match, typ = None, ""
                if linetext[:11] == "import type":
                    match = re.search("""from "(.*)";""", linetext)
                    typ = "type"
                elif "await import(" in linetext:
                    match = re.search("""await import\\("(.*)\"""", linetext)
                    typ = "dyn"
                elif linetext[:7] == "import " and "from" in linetext:
                    match = re.search("""from "(.*)";""", linetext)
                    typ = "plain"
                elif linetext[:7] == "import ":
                    match = re.search("""import "(.*)";""", linetext)
                    typ = "plain"
                elif len(linetext) == 0:
                    i += 1
                    continue
                else:
                    break

                if match is None:
                    print("sort import error: regex failed. line:")
                    print(linetext)
                    exit()

                imp = match.groups()[0]
                mod, name = imp, imp
                if (w := imp.rfind("/")) != -1:
                    mod, name = (imp[:w], imp[w:])

                w = linetext.find("}")
                if w != -1:
                    linetext = sortMap(linetext, w + 1)

                # import_lines[get_key(typ, mod, name)].add((name, linetext))
                if typ == "dyn":
                    print("sort imports warning: dynamic import?!")

                import_lines[get_key(typ, mod, name)].add((name, linetext))

                i = j + 1

            end_of_imports = i

            for k in sorted(import_lines.keys()):
                if len(import_lines[k]) == 0:
                    print(
                        "sort imports error: empty import lines should have been skipped"
                    )
                    exit()
                for _, line in sorted(import_lines[k]):
                    preamble.append(line)
                preamble.append("")

            new_file = (
                "\n".join(preamble)
                + ("\n" if len(preamble) > 0 else "")
                + "\n".join(lines[end_of_imports:])
                + ("\n" if end_of_imports < len(lines) else "")
            )

        color_start, color_end = "\x1b[90m", "\x1b[0m"
        change = "(unchanged)"
        if new_file != file:
            with open(path, "w") as file:
                file.write(new_file)
            color_start, color_end = "", ""
            change = ""

        print(
            f"{color_start}{path}{color_end} {(perf_counter_ns() - start) // 1_000_000}ms {change}"
        )


if __name__ == "__main__":
    os.system("npx --loglevel silent prettier -w ./src")

    sort_imports()
    sort_useContext()
