import re
import os

# obviously, this is an 'unsafe' and overly complicated fix to a small annoyance.
# but:

# This makes 'bindings.ts', which defines types that are sent by rust to the frontend.
# All of the work is done by tauri-specta, this then just keeps them as Promises instead of typedErrors,
# which is easier to incorporate to promise chains.
# For this app, it's OK to lose type information about the errors, because they're all strings.

# This is a python script, because I somehow couldn't make this change in typescript.

# - I don't think os.system works the same in windows or other platforms.
#   If you're just trying to compile the project and this is causing issues, it's safe to take this step
#   out of beforeDevCommand and beforeBuildCommand in src-tauri/tauri.conf.json, as long as you don't
#   make any changes to the backend.

signature = "// edited by ./scripts/make_bindings.py"


def make_bindings():
    os.system("cd ./src-tauri && cargo run make-bindings")

    # to help the indent heuristic at the end be more robust
    os.system("npx --loglevel silent prettier -w ./src/bindings.ts")

    file = open("./src/bindings.ts").read()

    if signature in file:
        return

    lll = 0

    # will need to add here if using more tauri features!!
    lines = [
        r'const { invoke : __TAURI_INVOKE, } = await import("@tauri-apps/api/core");',
        "",
        signature,
    ]
    for i, line in enumerate(file.splitlines()):
        if line[:28] == "export type DisplayableError":
            lines.append(f"// {line}")
            continue
        if line[:6] == "import":
            lines.append(f"// {line}")
            continue
        if "typedError" in line:
            if "async function" in line:
                lll = len(lines)
            else:
                line = re.sub(
                    r'=> typedError<(.*), DisplayableError>\(__TAURI_INVOKE\("',
                    r': Promise<\1> => (__TAURI_INVOKE("',
                    line,
                    count=1,
                )
        lines.append(line)

    def indent(s):
        return len(s) - len(s.lstrip())

    startindent = indent(lines[lll])
    for rrr in range(lll + 1, len(lines)):
        if indent(lines[rrr]) == startindent:
            break

    if rrr == len(lines):
        lines.append("")

    lines[lll] = "/*" + lines[lll]
    lines[rrr] = lines[rrr] + "*/"

    open("./src/bindings.ts", "w").write("\n".join(lines))

    os.system("npx --loglevel silent prettier -w ./src/bindings.ts")


if __name__ == "__main__":
    make_bindings()
