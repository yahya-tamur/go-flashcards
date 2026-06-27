use serde::{Deserialize, Serialize};
use std::hash::Hash;

use crate::problem::Move;

#[derive(Clone, PartialEq, Eq, Debug, Serialize, Deserialize)]
pub enum Mark {
    Triangle,
    Circle,
    Square,
    Cross,
    BlackTerritory,
    WhiteTerritory,
    Label(String),
}

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize, Hash)]
#[repr(u8)]
pub enum Color {
    Black = 0,
    White = 1,
}

pub fn other_color(c: Color) -> Color {
    match c {
        Color::Black => Color::White,
        Color::White => Color::Black,
    }
}

#[derive(Clone, Serialize, Deserialize, Debug, PartialEq, Eq)]
pub struct GameState {
    pub stones: [[Option<Color>; 21]; 21],

    #[serde(default, skip_serializing)]
    pub captures: (usize, usize),
    #[serde(default, skip_serializing)]
    pub ko: Option<(usize, usize)>,
    #[serde(default, skip_serializing)]
    pub marks: [[Option<Mark>; 21]; 21],
    #[serde(default, skip_serializing)]
    pub numbers: [[Option<usize>; 21]; 21],
}

impl Default for GameState {
    fn default() -> GameState {
        GameState {
            stones: [[None; 21]; 21],
            captures: (0, 0),
            ko: None,
            marks: [const { [const { None }; 21] }; 21],
            numbers: Default::default(),
        }
    }
}

impl GameState {
    fn try_capture(&self, i: usize, j: usize, color: Color, captures: &mut Vec<(usize, usize)>) {
        let out_of_bounds = |i, j| i == 0 || i == 20 || j == 0 || j == 20;

        if out_of_bounds(i, j) || self.stones[i][j] != Some(color) {
            return;
        }

        let prev_size = captures.len();

        let mut n = captures.len();
        captures.push((i, j));

        while n < captures.len() {
            let (i, j) = captures[n];
            for &(i_, j_) in [(i + 1, j), (i - 1, j), (i, j - 1), (i, j + 1)].iter() {
                if out_of_bounds(i_, j_) {
                    continue;
                }

                match self.stones[i_][j_] {
                    None => {
                        captures.truncate(prev_size);
                        return;
                    }
                    Some(color_) if color == color_ && !captures.contains(&(i_, j_)) => {
                        captures.push((i_, j_));
                    }
                    _ => {}
                }
            }
            n += 1;
        }
    }

    fn try_play(&mut self, i: usize, j: usize, color: Color) -> Option<Vec<(usize, usize)>> {
        if self.ko == Some((i, j)) || self.stones[i][j].is_some() {
            return None;
        }
        self.ko = None;

        self.stones[i][j] = Some(color);

        let mut captures: Vec<(usize, usize)> = Vec::with_capacity(20);

        self.try_capture(i - 1, j, other_color(color), &mut captures);
        self.try_capture(i + 1, j, other_color(color), &mut captures);
        self.try_capture(i, j - 1, other_color(color), &mut captures);
        self.try_capture(i, j + 1, other_color(color), &mut captures);

        if captures.is_empty() {
            let mut captures_ = Vec::<(usize, usize)>::new();
            self.try_capture(i, j, color, &mut captures_);
            if !captures_.is_empty() {
                self.stones[i][j] = None;
                return None;
            }
        }

        if captures.len() == 1 {
            let mut captures_ = Vec::<(usize, usize)>::new();
            self.try_capture(i, j, color, &mut captures_);
            if captures_.len() == 1 {
                self.ko = Some(captures[0]);
            }
        }
        Some(captures)
    }

    pub fn play_move(&mut self, mov: &Move, number: usize, transfer_marks: bool) -> bool {
        if !transfer_marks {
            self.marks = [const { [const { None }; 21] }; 21];
        }
        if let Some((i, j)) = mov.loc {
            let Some(captures) = self.try_play(i, j, mov.color) else {
                return false;
            };

            for &(i_, j_) in &captures {
                self.stones[i_][j_] = None;
                self.marks[i_][j_] = None;
            }
            match other_color(mov.color) {
                Color::Black => self.captures.0 += captures.len(),
                Color::White => self.captures.1 += captures.len(),
            }

            self.marks[i][j] = None;
            self.numbers[i][j] = Some(number);
        }

        for &(i, j, ref mark) in &mov.marks {
            self.marks[i][j] = Some(mark.clone());
        }

        true
    }
}
