use super::{Color, Mark};

use specta::Type;
use uuid::Uuid;

use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Debug, Type)]
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
    pub initial_black: Vec<(usize, usize)>,
    pub initial_white: Vec<(usize, usize)>,
    pub table: Vec<Vec<Option<Move>>>,

    pub window: (usize, usize, usize, usize),
}

impl Default for Move {
    fn default() -> Move {
        Move {
            loc: None,
            color: Color::White,
            comment: String::new(),
            variant: Variant::None,
            marks: Vec::new(),
        }
    }
}

impl Default for Problem {
    fn default() -> Problem {
        Problem {
            id: Uuid::new_v4(),
            table: vec![vec![Some(Move::default())]],
            initial_black: Vec::new(),
            initial_white: Vec::new(),
            window: (1, 19, 1, 19),
        }
    }
}
