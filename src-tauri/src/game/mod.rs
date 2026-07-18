pub mod game_state;
pub mod move_tree;
pub mod problem;

pub use game_state::{other_color, Color, GameState, Mark};
pub use move_tree::{MoveTree, Paint, RectangleMark};
pub use problem::{Move, Problem, Variant};
