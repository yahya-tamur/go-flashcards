use serde::Serialize;

use crate::{
    config::{ActiveConfig, ShowRecent},
    game_state::{Color, GameState, Mark},
    move_tree::MoveTree,
    problem::{Move, Variant},
};

#[derive(Serialize)]
pub struct GameSnapshot {
    pub stones: [[Option<Color>; 19]; 19],
    pub captures: (usize, usize),
    pub ko: Option<(usize, usize)>,
    pub marks: [[Option<Mark>; 19]; 19],
}

#[derive(Serialize)]
pub struct Snapshot {
    pub game: GameSnapshot,
    pub table: Vec<Vec<Option<Move>>>,
    pub row: usize,
    pub col: usize,
    pub color: Color,
    pub comment: String,
    pub variant: Variant,
    pub current_location: usize,
    pub max_location: usize,
    pub window: (usize, usize, usize, usize)
}

//transform will be applied here.
fn snapshot_game(game: &GameState, config: &ActiveConfig) -> GameSnapshot {
    let mut stones = [[None; 19]; 19];
    let mut marks = [const { [const { None }; 19] }; 19];
    for i in 0..19 {
        stones[i][..].copy_from_slice(&game.stones[i][1..=19]);
        marks[i][..].clone_from_slice(&game.marks[i][1..=19]);
    }

    match config.show_recent {
        ShowRecent::None => {}
        ShowRecent::Circle => {
            let mut n = None;
            for row in game.numbers {
                for m in row {
                    if m > n {
                        n = m;
                    }
                }
            }
            if let Some(n) = n {
                for (i, row) in game.numbers.iter().enumerate() {
                    for (j, num) in row.iter().enumerate() {
                        if *num == Some(n) {
                            marks[i - 1][j - 1] = Some(Mark::Circle);
                        }
                    }
                }
            }
        }
        ShowRecent::Number => {
            for (i, row) in game.numbers.iter().enumerate() {
                for (j, n) in row.iter().enumerate() {
                    if let Some(n) = n {
                        marks[i - 1][j - 1] = Some(Mark::Label(n.to_string()));
                    }
                }
            }
        }
    }

    // apply transform...

    GameSnapshot {
        stones,
        marks,
        captures: game.captures,
        ko: game.ko,
    }
}

//copies game and tree. If tauri serializes anyway, is that necessary?
pub fn snapshot(move_tree: &MoveTree, loc: (usize, usize), config: &ActiveConfig) -> Snapshot {
    let (row, col) = move_tree.tree_loc;
    let current_move = move_tree.current();
    Snapshot {
        game: snapshot_game(&move_tree.game.clone(), config),
        table: move_tree.problem.table.clone(),
        row,
        col,
        color: current_move.color,
        comment: current_move.comment.clone(),
        variant: current_move.variant,
        current_location: loc.0,
        max_location: loc.1,
        window: move_tree.problem.window,
    }
}
