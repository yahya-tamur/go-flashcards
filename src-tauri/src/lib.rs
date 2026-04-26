// refactor later I guess

pub mod go_rules;

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
#[repr(u8)]
pub enum Stone {
    Black = 0,
    White = 1,
}

pub fn other_color(c: Stone) -> Stone {
    match c {
        Stone::Black => Stone::White,
        Stone::White => Stone::Black,
    }
}

#[derive(Clone, Copy, Serialize, Deserialize, Default)]
pub struct GameState {
    pub stones: [[Option<Stone>; 21]; 21],
    pub captures: (usize, usize),
    pub ko: Option<(usize, usize)>,
}

#[derive(Serialize, Deserialize, Default)]
pub struct MoveTree {
    pub game: GameState,
}

#[derive(Serialize, Deserialize, Default)]
pub struct AppData {
    pub move_tree: MoveTree,
}

use serde::{Deserialize, Serialize};
