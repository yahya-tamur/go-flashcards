
Small things:
  - pass button
  - Markings on board during setup
  - Sliders during tree phase (but limited)
  - transform exercises. In comments, moves marked like {S1} also get transformed.
  - save width in movetree

Big Things:
  - config
  - study mode
  
-------------------------------------

Partial Board implementation complete!!

Try not to work on this until week end! => try to finish as soon as possible to move on


To Do next:

  - Setup / Tree phases
    - Set up phase:
      - sliders only visible during setup + actually clear board.
      - calls to place_stone, not play
      - B, W, B/W buttons 
      - Initialize Tree button
    - Tree phase:
      - comment box
      - show captures
      - Collapse Tree button
      - Delete Node
      - Mark nodes as correct / incorrect

      - Initial "None" node should be able to have a comment??



  - Create home folder.
    - Save (and load) exercise.
    - later, it can include translations and assets
    - figure out android?


 (?) Make Exercises Mode:
    - back, forward buttons, append option

 (?) Flashcard Mode
  - configs:
    - show comments before answer?
    - percentage to show
    - play both sides?
    - randomize coordinates?

  - one config file:
    - global and 'modes'
      - modes:
        - source files
        - can overwrite any config
  - one history file / exercise file

  - new back, forward buttons

  - stars? 
  - customizable assets, theme?
    - sounds ??? can i not??
  - make default assets
  - license file

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