use crate::go_rules::{Color, GameState};
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
