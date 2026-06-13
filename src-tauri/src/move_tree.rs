use crate::game_state::{Color, GameState, Mark};

use crate::problem::{Move, Problem, Variant};
use std::hash::{DefaultHasher, Hash, Hasher};

#[derive(Clone, Debug)]
pub struct MoveTree {
    pub problem: Problem,
    pub game: GameState,
    pub tree_loc: (usize, usize),
    new_branches: Vec<u64>,
}
/*
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
}*/

impl Default for MoveTree {
    fn default() -> MoveTree {
        MoveTree::load(&Problem::default())
    }
}

impl MoveTree {
    pub fn load(problem: &Problem) -> MoveTree {
        let problem = problem.clone();
        let mut game = problem.initial.clone();
        game.play_move(&problem.table[0][0].as_ref().unwrap(), 0);

        MoveTree {
            problem,
            game,
            tree_loc: (0, 0),
            new_branches: Vec::new(),
        }
    }

    pub fn save(mut self: MoveTree) -> Problem {
        for r in 0..self.problem.table.len() {
            for c in 0..self.problem.table[r].len() {
                if let Some(mov) = self.problem.table[r][c].as_mut() {
                    if mov.variant == Variant::New {
                        mov.variant = Variant::None;
                    }
                }
            }
        }
        self.problem
    }

    pub fn finish_setup(&mut self, color: Color) {
        self.problem.initial = self.game.clone();
        self.problem.table[0][0].as_mut().unwrap().color = color;
    }

    // maybe check if tree is empty.
    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Color>) {
        self.game.stones[i + 1][j + 1] = color;
    }

    pub fn play(&mut self, mut loc: Option<(usize, usize)>, color: Color, study: bool) -> bool {
        // consolidate into transform
        if let Some((i, j)) = loc {
            loc = Some((i + 1, j + 1));
        }

        let (r, c) = self.tree_loc;
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
                    self.game.play_move(mov, c + 1);
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

        if !self.game.play_move(&new_move, c + 1) {
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

        self.game = self.problem.initial.clone();

        for (num, &mov) in moves.iter().rev().enumerate() {
            self.game.play_move(mov, num);
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
        self.tree_loc = (0, 0);
        self.problem.initial = GameState::default();
        self.problem.table.truncate(1);
        self.problem.table[0].truncate(1);
    }

    // caller will NOT account for border themselves. values inclusive
    pub fn set_window(&mut self, window: (usize, usize, usize, usize)) {
        let (row_start, row_end, col_start, col_end) = window;
        let out_of_bounds = |r, c| {
            r > (row_end + 1) || r < (row_start + 1) || c < (col_start + 1) || c > (col_end + 1)
        };

        for i in 0..21 {
            for j in 0..21 {
                if out_of_bounds(i, j) && self.problem.initial.stones[i][j].is_some() {
                    return;
                }
            }
        }

        for line in self.problem.table.iter() {
            for mov in line.iter().flatten() {
                if let Some((i, j)) = mov.loc {
                    if out_of_bounds(i, j) {
                        return;
                    }
                }
            }
        }

        self.problem.window = window;

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

    pub fn set_mark(&mut self, mark: Option<Mark>, i: usize, j: usize) {
        self.game.marks[i][j] = mark.clone();
        if self.tree_loc == (0, 0) {
            return;    
        }
        let current_move = self.current_mut();
        match (
            current_move
                .marks
                .iter()
                .position(|&(ii, jj, ref _mark)| i == ii && j == jj),
            mark,
        ) {
            (Some(n), Some(mark)) => current_move.marks[n] = (i, j, mark.clone()),
            (Some(n), None) => {
                current_move.marks.remove(n);
            }
            (None, Some(mark)) => current_move.marks.push((i, j, mark.clone())),
            (None, None) => {}
        }
    }
}
