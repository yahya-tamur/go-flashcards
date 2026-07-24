use crate::Result;
use serde::{Deserialize, Serialize};
use specta::Type;
use specta_typescript::Number;

use crate::{
    config::ShowRecent,
    game::{Color, Mark, MoveTree, Variant},
};

#[derive(Serialize, Type)]
pub struct MoveSnapshot {
    #[specta(type = Option<(Number, Number)>)]
    pub loc: Option<(usize, usize)>,
    pub color: Color,
    pub variant: Variant,
}

#[derive(Serialize, Type)]
pub struct GameSnapshot {
    pub grid: Grid,
    #[specta(type = (Number, Number))]
    pub captures: (usize, usize),
    #[specta(type = Option<(Number, Number)>)]
    pub ko: Option<(usize, usize)>,
}

#[derive(Deserialize, Serialize, Type, Debug, Default, Clone)]
pub struct Loc {
    stone: Option<Color>,
    mark: Option<Mark>,
}

#[derive(Deserialize, Serialize, Type, Debug)]
pub struct Grid([[Loc; 19]; 19]);

#[derive(Serialize, Type)]
pub struct Snapshot {
    pub game: GameSnapshot,
    pub table: Vec<Vec<Option<MoveSnapshot>>>,
    #[specta(type = Number)]
    pub row: usize,
    #[specta(type = Number)]
    pub col: usize,
    pub color: Color,
    pub comment: String,
    pub variant: Variant,
    #[specta(type = (Number, Number, Number, Number))]
    pub window: (usize, usize, usize, usize),
    #[specta(type = Option<(Number, Number, Number, Number)>)]
    pub min_window: Option<(usize, usize, usize, usize)>,
    #[specta(type = Option<Vec<u32>>)]
    pub progress: Option<Vec<usize>>,
}

impl MoveTree {
    // 'loc' is not tree location but extra info to send to frontend --
    // it's current exercise , number of exercises.
    pub fn snapshot(move_tree: &MoveTree, progress: Option<Vec<usize>>) -> Result<Snapshot> {
        let (row, col) = move_tree.tree_loc;
        let current_move = move_tree.current()?;

        let table = move_tree
            .problem
            .table
            .iter()
            .map(|line| {
                line.iter()
                    .map(|movopt| {
                        movopt.as_ref().map(|mov| MoveSnapshot {
                            loc: mov.loc.map(|(i, j)| move_tree.send(i, j)),
                            color: move_tree.send_recv_color(mov.color),
                            variant: mov.variant,
                        })
                    })
                    .collect()
            })
            .collect();

        Ok(Snapshot {
            game: move_tree.snapshot_game(),
            table,
            row,
            col,
            color: move_tree.send_recv_color(current_move.color),
            comment: current_move.comment.clone(),
            variant: current_move.variant,
            progress,
            window: move_tree.send_window(move_tree.problem.window),
            min_window: move_tree.min_window().map(|w| move_tree.send_window(w)),
        })
    }

    fn snapshot_game(&self) -> GameSnapshot {
        let mut grid = [const {
            [const {
                Loc {
                    stone: None,
                    mark: None,
                }
            }; 19]
        }; 19];

        for (i, line) in grid.iter_mut().enumerate() {
            for (j, loc) in line.iter_mut().enumerate() {
                let (i_, j_) = self.recv(i, j);
                loc.stone = self.game.stones[i_][j_].map(|c| self.send_recv_color(c));
                loc.mark = self.game.marks[i_][j_].clone();
            }
        }

        match self.config.show_recent {
            ShowRecent::None => {}
            ShowRecent::Circle => {
                let n = Some(self.tree_loc.1);
                'a: for (i, line) in grid.iter_mut().enumerate() {
                    for (j, loc) in line.iter_mut().enumerate() {
                        let (i_, j_) = self.recv(i, j);
                        if self.game.numbers[i_][j_] == n {
                            loc.mark = Some(Mark::Circle);
                            break 'a;
                        }
                    }
                }
            }
            ShowRecent::Number => {
                for (i, line) in grid.iter_mut().enumerate() {
                    for (j, loc) in line.iter_mut().enumerate() {
                        let (i_, j_) = self.recv(i, j);
                        if let Some(n) = self.game.numbers[i_][j_] {
                            loc.mark = Some(Mark::Label(n.to_string()));
                        }
                    }
                }
            }
        }

        GameSnapshot {
            grid: Grid(grid),
            captures: self.game.captures,
            ko: self.game.ko,
        }
    }
}
