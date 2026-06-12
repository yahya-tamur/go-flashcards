use crate::game_state::{Color, GameState, Mark};

use std::hash::{DefaultHasher, Hash, Hasher};
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

#[derive(Clone, PartialEq, Eq, Serialize, Deserialize, Debug)]
pub struct Move {
    pub loc: Option<(usize, usize)>,
    pub comment: String,
    pub color: Color,
    pub variant: Variant,
    pub marks: Vec<(usize, usize, Mark)>
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MoveTree {
    pub id: Uuid,
    pub initial: GameState,
    pub table: Vec<Vec<Option<Move>>>,

    #[serde(default, skip_serializing)]
    pub game: GameState,
    #[serde(default, skip_serializing)]
    pub tree_loc: (usize, usize),
    #[serde(default, skip_serializing)]
    new_branches: Vec<u64>,
}

impl Default for MoveTree {
    fn default() -> MoveTree {
    MoveTree {
        id: Uuid::new_v4(),
        table: vec![vec![Some(Move {
                loc: None,
                color: Color::White,
                comment: String::new(),
                variant: Variant::None,
                marks: Vec::new(),
            })]],
        initial: GameState::default(),
        game: GameState::default(),
        tree_loc: (0, 0),
        new_branches: Vec::new(),
    }
}
}

impl MoveTree {

    pub fn load(move_tree: &MoveTree) -> MoveTree {
        let mut move_tree = move_tree.clone();
        move_tree.game = move_tree.initial.clone();
        move_tree
    }

    pub fn finish_setup(&mut self, color: Color) {
        self.initial = self.game.clone();
        self.table[0][0].as_mut().unwrap().color = color;
    }

    // maybe check if tree is empty.
    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Color>) {
        self.game.stones[i+1][j+1] = color;
    }

