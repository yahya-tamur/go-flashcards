Remaining Goals
---------------

  - timeline:
    - one or two weeks of looking over, doing small things.
    - then, little should remain.
      - maybe only auto-respond

  !- fix initial marks situation:
    - initial game state shouldn't contain any marks.
      - serde ignore + default.


  (-) Actually make a good flashcard set and use this to study.


  - UI Overhaul
      - check tablet for design ideas
        => mobile, desktop versions of 3 screens only

      - less tall tree view with smaller stones
      
      - captures? no?
      
      - Histogram
        - custom svg like board, table.
        - see tablet
      
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

  - updater plugin

  - sgf parse followup

  - app performance, especially with:
    - spam marks / place stone:
      - do some bs  on frontend + send one command on DragEnd or whatever
      - slider: ?? maybe same with svg viewport?

  - apply vite suggestions for smaller bundle

  - black territory, white territory marks
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

  - play moves automatically
    - frontend only? noop mode (cursor?).

  - timer?
  - sounds?
    - better (higher res, copyright ok) art too.

- Finalizing

  - initialize app data with example usage?
  - add licence to all the files + make repo public
  - 
