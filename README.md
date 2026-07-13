Current Status
------------------

- ok, maybe it won't be done in the summer.

Current Large Goal in progress
----------------

UI overhaul

[#] Main Desktop
[#] Edit Desktop
[ ] Study Desktop

[ ] Main Mobile
[ ] Edit Mobile
[ ] Study Mobile

      - Histogram
        - custom svg like board, table.
        - see tablet:
          - [  |  |  | ] graph on mobile. Maybe on desktop too.

Current Actual Goal
--------------
- Fix all bugs in Board
- setup app data initialization (rust include dir crate)
- compile to android
- actually add histogram, nicer study screen
  - segues into porting study screen to mobile

- android file situation


things that popped up:
----------------------------------

- menus can be dragged??
- import from sgf ignored AB property in example sgf file!!
- there's a fontsource: roboto??! what is it, why is it, and do I still need the local font?
- why isn't the edit menu a little taller to accomodate for default size??
- reset label when moving exercises
  - increment number labels too
  - util
    - move stuff around in Board.jsx when you're at ir

- new exercise: preserve window
- lots of errors while studying

Remaining Goals
---------------

(-) Actually make a good flashcard set and use this to study.

- rename this file roadmap or todo or something and link it from readme if you want
- phone app
  - android file situation

- Customizable algorithm
  - new bucket for mistakes in last 3?
  - add to config
  - add total number correct, and shorten history?
    - ex. once you get a question right 5 times, it's
      as correct as it'll ever be.
    - boxes for <10 times correct, <50 times correct, <0infty times correct,

Small things that come to mind:
-----------------

- theme in config
  - we will have to have this default theme in the public folder,
    but you can probably import whatever ThemeOptions you want

- break up backend into modules

- option to not put territory marks on stones
- 'file system error' alert
- tactility:
  - exit without saving? popup on edit
    - same on config
  - popups on save?
  - popups on correct / incorrect?

- I don't like the number spinner.

- sometimes show next moves on board (color based on variant, who plays first)
  - option to not see tree?

- In comments, moves marked like {S1} also get transformed.
  - or, comments like {Black}

- Add to config:
  - custom art per flashcard set.
    - expose config to frontend =>
      - put number in stone button in maketree?
  - history length

  - sources: multiple, shared.
  - show comments : none, all, first

- more options in export to sgf

- do all buttons have tooltips?

- ? rename exercise
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

Finalizing
-------------

- app is still very unresponsive. just moving mouse around or clicking
  nodes on tree is too slow.
  - seems to depend on laptop plugged in vs. not, but it shouldn' be slow even when not
    plugged in.

- go over code quality.
  - front end may be especially messy
  - Look over console.log's. Use it maybe but consistent, only for useful things
  - consistent error handling, esp. in the backend. Result vs. panic

- updater plugin
- initialize app data with example usage?
- add licence to all the files + make repo public

Notes for android building process
---------------
- What worked:
  - delete gen file
  - cargo tauri android init
  - cargo tauri android build
    - works, but is unsigned
  - run local file ../android-keystore/dev/insert
    - (follow instructions to edit build.gradle.kts, signingconfigs *is* under android)
  - cargo tauri android build
    - works

  - earlier I think I had to open gen project in android studio and edit build variant
  
  - also I added ANDROID_HOME to bash_rc, so that should be ok
    - building once without this variable (and two others) probably means you need to
    - delete src-tauri/gen and restart process