    pub fn play(&mut self, mut loc: Option<(usize, usize)>, color: Color, study: bool) -> bool {

        if let Some((i, j)) = loc {
            loc = Some((i+1, j+1));
        }

        let (r, c) = self.tree_loc;
        // check if step is on table

        for r_ in r..self.table.len() {
            if self.table[r_].len() <= c + 1 {
                continue;
            }
            if r_ > r && self.table[r_][c].is_some() {
                break;
            }
            if let Some(mov) = &self.table[r_][c + 1] {
                if mov.loc == loc && mov.color == color {
                    self.tree_loc = (r_, c + 1);
                    self.game.play_move(mov, c);
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

        if !self.game.play_move(&new_move, self.tree_loc.1) {
            return false;
        }

        self.tree_loc = if self.table[r].len() == c + 1 {
            self.table[r].push(Some(new_move));
            (r, c + 1)
        } else {
            let mut r_ = r + 1;
            while r_ < self.table.len()
                && self.table[r_].len() > c
                && self.table[r_][c].is_none()
            {
                r_ += 1;
            }

            self.table.insert(r_, vec![None; c + 1]);
            self.table[r_].push(Some(new_move));
            (r_, c + 1)
        };
        true
    }

    pub fn jump(&mut self, mut r: usize, mut c: usize) {
        self.tree_loc = (r, c);
        let mut moves: Vec<&Move> = Vec::new();

        while let Some(mov) = &self.table[r][c] {
            moves.push(mov);
            if c == 0 {
                break;
            }
            c -= 1; // r might be 0 but not -1 after this
            while self.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        self.game = self.initial.clone();

        let mut num = 0;
        for &mov in moves.iter().rev() {
            self.game.play_move(mov, num);
            num += 1;
        }
    }

    pub fn delete_branch(&mut self) -> bool {
        if self.tree_loc == (0, 0) {
            return false;
        }
        let (r, c) = self.tree_loc;
        let (mut pr, pc) = (r, c - 1);
        while self.table[pr][pc].is_none() {
            pr -= 1;
        }
        self.jump(pr, pc);

        if r < self.table.len() - 1
            && self.table[r + 1].len() > c
            && self.table[r + 1][c].is_none()
        {
            let (rl, mut rr) = (r + 1, r + 2);
            while rr < self.table.len()
                && self.table[rr].len() > c
                && self.table[rr][c].is_none()
            {
                rr += 1;
            }
            self.table.drain(rl..rr);
        }
        if r > 0 && self.table[r][c - 1].is_none() {
            self.table.remove(r);
        } else {
            self.table[r].truncate(c);
            // move up other option for parent if it exists
            let mut nr = r + 1;
            while nr < self.table.len() {
                if self.table[nr].len() > c
                    && self.table[nr][c - 1].is_none()
                    && self.table[nr][c].is_some()
                {
                    let extn = self.table[nr].split_off(c);
                    self.table[r].extend(extn);
                    self.table.remove(nr);
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
        self.tree_loc = (0, 0);
        self.initial = GameState::default();
        self.table.truncate(1);
        self.table[0].truncate(1);
    }

    // caller will NOT account for border themselves. values inclusive
    pub fn set_window(&mut self, window: (usize, usize, usize, usize)) {
        let (row_start, row_end, col_start, col_end) = window;
        let out_of_bounds = |r, c| {
            r > (row_end + 1) || r < (row_start + 1) || c < (col_start + 1) || c > (col_end + 1)
        };

        for i in 0..21 {
            for j in 0..21 {
                if out_of_bounds(i, j) && self.initial.stones[i][j].is_some() {
                    return;
                }
            }
        }

        for line in self.table.iter() {
            for mov in line.iter().flatten() {
                if let Some((i, j)) = mov.loc {
                    if out_of_bounds(i, j) {
                        return;
                    }
                }
            }
        }

        self.game.window = window;
        self.initial.window = window;

        for i in 0..21 {
            for j in 0..21 {
                if out_of_bounds(i, j) {
                    self.game.stones[i][j] = None;
                }
            }
        }
    }

    fn signature(&self) -> u64 {
        let (mut r, mut c) = self.tree_loc;
        let mut hasher = DefaultHasher::new();

        let mut moves: Vec<(Option<(usize, usize)>, Color)> = Vec::new();

        while let Some(mov) = &self.table[r][c] {
            moves.push((mov.loc, mov.color));
            if c == 0 {
                break;
            }
            c -= 1; // r might be 0 but not -1 after this
            while self.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        moves.hash(&mut hasher);

        hasher.finish()
    }

    pub fn set_variant(&mut self, v: Variant, study: bool) {
        let (r, c) = self.tree_loc;

        if !study {
            self.table[r][c].as_mut().unwrap().variant = v;
            return;
        }

        let old_v = self.table[r][c].as_ref().unwrap().variant;
        let signature = self.signature();

        if old_v == Variant::New && !self.new_branches.contains(&signature) {
            self.new_branches.push(signature);
        }

        if v == Variant::None && self.new_branches.contains(&signature) {
            self.table[r][c].as_mut().unwrap().variant = Variant::New;
        } else {
            self.table[r][c].as_mut().unwrap().variant = v;
        }
    }

    pub fn prep(&mut self) {
        for r in 0..self.table.len() {
            for c in 0..self.table[r].len() {
                if let Some(mov) = self.table[r][c].as_mut() {
                    if mov.variant == Variant::New {
                        mov.variant = Variant::None;
                    }
                }
            }
        }
        self.game = GameState::default();
        self.tree_loc = (0, 0);
        self.new_branches = Vec::new();
    }

    pub fn current_mut(&mut self) -> &mut Move {
        let (r, c) = self.tree_loc;
        self.table[r][c].as_mut().unwrap()
    }

    pub fn current(&self) -> &Move {
        let (r, c) = self.tree_loc;
        self.table[r][c].as_ref().unwrap()
    }

    pub fn set_mark(&mut self, mark: Option<Mark>, loc: (usize, usize)) {
        let (row, col) = loc;
        self.game.marks[row][col] = mark.clone();
        let current_move = self.current_mut();
        match (current_move.marks.iter().position(|&(r, c, ref _mark)| r == row && c == col), mark) {
            (Some(i), Some(mark)) => current_move.marks[i] = ( row, col, mark.clone(),),
            (Some(i), None) => {current_move.marks.remove(i);},
            (None, Some(mark)) => current_move.marks.push((row, col, mark.clone())),
            (None, None) => {}
        }
    }
}
