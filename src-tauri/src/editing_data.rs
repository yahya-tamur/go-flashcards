use uuid::Uuid;

use crate::go_rules::{place_stone, Color, GameState};
use crate::move_tree::{Move, MoveTree, Variant};

// setup phase:
// tree_loc is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Default, Debug)]
pub struct EditingData {
    pub game: GameState,
    pub tree_loc: Option<(usize, usize)>,
    pub exercises: Vec<MoveTree>,
    // should this also be an option?
    pub current_exercise: usize,
}

impl EditingData {
    pub fn jump_to_exercise(&mut self, index: usize) {
        self.current_exercise = index;
        self.game = self.exercises[index].initial;
        self.tree_loc = Some((0, 0));
    }

    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Color>) -> bool {
        if self.tree_loc.is_none() {
            self.game.stones[i][j] = color;
            true
        } else {
            false
        }
    }

    pub fn play(&mut self, loc: Option<(usize, usize)>, color: Color) -> bool {
        if let Some((row, column)) = self.tree_loc {
            // advance state
            if let Some((i, j)) = loc {
                if !place_stone(&mut self.game, i, j, color) {
                    return false;
                }
            }
            self.tree_loc =
                Some(self.exercises[self.current_exercise].step(row, column, loc, color));
            true
        } else {
            false
        }
    }

    pub fn jump(&mut self, r: usize, c: usize) -> bool {
        if self.tree_loc.is_some() {
            // decided to do no error handling here.
            self.game = self.exercises[self.current_exercise].jump(r, c);
            self.tree_loc = Some((r, c));
            true
        } else {
            false
        }
    }

    pub fn start_setup(&mut self, index: usize) -> bool {
        if self.tree_loc.is_some() {
            self.game = GameState::default();
            self.current_exercise = index;
            self.tree_loc = None;
            true
        } else {
            false
        }
    }

    pub fn finish_setup(&mut self, color: Color) -> bool {
        if self.tree_loc.is_none() {
            self.game.captures = (0, 0);
            self.game.ko = None;
            self.exercises.insert(
                self.current_exercise,
                MoveTree {
                    id: Uuid::new_v4(),
                    initial: self.game,
                    table: vec![vec![Some(Move {
                        loc: None,
                        color,
                        comment: String::new(),
                        variant: Variant::None,
                    })]],
                },
            );
            self.tree_loc = Some((0, 0));
            true
        } else {
            false
        }
    }

    pub fn collapse_tree(&mut self) -> bool {
        if self.tree_loc.is_none() {
            false
        } else {
            self.game.captures = (0, 0);
            self.exercises.remove(self.current_exercise);
            self.game.ko = None;
            self.tree_loc = None;
            true
        }
    }

    // caller will account for border themselves. values inclusive
    pub fn clear_to(&mut self, rows: (usize, usize), cols: (usize, usize)) -> bool {
        if self.tree_loc.is_some() {
            false
        } else {
            let (row_start, row_end) = rows;
            let (col_start, col_end) = cols;
            for i in 0..21 {
                for j in 0..21 {
                    if i > row_end || i < row_start || j < col_start || j > col_end {
                        self.game.stones[i][j] = None;
                    }
                }
            }
            true
        }
    }

    pub fn get_current_move_mut(&mut self) -> Option<&mut Move> {
        let (row, col) = self.tree_loc?;

        self.exercises
            .get_mut(self.current_exercise)?
            .table
            .get_mut(row)?
            .get_mut(col)?
            .as_mut()
    }

    pub fn get_current_move(&self) -> Option<&Move> {
        let (row, col) = self.tree_loc?;

        self.exercises
            .get(self.current_exercise)?
            .table
            .get(row)?
            .get(col)?
            .as_ref()
    }
}
