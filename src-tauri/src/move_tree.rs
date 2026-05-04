use crate::app_data::GameState;
use crate::color::Color;
use crate::go_rules::place_stone;
use serde::{Deserialize, Serialize};


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
    pub initial: GameState,
    pub table: Vec<Vec<Option<Move>>>,
}

// MoveTree + location information
#[derive(Debug)]
pub struct TreeData {
    pub move_tree: MoveTree,
    pub row: usize,
    pub col: usize,
}

impl TreeData {
    pub fn step(&mut self, loc: Option<(usize, usize)>, color: Color) {
        (self.row, self.col) = self.move_tree.step(self.row, self.col, loc, color);
    }

    pub fn color(&self) -> Result<Color, String> {
        self.move_tree.table[self.row][self.col]
            .as_ref()
            .map(|a| a.color)
            .ok_or("error".to_string())

    }

    pub fn comment(&self) -> Result<String, String> {
        self.move_tree.table[self.row][self.col]
            .as_ref()
            .map(|a| a.comment.clone())
            .ok_or("error".to_string())
    }

    pub fn set_comment(&mut self, comment: String) -> Result<(), String> {
        self.move_tree.table[self.row][self.col].as_mut().map(|mov| {mov.comment = comment;}).ok_or("error".to_string())
    }

    pub fn mark(&self) -> Result<Variant, String> {
        self.move_tree.table[self.row][self.col]
            .as_ref()
            .map(|a| a.variant)
            .ok_or("error".to_string())
    }

    pub fn set_mark(&mut self, variant: Variant) -> Result<(), String> {
        println!("{:?}", variant);
        self.move_tree.table[self.row][self.col].as_mut().map(|mov| {mov.variant = variant;}).ok_or("error".to_string())
    }
}

impl MoveTree {
    pub fn step(
        &mut self,
        r: usize,
        c: usize,
        loc: Option<(usize, usize)>,
        color: Color,
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
            variant: Variant::None,
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

    //pub fn delete(&mut self) -> bool {
    //    true
    //}

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
