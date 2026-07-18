use super::{other_color, Color, GameState, Mark};
use crate::config::{ActiveConfig, ShowRecent};

use super::{Move, Problem, Variant};
use crate::interop::Transform;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::sync::Arc;

use rand::rng;
use rand::RngExt;
use serde::Deserialize;
use specta::Type;

#[derive(Clone, Debug)]
pub struct MoveTree {
    pub config: Arc<ActiveConfig>,
    pub problem: Problem,
    pub game: GameState,
    pub tree_loc: (usize, usize),
    new_branches: Vec<u64>,
    pub orientation: Transform,
    pub color_swap: bool,
}

#[derive(Deserialize, Type)]
pub enum StonePaint {
    Black,
    White,
    Delete,
}

#[derive(Deserialize, Type)]
pub enum MarkPaint {
    Circle,
    Triangle,
    Cross,
    Square,
    Label,
}

#[derive(Deserialize, Type)]
#[serde(tag = "layer", content = "value")]
pub enum Paint {
    #[serde(rename = "stone")]
    Stone(StonePaint),
    #[serde(rename = "mark")]
    Mark(MarkPaint),
}

#[derive(Deserialize, Type)]
pub enum RectangleMark {
    BlackTerritory,
    WhiteTerritory,
    DeleteMark,
}

impl MoveTree {
    pub fn new(config: Arc<ActiveConfig>, problem: &Problem) -> MoveTree {
        let problem = problem.clone();
        let mut game = GameState::default();
        for &(i, j) in problem.initial_black.iter() {
            game.stones[i][j] = Some(Color::Black);
        }
        for &(i, j) in problem.initial_white.iter() {
            game.stones[i][j] = Some(Color::White);
        }
        game.play_move(
            problem.table[0][0].as_ref().unwrap(),
            0,
            config.transfer_marks,
        );
        let orientation = if config.random_orientation {
            rng().random()
        } else {
            Transform::Id
        };
        let color_swap = if config.random_color {
            rng().random_bool(0.5)
        } else {
            false
        };

        MoveTree {
            config,
            problem,
            game,
            tree_loc: (0, 0),
            new_branches: Vec::new(),
            orientation,
            color_swap,
        }
    }

    pub fn save(&mut self) -> Problem {
        if self.problem.table.len() == 1 && self.problem.table[0].len() == 1 {
            self.finish_setup(None);
        }
        let mut problem = self.problem.clone();
        for r in 0..problem.table.len() {
            for c in 0..problem.table[r].len() {
                if let Some(mov) = problem.table[r][c].as_mut() {
                    if mov.variant == Variant::New {
                        mov.variant = Variant::None;
                    }
                }
            }
        }
        problem
    }

    pub fn finish_setup(&mut self, color: Option<Color>) {
        self.problem.initial_black.clear();
        self.problem.initial_white.clear();

        for i in 0..21 {
            for j in 0..21 {
                match self.game.stones[i][j] {
                    Some(Color::Black) => self.problem.initial_black.push((i, j)),
                    Some(Color::White) => self.problem.initial_white.push((i, j)),
                    _ => {}
                }
            }
        }

        if let Some(color) = color {
            self.problem.table[0][0].as_mut().unwrap().color = self.send_recv_color(color);
        }
    }

    // this should just not be called when not initializing.
    pub fn set_stones(&mut self, stones: Vec<(usize, usize, Color)>) {
        self.game.stones = [const { [const { None }; 21] }; 21];
        for (i, j, color) in stones {
            let (i, j) = self.recv(i, j);
            let color = self.send_recv_color(color);
            self.game.stones[i][j] = Some(color);
        }
    }

    pub fn play(&mut self, mut loc: Option<(usize, usize)>, study: bool) -> bool {
        if let Some((i, j)) = loc {
            loc = Some(self.recv(i, j));
        }

        let (r, c) = self.tree_loc;
        let color = other_color(self.problem.table[r][c].as_ref().unwrap().color);

        // check if step is on table

        for r_ in r..self.problem.table.len() {
            if self.problem.table[r_].len() <= c + 1 {
                continue;
            }
            if r_ > r && self.problem.table[r_][c].is_some() {
                break;
            }
            if let Some(mov) = &self.problem.table[r_][c + 1] {
                if mov.loc == loc && mov.color == color {
                    self.tree_loc = (r_, c + 1);
                    self.game.play_move(mov, c + 1, self.config.transfer_marks);
                    return true;
                }
            }
        }

        let new_move = Move {
            loc,
            comment: String::new(),
            color,
            variant: if study { Variant::New } else { Variant::None },
            marks: Vec::new(),
        };

        if !self
            .game
            .play_move(&new_move, c + 1, self.config.transfer_marks)
        {
            return false;
        }

        self.tree_loc = if self.problem.table[r].len() == c + 1 {
            self.problem.table[r].push(Some(new_move));
            (r, c + 1)
        } else {
            let mut r_ = r + 1;
            while r_ < self.problem.table.len()
                && self.problem.table[r_].len() > c
                && self.problem.table[r_][c].is_none()
            {
                r_ += 1;
            }

            self.problem.table.insert(r_, vec![None; c + 1]);
            self.problem.table[r_].push(Some(new_move));
            (r_, c + 1)
        };
        true
    }

