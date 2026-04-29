App is looking good. Did a lot of work including last commit.
Completely implemented tree (backend + frontend).
Try not to work on this until week end!

To Do next:

  - Partial Board:
    - set up well by isolating board size logic
    - mui sliders
    - will need to go over how whole board is rendered
    - should double check unseen board is always empty!

  - Set up phase. Initialize tree, collapse tree buttons.
    - Mark exercises as correct / incorrect. Add comments.

  - Create home folder.
    - Save (and load) exercises.
    - later, it can include translations and assets
    - figure out android?
    - now, you can save exercises to it

  - 
  - Set up Exercise:

    - comment box
    - correct / incorrect nodes
    - save and load
    - set up + initialize phase
  
  - Delete Node

  - Side View:
    - lots of buttons
    - captures

  - Study Exercise:
    - Hide (some of) tree? Hide comments?
    - Get correct / incorrect, reveal

Then:
  - Set up list of exercises
  - read
  - flashcard phase
  - etc.

---

Implemented board. It works!

- happy with journal entry style README
  - probably README is wrong place for this but nice to
    have a write up

- Tauri sometimes got stuck on white screen on load.
  I have no idea what fixed it. It probably didn't, but
  also this might be an issue only for dev server

- happy with ui potential. Nice way to shared state +
  good looking widgets available.
  - however, might take some work to implement.

To Do:

- add licence text to files?
- figure out what you want from MoveTree and implement it
  - Huge chunk of work:
    - move tree component
    - backend implementation of everything

- user story idea:
  - 'setup mode': Place stones B / W / BW.
  - Click 'Init Tree'. Now only B/W
  - make exercise, add comments, etc.

- Then, what's needed?
  - saving / loading from file. sgf? ...

  -> Can now save and load exercises one by one.
  - Make batch of exercises
  - study batch of exercises
  - flashcard backend, frontend

- final product, folder structure ?:
  - exercise file(s) / folders
  - history file (one for all exercises?)
  - config file:
    - shared config
    - exercise set: source file/folders, specific config
      - shared history file between different exercise sets?

    - can split off into multiple files?

  - can edit exercise files when practicing (?!)

- look back and see if I had any other ideas etc.

---

looking good and easy enough to use!

to do

- reduce autocomplete in vscode!
- use svg to draw move tree
- implement go board and rules

- new movetree structure.

- actual tree: (data oriented)
- data: id => Node // (Vec<Node>)
- parent: id => id // (Vec<usize>)
- buildTree: generates // (Vec<Vec< usize > >)
- play: (can shift built tree)
- delete: needs to actually make new data array or something

---

trying out new architecture for previous project (tauri, hopefully material ui)

cons:

- seems complicated.
  - this might be the simplest solution for rust backend + material ui
  - I'm not 100% sure I need rust backend, but shouldn't be worse than electron

pros:

- can eventually compile to mobile
- will hopefully look good using material ui
- hopefully won't have to implement horizontal scrolling etc. myself

below is default readme for tauri, I'll delete it later.

# Tauri + React

This template should help get you started developing with Tauri and React in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
