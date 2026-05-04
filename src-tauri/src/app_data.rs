use serde::{Deserialize, Serialize};

use crate::color::Color;
use crate::go_rules::place_stone;
use crate::move_tree::{Variant, Move, MoveTree, TreeData};

#[derive(Clone, Copy, Serialize, Deserialize, Default, Debug)]
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
    pub tree_data: Option<TreeData>,
}

impl AppData {
    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Color>) -> bool {
        if self.tree_data.is_none() {
            self.game.stones[i][j] = color;
            true
        } else {
            false
        }
    }

    pub fn play(&mut self, loc: Option<(usize, usize)>, color: Color) -> bool {
        if let Some(tree_data) = self.tree_data.as_mut() {
            // advance game state
            if let Some((i, j)) = loc {
                if !place_stone(&mut self.game, i, j, color) {
                    return false;
                }
            }
            tree_data.step(loc, color);
            true
        } else {
            false
        }
    }

    pub fn jump(&mut self, r: usize, c: usize) -> bool {
        if let Some(tree_data) = self.tree_data.as_mut() {
            if tree_data.move_tree.table.len() <= r || tree_data.move_tree.table[r].len() <= c {
                return false;
            }
            self.game = tree_data.move_tree.jump(r, c);
            (tree_data.row, tree_data.col) = (r, c);
            true
        } else {
            false
        }
    }

    pub fn initialize_tree(&mut self, color: Color) -> bool {
        self.game.captures = (0, 0);
        self.game.ko = None;
        if self.tree_data.is_none() {
            self.tree_data = Some(TreeData {
                move_tree: MoveTree {
                    initial: self.game,
                    table: vec![vec![Some(Move {
                        loc: None,
                        color: color,
                        comment: String::new(),
                        variant: Variant::None,
                    })]],
                },
                row: 0,
                col: 0,
            });
            true
        } else {
            false
        }
    }

    pub fn collapse_tree(&mut self) -> bool {
        if self.tree_data.is_none() {
            false
        } else {
            self.game.captures = (0, 0);
            self.game.ko = None;
            self.tree_data = None;
            true
        }
    }

    // caller will account for border themselves. values inclusive
    pub fn clear_to(&mut self, rows: (usize, usize), cols: (usize, usize)) -> bool {
        let (row_start, row_end) = rows;
        let (col_start, col_end) = cols;
        if self.tree_data.is_some() {
            false
        } else {
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

}
