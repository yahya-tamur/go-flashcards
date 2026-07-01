Current Status
------------------
  - ok, maybe it won't be done in the summer.

Current Item in progress
----------------
  !- app performance, especially with:
    - spam marks / place stone:
      - do some bs  on frontend + send only one command on DragEnd or whatever
    
Notes
--------------
  - great board mouse logic. I think

  - actually send signal.
  - board rerenders a lot again? check that
  - click mode ghost??



  - use drag rectangles for black territory, white territory, delete mark
    - will need actual buttons
    - will need ghost icons.

  - small rethink of menu layout:
    - less tall tree view with smaller stones
    - redo label logic + separate button from text input.
      - just if label was a capital letter, increment it.
        - unless there's already >= 2 of that letter.

   - apply vite suggestions for smaller bundle

Remaining Goals
---------------

  (-) Actually make a good flashcard set and use this to study.

  - UI Overhaul
      - check tablet for design ideas
        -> Study: Guess, View (mobile, desktop)
        -> Edit: Initialize, MakeTree (mobile, desktop) - tooltips on buttons
        -> MainMenu (mobile)

        -- This should be like 95%

      - captures? no?
      
      - Histogram
        - custom svg like board, table.
        - see tablet:
          - [  |  |  | ] graph on mobile. Maybe on desktop too.
      
      - tactility:
        - exit without saving? popup on edit
          - same on config
        - popups on save?
        - popups on correct / incorrect?
        - next button? 
      
      - number spinner is too wide

  - phone app
    - phone ui
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
  - sometimes show next moves on board (color based on variant, who plays first?)

  - all the lines look too thick for 1080p?

  - In comments, moves marked like {S1} also get transformed.

  - buttons to type marks in comments?

  - copy comment from root node, not current node on collapse
    
  - Add to config:
    - custom art per flashcard set.
        - expose config to frontend =>
          - put number in stone button in maketree?
    - history length
      
    - sources: multiple, shared.
    - show comments : none, all, first

  - more options in export to sgf

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