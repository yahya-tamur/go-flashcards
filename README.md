Current Status
------------------
  - ok, maybe it won't be done in the summer.

Current Item in progress
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
Notes
--------------

Remaining Goals
---------------

  (-) Actually make a good flashcard set and use this to study.

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

  - tactility:
    - exit without saving? popup on edit
      - same on config
    - popups on save?
    - popups on correct / incorrect?
  
  - I don't like the number spinner.

  - sometimes show next moves on board (color based on variant, who plays first)
    - option to not see tree?

  - In comments, moves marked like {S1} also get transformed.


  - Add to config:
    - custom art per flashcard set.
        - expose config to frontend =>
          - put number in stone button in maketree?
    - history length
      
    - sources: multiple, shared.
    - show comments : none, all, first

  - more options in export to sgf

  - do all buttons have tooltips?

  - ? redo label logic?
  - ? ui for captures?

  - ? only redraw stones or marks if those have changed. (instead of context.data)

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
