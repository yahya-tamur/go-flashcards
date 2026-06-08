use crate::go_rules::{place_stone, Color, GameState};
use crate::move_tree::{Move, MoveTree, Variant};

use std::hash::{DefaultHasher, Hash, Hasher};

#[derive(Clone, Default, Debug)]
pub struct Navigator {
    pub move_tree: MoveTree,
    pub game: GameState,
    pub tree_loc: (usize, usize),
    new_branches: Vec<u64>,
}

impl Navigator {
    pub fn load(move_tree: MoveTree) -> Navigator {
        let game = move_tree.initial;
        Navigator {
            move_tree,
            game,
            tree_loc: (0, 0),
            new_branches: Vec::new(),
        }
    }

    pub fn finish_setup(&mut self, color: Color) {
        self.move_tree.initial = self.game;
        self.move_tree.table[0][0].as_mut().unwrap().color = color;
    }

    // maybe check if tree is empty.
    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Color>) {
        self.game.stones[i][j] = color;
    }

    pub fn play(&mut self, loc: Option<(usize, usize)>, color: Color, study: bool) -> bool {
        if let Some((i, j)) = loc {
            if !place_stone(&mut self.game, i, j, color) {
                return false;
            }
        }

        //        self.tree_loc = self.move_tree.step(row, column, loc, color, study);

        let (r, c) = self.tree_loc;
        // check if step is on table

        for r_ in r..self.move_tree.table.len() {
            if self.move_tree.table[r_].len() <= c + 1 {
                continue;
            }
            if r_ > r && self.move_tree.table[r_][c].is_some() {
                break;
            }
            if let Some(mov) = &self.move_tree.table[r_][c + 1] {
                if mov.loc == loc && mov.color == color {
                    self.tree_loc = (r_, c + 1);
                    return true;
                }
            }
        }

        let new_move = Some(Move {
            loc,
            comment: String::new(),
            color,
            variant: if study { Variant::New } else { Variant::None },
        });

        self.tree_loc = if self.move_tree.table[r].len() == c + 1 {
            self.move_tree.table[r].push(new_move);
            (r, c + 1)
        } else {
            let mut r_ = r + 1;
            while r_ < self.move_tree.table.len()
                && self.move_tree.table[r_].len() > c
                && self.move_tree.table[r_][c].is_none()
            {
                r_ += 1;
            }

            self.move_tree.table.insert(r_, vec![None; c + 1]);
            self.move_tree.table[r_].push(new_move);
            (r_, c + 1)
        };
        true
    }

    pub fn jump(&mut self, mut r: usize, mut c: usize) {
        self.tree_loc = (r, c);
        let mut moves: Vec<&Move> = Vec::new();

        while let Some(mov) = &self.move_tree.table[r][c] {
            moves.push(mov);
            if c == 0 {
                break;
            }
            c -= 1; // r might be 0 but not -1 after this
            while self.move_tree.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        self.game = self.move_tree.initial;

        for &mov in moves.iter().rev() {
            if let Some((i, j)) = mov.loc {
                place_stone(&mut self.game, i, j, mov.color);
            }
        }
    }

    pub fn delete_branch(&mut self) -> bool {
        if self.tree_loc == (0, 0) {
            return false;
        }
        let (r, c) = self.tree_loc;
        let (mut pr, pc) = (r, c - 1);
        while self.move_tree.table[pr][pc].is_none() {
            pr -= 1;
        }
        self.jump(pr, pc);

        if r < self.move_tree.table.len() - 1
            && self.move_tree.table[r + 1].len() > c
            && self.move_tree.table[r + 1][c].is_none()
        {
            let (rl, mut rr) = (r + 1, r + 2);
            while rr < self.move_tree.table.len()
                && self.move_tree.table[rr].len() > c
                && self.move_tree.table[rr][c].is_none()
            {
                rr += 1;
            }
            self.move_tree.table.drain(rl..rr);
        }
        if r > 0 && self.move_tree.table[r][c - 1].is_none() {
            self.move_tree.table.remove(r);
        } else {
            self.move_tree.table[r].truncate(c);
            // move up other option for parent if it exists
            let mut nr = r + 1;
            while nr < self.move_tree.table.len() {
                if self.move_tree.table[nr].len() > c
                    && self.move_tree.table[nr][c - 1].is_none()
                    && self.move_tree.table[nr][c].is_some()
                {
                    let extn = self.move_tree.table[nr].split_off(c);
                    self.move_tree.table[r].extend(extn);
                    self.move_tree.table.remove(nr);
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
        self.move_tree.table.truncate(1);
        self.move_tree.table[0].truncate(1);
    }

    // caller will NOT account for border themselves. values inclusive
    pub fn clear_to(&mut self, window: (usize, usize, usize, usize)) -> bool {
        let (row_start, row_end, col_start, col_end) = window;
        let out_of_bounds = |r, c| {
            r > (row_end + 1) || r < (row_start + 1) || c < (col_start + 1) || c > (col_end + 1)
        };

        for i in 0..21 {
            for j in 0..21 {
                if out_of_bounds(i, j) && self.move_tree.initial.stones[i][j].is_some() {
                    return false;
                }
            }
        }

        for line in self.move_tree.table.iter() {
            for mov in line.iter().flatten() {
                if let Some((i, j)) = mov.loc {
                    if out_of_bounds(i, j) {
                        return false;
                    }
                }
            }
        }

        self.game.window = window;
        self.move_tree.initial.window = window;

        for i in 0..21 {
            for j in 0..21 {
                if out_of_bounds(i, j) {
                    self.game.stones[i][j] = None;
                }
            }
        }
        true
    }

    fn signature(&self) -> u64 {
        let (mut r, mut c) = self.tree_loc;
        let mut hasher = DefaultHasher::new();

        let mut moves: Vec<(Option<(usize, usize)>, Color)> = Vec::new();

        while let Some(mov) = &self.move_tree.table[r][c] {
            moves.push((mov.loc, mov.color));
            if c == 0 {
                break;
            }
            c -= 1; // r might be 0 but not -1 after this
            while self.move_tree.table[r][c].is_none() && r > 0 {
                r -= 1;
            }
        }

        moves.hash(&mut hasher);

        hasher.finish()
    }

    pub fn set_variant(&mut self, v: Variant, study: bool) {
        let (r, c) = self.tree_loc;

        if !study {
            self.move_tree.table[r][c].as_mut().unwrap().variant = v;
            return;
        }

        let old_v = self.move_tree.table[r][c].as_ref().unwrap().variant;
        let signature = self.signature();

        if old_v == Variant::New && !self.new_branches.contains(&signature) {
            self.new_branches.push(signature);
        }

        if v == Variant::None && self.new_branches.contains(&signature) {
            self.move_tree.table[r][c].as_mut().unwrap().variant = Variant::New;
        } else {
            self.move_tree.table[r][c].as_mut().unwrap().variant = v;
        }
    }

    pub fn clear_edits(&mut self) {
        for r in 0..self.move_tree.table.len() {
            for c in 0..self.move_tree.table[r].len() {
                if let Some(mov) = self.move_tree.table[r][c].as_mut() {
                    if mov.variant == Variant::New {
                        mov.variant = Variant::None;
                    }
                }
            }
        }
    }

    pub fn current_mut(&mut self) -> &mut Move {
        let (r, c) = self.tree_loc;
        self.move_tree.table[r][c].as_mut().unwrap()
    }

    pub fn current(&self) -> &Move {
        let (r, c) = self.tree_loc;
        self.move_tree.table[r][c].as_ref().unwrap()
    }
}
