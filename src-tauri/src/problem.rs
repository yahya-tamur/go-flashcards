use crate::game_state::{Color, GameState, Mark};

use uuid::Uuid;

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Debug)]
#[repr(u8)]
pub enum Variant {
    Correct,
    Incorrect,
    None,
    New,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Move {
    pub loc: Option<(usize, usize)>,
    pub comment: String,
    pub color: Color,
    pub variant: Variant,
    pub marks: Vec<(usize, usize, Mark)>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
pub struct Problem {
    pub id: Uuid,
    pub initial: GameState,
    pub table: Vec<Vec<Option<Move>>>,

    pub window: (usize, usize, usize, usize),
}

impl Default for Problem {
    fn default() -> Problem {
        Problem {
            id: Uuid::new_v4(),
            table: vec![vec![Some(Move {
                loc: None,
                color: Color::White,
                comment: String::new(),
                variant: Variant::None,
                marks: Vec::new(),
            })]],
            initial: GameState::default(),
            window: (0, 18, 0, 18),
        }
    }
}
