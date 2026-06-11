Remaining Goals
---------------

- Small Action Items

  - config screen undo situation

  - Actually make a good flashcard set and use this to study.

  - delete:
    - whole exercise
    - exercise file
    - insert exercise in middle?

  - Config => editing (visuals, numbers)
    - how does config get distributed inside?
    - frontend needs it too.

- Action Items
  - New Config:
    - HashMap<String, Options>
    - Options: every option, all optional
    - must have 'default' and ?'editing'

  - Marking:
    - numbers, SEPARATE FROM:
    - markings: letters, numbers, circle, triangle.
    - it stays. you can delete it if you want (how?)
    - Problem: <initial moves, initial markings, movetree>
    - Move: <Move, Vec<markings>>
    - MoveTree: <GameState: also has ko, captures, markings in coordinates>

  - Histogram
    - custom svg like board, table.
    - not sure where to put this in the ui, what would look nice.

  - transform exercises. In comments, moves marked like {S1} also get transformed.

  - to / from sgf

  - better algorithm (config etc)
  - phone app
    - phone ui
    - android file situation

  - Advanced Configuration

    - recent-marking: none, number, circle
    - custom art per flashcard set.
    - randomize color?
    - randomize orientation?
    - history length
    - customize algorithm behavior
    - sources: multiple, shared.

    - fuck it, editing can have multiple sources too.



- Ongoing
  - go over code quality.
    - front end may be especially messy
    - Look over console.log's. Use it maybe but consistent, only for useful things
    - consistent error handling, esp. in the backend. Result vs. panic

  - Make UI nicer
    - less tall tree view with smaller stones
    - captures?
    - a lot of screens are ok but not great
    - tactility:
      - exit without saving? popup on edit
      - popups on save?
      - popups on correct / incorrect?
      - next button? 

- Consider.

  - play moves automatically


  - timer?
  - sounds?

- Finalizing

  - initialize app data with example usage?
  - add licence to all the files + make repo public
