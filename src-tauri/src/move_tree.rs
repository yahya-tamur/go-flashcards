use crate::go_rules::{place_stone, Color, GameState};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Debug)]
#[repr(u8)]
pub enum Variant {
    Correct,
    Incorrect,
    None,
    New,
}

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize, Debug)]
pub struct Move {
    pub loc: Option<(usize, usize)>,
    pub comment: String,
    pub color: Color,
    pub variant: Variant,
}

// this struct is designed to be serialized and written to file.
#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct MoveTree {
    pub id: Uuid,
    pub initial: GameState,
    pub table: Vec<Vec<Option<Move>>>,
}

impl Default for MoveTree {
    fn default() -> MoveTree {
        MoveTree {
            id: Uuid::new_v4(),
            initial: GameState::default(),
            table: vec![vec![Some(Move {
                loc: None,
                color: Color::White,
                comment: String::new(),
                variant: Variant::None,
            })]],
        }
    }
}

impl MoveTree {
    pub fn step(
        &mut self,
        r: usize,
        c: usize,
        loc: Option<(usize, usize)>,
        color: Color,
        mark_new: bool,
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
            variant: if mark_new {
                Variant::New
            } else {
                Variant::None
            },
        });

        if self.table[r].len() == c + 1 {
            self.table[r].push(new_move);
            (r, c + 1)
        } else {
            let mut r_ = r + 1;
            while r_ < self.table.len() && self.table[r_].len() > c && self.table[r_][c].is_none() {
                r_ += 1;
            }

            self.table.insert(r_, vec![None; c + 1]);
            self.table[r_].push(new_move);
            (r_, c + 1)
        }
    }

    pub fn delete(&mut self, r: usize, c: usize) -> bool {
        if (r == 0) && (c == 0) {
            return false;
        }
        if r < self.table.len() - 1 && self.table[r + 1][c].is_none() {
            let (rl, mut rr) = (r + 1, r + 2);
            while rr < self.table.len() && self.table[rr][c].is_none() {
                rr += 1;
            }
            self.table.drain(rl..rr);
        }
        if r > 1 && self.table[r - 1][c].is_none() {
            self.table.remove(r);
        } else {
            self.table[r].truncate(c);
            // move up other option for parent if it exists
            let mut nr = r + 1;
            while nr < self.table.len() {
                if self.table[nr].len() > c
                    && self.table[nr][c - 1].is_none()
                    && self.table[nr][c].is_some()
                {
                    let extn = self.table[nr].split_off(c);
                    self.table[r].extend(extn);
                    self.table.remove(nr);
                    break;
                }
                nr += 1;
            }
        }
        true
    }

    pub fn jump(&mut self, mut r: usize, mut c: usize) -> GameState {
        let mut moves: Vec<&Move> = Vec::new();

        while let Some(mov) = &self.table[r][c] {
            moves.push(mov);
            if c == 0 {
                break;
            }
            c -= 1; // r might be 0 but not -1 after this
            while self.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        let mut newgame = self.initial;

        for &mov in moves.iter().rev() {
            if let Some((i, j)) = mov.loc {
                place_stone(&mut newgame, i, j, mov.color);
            }
        }

        newgame
    }
}
