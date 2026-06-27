Remaining Goals
---------------

  - timeline:
    - ok, maybe it won't be done in the summer.

  !- app performance, especially with:
    - spam marks / place stone:
      - do some bs  on frontend + send only one command on DragEnd or whatever
      - slider: ?? maybe same with svg viewport?
      - typing comments

    - maybe stop taking in all new data at all times
      - maybe a lot of front end state should no longer be tied to data.game. ...
    - apply vite suggestions for smaller bundle
  - consider snapshot ~> location.

  - multiple spaces in file names?

  (-) Actually make a good flashcard set and use this to study.

  - comment box is bad and should be shared between edit and study

  - UI Overhaul
      - check tablet for design ideas
        -> Study: Guess, View (mobile, desktop)
        -> Edit: Initialize, MakeTree (mobile, desktop) - tooltips on buttons
        -> MainMenu (mobile)

        -- This should be like 95%

      - less tall tree view with smaller stones
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

      - more options in export to sgf
      
      - number spinner is too wide

    - phone app
      - phone ui
      - android file situation

  - black territory, white territory marks
    - input with drag?
  - sometimes show next moves on board (color based on variant, who plays first?)

  - all the lines look too thick for 1080p?

  - In comments, moves marked like {S1} also get transformed.

  - buttons to type marks in comments?

  
  - Add to config:
    - custom art per flashcard set.
        - expose config to frontend =>
          - put number in stone button in maketree?
    - history length
    - customize algorithm behavior
      - new bucket for mistakes in last 3?
    - sources: multiple, shared.



- Ongoing
  - go over code quality.
    - front end may be especially messy
    - Look over console.log's. Use it maybe but consistent, only for useful things
    - consistent error handling, esp. in the backend. Result vs. panic

- Consider.

  - adding config per source file.
  - sgf parse followup

  - play moves automatically
    - frontend only? noop mode (cursor?).

  - timer?
  - sounds?
    - better (higher res, copyright ok) art too.

- Finalizing

  - updater plugin
  - initialize app data with example usage?
  - add licence to all the files + make repo public