use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
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

#[derive(Clone, Copy, Serialize, Deserialize, Debug)]
pub struct GameState {
    // only used for display.
    pub window: (usize, usize, usize, usize),
    pub stones: [[Option<Color>; 21]; 21],
    pub captures: (usize, usize),
    pub ko: Option<(usize, usize)>,
}

impl Default for GameState {
    fn default() -> GameState {
        GameState {
            // only used for display.
            window: (0, 18, 0, 18),
            stones: [[None; 21]; 21],
            captures: (0, 0),
            ko: None,
        }
    }
}

fn try_capture(
    board: &[[Option<Color>; 21]; 21],
    i: usize,
    j: usize,
    color: Color,
    captures: &mut Vec<(usize, usize)>,
) {
    let out_of_bounds = |i, j| i == 0 || i == 20 || j == 0 || j == 20;

    if out_of_bounds(i, j) || board[i][j] != Some(color) {
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

            match board[i_][j_] {
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

pub fn place_stone(game: &mut GameState, i: usize, j: usize, color: Color) -> bool {
    if game.ko == Some((i, j)) {
        return false;
    }
    game.ko = None;

    game.stones[i][j] = Some(color);
    let mut captures: Vec<(usize, usize)> = Vec::with_capacity(20);

    try_capture(&game.stones, i - 1, j, other_color(color), &mut captures);
    try_capture(&game.stones, i + 1, j, other_color(color), &mut captures);
    try_capture(&game.stones, i, j - 1, other_color(color), &mut captures);
    try_capture(&game.stones, i, j + 1, other_color(color), &mut captures);
    if captures.len() > 1 {
        for &(i_, j_) in &captures {
            game.stones[i_][j_] = None;
        }
        match other_color(color) {
            Color::Black => game.captures.0 += captures.len(),
            Color::White => game.captures.1 += captures.len(),
        }
        true
    } else if captures.len() == 1 {
        let (i_, j_) = captures.pop().unwrap();
        try_capture(&game.stones, i, j, color, &mut captures);
        if captures.len() == 1 {
            game.ko = Some((i_, j_));
        }
        game.stones[i_][j_] = None;
        match other_color(color) {
            Color::Black => game.captures.0 += 1,
            Color::White => game.captures.1 += 1,
        }
        true
    } else {
        try_capture(&game.stones, i, j, color, &mut captures);
        if !captures.is_empty() {
            game.stones[i][j] = None;
            false
        } else {
            true
        }
    }
}
