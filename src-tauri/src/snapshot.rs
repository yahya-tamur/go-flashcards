use serde::Serialize;

use crate::{
    config::ShowRecent,
    game_state::{Color, Mark},
    move_tree::MoveTree,
    problem::Variant,
};

#[derive(Serialize)]
pub struct MoveSnapshot {
    pub loc: Option<(usize, usize)>,
    pub color: Color,
    pub variant: Variant,
}

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
    pub table: Vec<Vec<Option<MoveSnapshot>>>,
    pub row: usize,
    pub col: usize,
    pub color: Color,
    pub comment: String,
    pub variant: Variant,
    pub current_location: usize,
    pub max_location: usize,
    pub window: (usize, usize, usize, usize),
    pub min_window: Option<(usize, usize, usize, usize)>,
}

impl MoveTree {
    // 'loc' is not tree location but extra info to send to frontend --
    // it's current exercise , number of exercises.
    pub fn snapshot(&self, loc: (usize, usize)) -> Snapshot {
        let (row, col) = self.tree_loc;
        let current_move = self.current();

        let table = self
            .problem
            .table
            .iter()
            .map(|line| {
                line.iter()
                    .map(|movopt| {
                        movopt.as_ref().map(|mov| MoveSnapshot {
                            loc: mov.loc.map(|(i, j)| self.send(i, j)),
                            color: self.send_recv_color(mov.color),
                            variant: mov.variant,
                        })
                    })
                    .collect()
            })
            .collect();

        Snapshot {
            game: self.snapshot_game(),
            table,
            row,
            col,
            color: self.send_recv_color(current_move.color),
            comment: current_move.comment.clone(),
            variant: current_move.variant,
            current_location: loc.0,
            max_location: loc.1,
            window: self.send_window(self.problem.window),
            min_window: self.min_window().map(|w| self.send_window(w)),
        }
    }

    fn snapshot_game(&self) -> GameSnapshot {
        let mut stones = [[None; 19]; 19];
        let mut marks = [const { [const { None }; 19] }; 19];

        for i in 0..19 {
            for j in 0..19 {
                let (i_, j_) = self.recv(i, j);
                stones[i][j] = self.game.stones[i_][j_].map(|c| self.send_recv_color(c));
                marks[i][j] = self.game.marks[i_][j_].clone();
            }
        }

        match self.config.show_recent {
            ShowRecent::None => {}
            ShowRecent::Circle => {
                let n = Some(self.tree_loc.1);
                'a: for (i, line) in marks.iter_mut().enumerate() {
                    for (j, mark) in line.iter_mut().enumerate() {
                        let (i_, j_) = self.recv(i, j);
                        if self.game.numbers[i_][j_] == n {
                            *mark = Some(Mark::Circle);
                            break 'a;
                        }
                    }
                }
            }
            ShowRecent::Number => {
                for (i, line) in marks.iter_mut().enumerate() {
                    for (j, mark) in line.iter_mut().enumerate() {
                        let (i_, j_) = self.recv(i, j);
                        if let Some(n) = self.game.numbers[i_][j_] {
                            *mark = Some(Mark::Label(n.to_string()));
                        }
                    }
                }
            }
        }

        GameSnapshot {
            stones,
            marks,
            captures: self.game.captures,
            ko: self.game.ko,
        }
    }
}
