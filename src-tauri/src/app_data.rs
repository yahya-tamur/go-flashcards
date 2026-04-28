use serde::{Deserialize, Serialize};

use crate::color::Color;
use crate::go_rules::place_stone;
use crate::move_tree::MoveTree;

#[derive(Clone, Copy, Serialize, Deserialize, Default)]
pub struct GameState {
    pub stones: [[Option<Color>; 21]; 21],
    pub captures: (usize, usize),
    pub ko: Option<(usize, usize)>,
}

// two phases:
// setup phase:
// move_tree is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Default)]
pub struct AppData {
    pub game: GameState,
    pub move_tree: Option<MoveTree>,
    pub row: usize,
    pub col: usize,
}

impl AppData {
    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Color>) -> bool {
        if self.move_tree.is_none() {
            self.game.stones[i][j] = color;
            true
        } else {
            false
        }
    }

    pub fn initialize_tree(&mut self, color: Color) -> bool {
        if self.move_tree.is_none() {
            self.move_tree = Some(MoveTree {
                initial: self.game,
                initial_color: color,
                table: vec![vec![None]],
            });
            true
        } else {
            false
        }
    }

    pub fn play(&mut self, loc: Option<(usize, usize)>, color: Color) -> bool {
        if let Some(move_tree) = self.move_tree.as_mut() {
            // advance game state
            if let Some((i, j)) = loc {
                if !place_stone(&mut self.game, i, j, color) {
                    return false;
                }
            }
            (self.row, self.col) = move_tree.step(self.row, self.col, loc, color);
            true
        } else {
            false
        }
    }

    pub fn jump(&mut self, r: usize, c: usize) -> bool {
        if let Some(move_tree) = self.move_tree.as_mut() {
            if move_tree.table.len() <= r || move_tree.table[r].len() <= c {
                return false;
            }
            self.game = move_tree.jump(r, c);
            (self.row, self.col) = (r, c);
            true
        } else {
            false
        }
    }
}
