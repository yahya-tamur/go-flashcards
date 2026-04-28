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
