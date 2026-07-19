Current Status
------------------

- ok, maybe it won't be done in the summer. maybe this year??

Current Large Goal in progress
----------------

UI overhaul

[#] Main Desktop
[#] Edit Desktop
[ ] Study Desktop

[ ] Main Mobile
[ ] Edit Mobile
[ ] Study Mobile

- address enough small issues to make app a lot more usable
- also, make this list more manageable

Current Actual Goal
--------------

- study frontend :
  - hide tree completely ?
    - not in view
    - replace it with 'back' button?
    - sometimes show next moves on board (color based on variant, who plays first)


bugs / small improvements
----------------------------------------
- ? no clue how difficult
  - dragging does not work on android

- back button on android
- arrow key in edit label text area moves tree
- config doesn't automatically update on add exericse
  - configsignal doesn't work
- updating config doesn't update study sets automatically.
- make this look better on default window size
  - InitializeMenu, MakeTreeMenu just a little too tall for their box
- mobile editconfig may not work when empty
- disable tauri plugin dialog on android?
  - done? follow up? I think some crate couldn't be enitrely removed for permissions
- refactor movetree to return error instead of panic on array index
- are boards sliders slow?
  - always draw entire board.
- Ctrl - S
- right click to delete
- disable exercise loading when invalid config.
- menus can be dragged (as if they're images )
- import from sgf ignored AB property in example sgf file!!
- there's a fontsource: roboto??! what is it, why is it, and do I still need the local font?
- reset label when moving exercises
  - increment number labels too
  - util
    - move stuff around in Board.jsx when you're at it

- new exercise: preserve window
- option to not put territory marks on stones

- advanced configuration popup menu

- delete history file?

- In comments, moves marked like {S1} also get transformed.
  - or, comments like {Black}
- I don't like the number spinner.



Remaining Goals
---------------

- replace other hashmaps with indexmaps?
  
- tactility:
  - exit without saving? popup on edit
    - same on config
  - popups on save?
  - popups on correct / incorrect?


- vertical layout.
  - how to account for bottom and top on android?

- Customizable app data location
  - use tauri store

- reorderable lists
  - store on usual app data

- custom theme goal:
  - (convertfilesync)
  - editable values:
    - theme, all images
      papers? elevations? no?
      mode ?!
  - progress bar colors
  - add to appdata + config
    -images too
- we will have to have this default theme in the public folder,
  but you can probably import whatever ThemeOptions you want

(-) Actually make a good flashcard set and use this to study.

- rename this file roadmap or todo or something and link it from readme if you want
  - then make actual readme

- Better algorithm
  - full correct / incorrect as well as queue
    - remember wrong answers?
      - signature in tree?
  - longtime bad ratio = very bad
  - remember wrong answers?

- Add to config:
  - custom art per flashcard set.
    - expose config to frontend =>
      - put number in stone button in maketree?
  - history length

  - sources: multiple, shared.
  - show comments : none, all, first

- more options in export to sgf
- CA[!= UTF-8]

- do all buttons have tooltips?
  - is that enough? should they?

Maybe don't do
----------------

- ? rename exercise
  - export / import sgf
  - will need to rename histories as well
- ! copy paste position???

- ? redo label logic?
- ? ui for captures?

- ? multiple spaces in file names?

- ? reconsider snapshot ~> location.

Small things, but do not do for now
------------

- adding config per source file.
- sgf parse followup

- play moves automatically
  - frontend only? noop mode (cursor?).

- timer?
- sounds?
  - better (higher res, copyright ok) art too.
- recursive exercise directory?

Finalizing
-------------

- updater plugin
- good initial app data
- add licence to all the files + make repo public

Notes for android building process
---------------
  - There's now a script (not committed because it includes signing)
  - also, setting up android studio was a bit complicated