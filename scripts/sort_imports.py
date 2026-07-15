def indent(s):
    return len(s) - len(s.lstrip())


def sort_imports():
    from pathlib import Path
    from collections import defaultdict
    import re
    from time import perf_counter_ns

    if Path.cwd().name != "go-flashcards":
        print("Script must be called from the go-flashcards folder!")
        exit()

    mod_priorities = {
        "react": -2,
        "@tauri-apps": -1,
        ".": 20,
        "..": -10,
    }

    name_priorities = {"css": -1}

    typ_order = {"plain": 0, "type": 1, "dyn": 2}

    def get_key(typ, mod, name):
        mod_priority = sum(v for (k, v) in mod_priorities.items() if k in mod)
        name_priority = sum(v for (k, v) in name_priorities.items() if k in name)

        return (typ_order[typ], mod_priority + name_priority, mod)

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

            # yes, don't use /* or empty lines or whatever
            while i < len(lines):
                if lines[i][:2] != "//":
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
                    match = re.search("""await import\("(.*)\"""", linetext)
                    typ = "dyn"
                elif linetext[:8] == "import ":
                    match = re.search("""from "(.*)";""", linetext)
                    typ = "plain"
                elif len(linetext) == 0:
                    i += 1
                    continue
                else:
                    break

                if match is None:
                    print("regex failed. line:")
                    print(linetext)
                    exit()

                imp = match.groups()[0]
                mod, name = imp, imp
                if (w := imp.rfind("/")) != -1:
                    mod, name = (imp[:w], imp[w:])

                import_lines[get_key(typ, mod, name)].add((name, linetext))

                i = j + 1

            end_of_imports = i

            for k in sorted(import_lines.keys()):
                if len(import_lines[k]) == 0:
                    print("Noooo!")
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
    sort_imports()
