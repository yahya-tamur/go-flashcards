use crate::common::{other_color, GameState, Stone};
use crate::go_rules::place_stone;
use serde::{Deserialize, Serialize};

// there is no initial colorless node, but
// multiple nodes can have parent = -1 and current position can be -1 too.
#[derive(Clone, Serialize, Deserialize)]
pub struct Move {
    pub loc: Option<(usize, usize)>,
    pub comment: String,
    pub color: Stone,
}

// this thing is designed to be serialized and written to file.
#[derive(Clone, Serialize, Deserialize)]
pub struct MoveTree {
    initial: GameState,
    initial_color: Stone,
    pub table: Vec<Vec<Option<Move>>>,
}

// two phases:
// setup phase:
// move_tree is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Serialize, Deserialize, Default)]
pub struct AppData {
    pub game: GameState,
    pub move_tree: Option<MoveTree>,
}

impl AppData {
    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Stone>) -> bool {
        if self.move_tree.is_none() {
            self.game.stones[i][j] = color;
            true
        } else {
            false
        }
    }

    pub fn initialize_tree(&mut self, color: Stone) -> bool {
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

    pub fn play(
        &mut self,
        loc: Option<(usize, usize)>,
        r: usize,
        c: usize,
        color: Stone,
    ) -> Option<(usize, usize)> {
        if let Some(move_tree) = self.move_tree.as_mut() {
            // advance game state
            if let Some((i, j)) = loc {
                if !place_stone(&mut self.game, i, j, color) {
                    return None;
                }
            }
            Some(move_tree.step(r, c, loc, color))
        } else {
            None
        }
    }

    pub fn jump(&mut self, r: usize, c: usize) -> bool {
        if let Some(move_tree) = self.move_tree.as_mut() {
            if move_tree.table.len() <= r || move_tree.table[r].len() <= c {
                return false;
            }
            self.game = move_tree.jump(r, c);
            true
        } else {
            false
        }
    }
}

impl MoveTree {
    fn step(
        &mut self,
        r: usize,
        c: usize,
        loc: Option<(usize, usize)>,
        color: Stone,
    ) -> (usize, usize) {
        // check if step is on table

        for r_ in r..self.table.len() {
            if self.table[r_].len() <= c + 1 {
                continue;
            }
            if r_ > r && self.table[r_][c].is_some() {
                break;
            }
            if let Some(mov) = &self.table[r_][c + 1] {
                if mov.loc == loc && mov.color == color {
                    return (r_, c + 1);
                }
            }
        }

        let new_move = Some(Move {
            loc,
            comment: String::new(),
            color,
        });

        if self.table[r].len() == c + 1 {
            self.table[r].push(new_move);
            (r, c + 1)
        } else {
            self.table.insert(r + 1, vec![None; c + 1]);
            self.table[r + 1].push(new_move);
            (r + 1, c + 1)
        }
    }

    //pub fn delete(&mut self) -> bool {
    //    true
    //}

    fn jump(&mut self, mut r: usize, mut c: usize) -> GameState {
        let mut moves: Vec<Option<(usize, usize)>> = Vec::new();

        while let Some(mov) = &self.table[r][c] {
            moves.push(mov.loc);
            c -= 1; // r might be 0 but not -1 after this
            while self.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        let mut newgame = self.initial;
        let mut color = self.initial_color;

        for &loc in moves.iter().rev() {
            if let Some((i, j)) = loc {
                place_stone(&mut newgame, i, j, color);
            }
            color = other_color(color);
        }

        newgame
    }
}
