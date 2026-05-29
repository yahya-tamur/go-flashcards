- find first six exercises and add them as a file.
- implement study mode to study those six exercises.
- clean up todo.

-- 

  - Marking mode
    - Add markings to Move.
    - Markings cleared when the stone they're pertaining to changes.
    - Circle in most recent move.
    - Markings automatically transferred on 'play'

UI IMPROVEMENTS:
  - make editconfig just slightly nicer
  - problems: who to play?
  - separate top menu.
    - put exercise num, fwd, back, back to menu, from to sgf, in there
  - less tall tree view with smaller stones
  - disable 'new exercise' if exercise already exists.

Finished backend of study mode.
  Next:
    - make frontend (copy editing mode a lot) (isolate components?)
    - fix anything that comes up
    - do some stuff in 'Yes, right away' below to try to reach 'very usable'
      goal right away.
    - once that goal is actually met (!):
      - read this whole document and make good list of extra things
        to do.

    - timeline:
      - will shift focus soon.
      - but should get into phase where I can start slowly using it and
      - making small fixes.
--

Small things:
  - Yes, right away:
    - make corresponding flashcard file on new exercise
    - pass button
    - Markings on board during setup
    - Sliders during tree phase (but limited)
    - set variant in study mode
    - Automatically number moves, or at least have the option to.
      - Maybe with comments on or with 


    ~~ here: very usable.

    - delete file?
    - delete branch?
    - refactor config? where is it? how do I get it?
    - delete exercise? insert? in editing mode
  
  - Nice project. Do eventually. 
    - go over all past readmes. Refactor all into better action items.
    - play moves automatically
    - transform exercises. In comments, moves marked like {S1} also get transformed.
    - captures? nicer menus at least
    - to / from sgf

    - code quality
    - consistent error handling
    - better algorithm (config etc)
    - phone app
      - phone ui
      - android file situation

  - consider
    - timer?
    - sounds? custom visuals?
    - initialize with app data
    - even better algorithm
  
  
   - advanced config.
    - custom art per flashcard set.
    - custom letters, numbers.
    - randomize color?
    - randomize orientation?
    - history length
    - what problems to see
    - board color. Theme.
    - sources: multiple, shared.


Big Things:

  - finish study mode as is. connect everything.
  
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