    pub fn jump(&mut self, mut r: usize, mut c: usize) {
        self.tree_loc = (r, c);
        let mut moves: Vec<&Move> = Vec::new();

        while let Some(mov) = &self.problem.table[r][c] {
            moves.push(mov);
            if c == 0 {
                break;
            }
            c -= 1; // r might be 0 but not -1 after this
            while self.problem.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        self.game = GameState::default();
        for &(i, j) in self.problem.initial_black.iter() {
            self.game.stones[i][j] = Some(Color::Black);
        }
        for &(i, j) in self.problem.initial_white.iter() {
            self.game.stones[i][j] = Some(Color::White);
        }

        for (num, &mov) in moves.iter().rev().enumerate() {
            self.game.play_move(mov, num, self.config.transfer_marks);
        }
    }

    pub fn delete_branch(&mut self) -> bool {
        if self.tree_loc == (0, 0) {
            return false;
        }
        let (r, c) = self.tree_loc;
        let (mut pr, pc) = (r, c - 1);
        while self.problem.table[pr][pc].is_none() {
            pr -= 1;
        }
        self.jump(pr, pc);

        if r < self.problem.table.len() - 1
            && self.problem.table[r + 1].len() > c
            && self.problem.table[r + 1][c].is_none()
        {
            let (rl, mut rr) = (r + 1, r + 2);
            while rr < self.problem.table.len()
                && self.problem.table[rr].len() > c
                && self.problem.table[rr][c].is_none()
            {
                rr += 1;
            }
            self.problem.table.drain(rl..rr);
        }
        if r > 0 && self.problem.table[r][c - 1].is_none() {
            self.problem.table.remove(r);
        } else {
            self.problem.table[r].truncate(c);
            // move up other option for parent if it exists
            let mut nr = r + 1;
            while nr < self.problem.table.len() {
                if self.problem.table[nr].len() > c
                    && self.problem.table[nr][c - 1].is_none()
                    && self.problem.table[nr][c].is_some()
                {
                    let extn = self.problem.table[nr].split_off(c);
                    self.problem.table[r].extend(extn);
                    self.problem.table.remove(nr);
                    break;
                }
                nr += 1;
            }
        }
        true
    }

    pub fn collapse_tree(&mut self) {
        self.game.captures = (0, 0);
        self.game.ko = None;

        for i in 0..21 {
            for j in 0..21 {
                match self.game.stones[i][j] {
                    Some(Color::Black) => self.problem.initial_black.push((i, j)),
                    Some(Color::White) => self.problem.initial_white.push((i, j)),
                    _ => {}
                }
            }
        }

        let (r, c) = self.tree_loc;

        let comment = self.problem.table[0][0].as_ref().unwrap().comment.clone();
        let branch = self.problem.table[r].split_off(c);
        let mov = branch.into_iter().next().unwrap().unwrap();

        self.problem.table = vec![vec![Some(Move {
            loc: None,
            comment,
            color: Color::White,
            variant: Variant::None,
            marks: mov.marks,
        })]];

        self.tree_loc = (0, 0);
        self.game.numbers = [[None; 21]; 21];
    }

    pub fn set_window(&mut self, window: (usize, usize, usize, usize)) {
        let (row_start, row_end, col_start, col_end) = self.recv_window(window);

        let out_of_bounds = |r, c| r > row_end || r < row_start || c < col_start || c > col_end;
        self.problem.window = (row_start, row_end, col_start, col_end);

        for i in 0..21 {
            for j in 0..21 {
                if out_of_bounds(i, j) {
                    self.game.marks[i][j] = None;
                    self.game.stones[i][j] = None;
                }
            }
        }
    }

    pub fn min_window(&self) -> Option<(usize, usize, usize, usize)> {
        let (mut min_row, mut max_row, mut min_col, mut max_col) = (19, 1, 19, 1);

        for &(i, j) in self.problem.initial_black.iter() {
            min_row = min_row.min(i);
            max_row = max_row.max(i);
            min_col = min_col.min(j);
            max_col = max_col.max(j);
        }
        for &(i, j) in self.problem.initial_white.iter() {
            min_row = min_row.min(i);
            max_row = max_row.max(i);
            min_col = min_col.min(j);
            max_col = max_col.max(j);
        }

        for line in self.problem.table.iter() {
            for mov in line.iter().flatten() {
                if let Some((i, j)) = mov.loc {
                    min_row = min_row.min(i);
                    max_row = max_row.max(i);
                    min_col = min_col.min(j);
                    max_col = max_col.max(j);
                }
                for &(i, j, ref _mark) in mov.marks.iter() {
                    min_row = min_row.min(i);
                    max_row = max_row.max(i);
                    min_col = min_col.min(j);
                    max_col = max_col.max(j);
                }
            }
        }
        if min_row <= max_row {
            Some((min_row, max_row, min_col, max_col))
        } else {
            None
        }
    }

    fn signature(&self) -> u64 {
        let (mut r, mut c) = self.tree_loc;
        let mut hasher = DefaultHasher::new();

        let mut moves: Vec<(Option<(usize, usize)>, Color)> = Vec::new();

        while let Some(mov) = &self.problem.table[r][c] {
            moves.push((mov.loc, mov.color));
            if c == 0 {
                break;
            }
            c -= 1; // r might be 0 but not -1 after this
            while self.problem.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        moves.hash(&mut hasher);

        hasher.finish()
    }

    pub fn set_variant(&mut self, v: Variant, study: bool) {
        let (r, c) = self.tree_loc;

        if !study {
            self.problem.table[r][c].as_mut().unwrap().variant = v;
            return;
        }

        let old_v = self.problem.table[r][c].as_ref().unwrap().variant;
        let signature = self.signature();

        if old_v == Variant::New && !self.new_branches.contains(&signature) {
            self.new_branches.push(signature);
        }

        if v == Variant::None && self.new_branches.contains(&signature) {
            self.problem.table[r][c].as_mut().unwrap().variant = Variant::New;
        } else {
            self.problem.table[r][c].as_mut().unwrap().variant = v;
        }
    }

    pub fn current_mut(&mut self) -> &mut Move {
        let (r, c) = self.tree_loc;
        self.problem.table[r][c].as_mut().unwrap()
    }

    pub fn current(&self) -> &Move {
        let (r, c) = self.tree_loc;
        self.problem.table[r][c].as_ref().unwrap()
    }

    pub fn paint(&mut self, paint: Paint, locs: Vec<(usize, usize)>, label: String) {
        match paint {
            Paint::Stone(stone) => {
                for (i, j) in locs.into_iter() {
                    let (i, j) = self.recv(i, j);
                    self.game.stones[i][j] = match stone {
                        StonePaint::Black => Some(self.send_recv_color(Color::Black)),
                        StonePaint::White => Some(self.send_recv_color(Color::White)),
                        StonePaint::Delete => None,
                    };
                }
            }
            Paint::Mark(mark) => {
                let mark = match mark {
                    MarkPaint::Circle => Mark::Circle,
                    MarkPaint::Cross => Mark::Cross,
                    MarkPaint::Square => Mark::Square,
                    MarkPaint::Triangle => Mark::Triangle,
                    MarkPaint::Label => Mark::Label(label),
                };
                for (i, j) in locs.into_iter() {
                    let (i, j) = self.recv(i, j);
                    if match self.config.show_recent {
                        ShowRecent::Number => self.game.numbers[i][j].is_some(),
                        ShowRecent::Circle => self.game.numbers[i][j] == Some(self.tree_loc.1),
                        ShowRecent::None => false,
                    } {
                        continue;
                    }
                    self.game.marks[i][j] = Some(mark.clone());
                    self.current_mut().marks.push((i, j, mark.clone()));
                }
            }
        }
    }

    pub fn mark_rectangle(
        &mut self,
        mark: RectangleMark,
        start: (usize, usize),
        end: (usize, usize),
    ) {
        let (row_start, row_end, col_start, col_end) =
            self.recv_window((start.0, end.0, start.1, end.1));

        let (r, c) = self.tree_loc;
        self.problem.table[r][c]
            .as_mut()
            .unwrap()
            .marks
            .retain(|&(i, j, ref _mark)| {
                if i > row_end || i < row_start || j < col_start || j > col_end {
                    return true;
                }
                match self.config.show_recent {
                    ShowRecent::Number => self.game.numbers[i][j].is_some(),
                    ShowRecent::Circle => self.game.numbers[i][j] == Some(self.tree_loc.1),
                    ShowRecent::None => false,
                }
            });

        for i in row_start..=row_end {
            for j in col_start..=col_end {
                if match self.config.show_recent {
                    ShowRecent::Number => self.game.numbers[i][j].is_some(),
                    ShowRecent::Circle => self.game.numbers[i][j] == Some(self.tree_loc.1),
                    ShowRecent::None => false,
                } {
                    continue;
                }
                match mark {
                    RectangleMark::BlackTerritory => {
                        self.current_mut().marks.push((i, j, Mark::BlackTerritory));
                        self.game.marks[i][j] = Some(Mark::BlackTerritory);
                    }
                    RectangleMark::WhiteTerritory => {
                        self.current_mut().marks.push((i, j, Mark::WhiteTerritory));
                        self.game.marks[i][j] = Some(Mark::WhiteTerritory);
                    }
                    RectangleMark::DeleteMark => {
                        self.game.marks[i][j] = None;
                    }
                }
            }
        }
    }
}
