import re
import os

# obviously, this is an 'unsafe' and overly complicated fix to a small annoyance.
# but:
#   - I couldn't even make a copy of 'commands' that automatically takes the data out of the result struct in typescript.
#       it's too complicated to map an object's properties while keeping type information.
#   - tauri forces commands to return Result structs, seemingly just to keep borrow checker happy?
#       The error message mentions it's because the output needs to fit in a box dyn.
#       So, some of these commands don't even have a documented possibility of returning an Err variant.
#       In particular, get_data is used very often, and I would need to add a completely unnecessary null check each time.
#   - I like the pattern of doing something uniform at the end of promise chains. It's logging to the console
#       now, but it could also send an alert or ignore the error later.
#       This also means that it's easy to remove unnevessary console logs, since the phrase 'console.log'
#       should not be in source files.
#   - I do think this script achieves the goal of generating type information from rust at compile time.
#       It should even be pretty resillient to changes, and of course, without updating the rust crate
#       or dependencies, it shouldn't even change bindings.ts from the git version.

#   - As a downside, I have no idea if os.system works in windows or other platforms.
#       If you're just trying to compile the project and this is causing issues, it's safe to take this step
#       out of beforeDevCommand and beforeBuildCommand in src-tauri/tauri.conf.json, as long as you don't
#       make any changes to the backend.

def make_bindings():
    os.system("cd ./src-tauri && cargo run make-bindings")

    # to help the indent heuristic at the end be more robust
    os.system("npx prettier -w ./src/bindings.ts")

    file = open("./src/bindings.ts").read()

    lll = 0

    # will need to add here if using more tauri features!!
    lines = [r'const { invoke : __TAURI_INVOKE, } = await import("@tauri-apps/api/core");', '']
    for i, line in enumerate(file.splitlines()):
        if line[:6] == "import":
            continue
        if 'typedError' in line:
            if 'async function' in line:
                lll = len(lines)
            else:
                line = re.sub(r'=> typedError<(.*), string>\(__TAURI_INVOKE\("', r': Promise<\1> => (__TAURI_INVOKE("', line, count=1)
        lines.append(line)




    indent = lambda s: len(s) - len(s.lstrip())

    startindent = indent(lines[lll])
    for rrr in range(lll+1, len(lines)):
        if indent(lines[rrr]) == startindent:
            break

    if rrr == len(lines):
        lines.append("")

    lines[lll] = "/*" + lines[lll]
    lines[rrr] = lines[rrr] + "*/"


    open("./src/bindings.ts", "w").write("\n".join(lines))

    os.system("npx prettier -w ./src/bindings.ts")

if __name__ == "__main__":
    make_bindings()