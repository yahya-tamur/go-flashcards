
use crate::fs;
use crate::go_rules::{place_stone, Color, GameState};
use crate::move_tree::{Move, MoveTree};

use std::path::Path;

// setup phase:
// tree_loc is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Debug)]
pub struct EditingData {
    pub game: GameState,
    pub tree_loc: (usize, usize),
    exercises: Vec<MoveTree>,
    // should this also be an option?
    pub current_exercise: usize,
}

impl EditingData {
    pub fn jump_to_exercise(&mut self, index: usize) {
        self.current_exercise = index;
        self.game = self.exercises[index].initial;
        self.tree_loc = (0, 0);
    }

    // maybe check if tree is empty.
    pub fn place_stone(&mut self, i: usize, j: usize, color: Option<Color>) {
        self.game.stones[i][j] = color;
    }

    pub fn play(&mut self, loc: Option<(usize, usize)>, color: Color) -> bool {
        if let Some((i, j)) = loc {
            if !place_stone(&mut self.game, i, j, color) {
                return false;
            }
        }
        let (row, column) = self.tree_loc;
        self.tree_loc = self.exercises[self.current_exercise].step(row, column, loc, color, false);
        true
    }

    pub fn jump(&mut self, r: usize, c: usize) {
        self.game = self.exercises[self.current_exercise].jump(r, c);
        self.tree_loc = (r, c);
    }

    pub fn start_setup(&mut self, index: usize) {
        println!("start setup");
        self.game = GameState::default();
        self.current_exercise = index;
        self.tree_loc = (0, 0);
        self.exercises.insert(index, MoveTree::new());
    }

    pub fn finish_setup(&mut self, color: Color) {
        println!("end setup");
        self.exercises[self.current_exercise].initial = self.game;
        self.exercises[self.current_exercise].table[0][0].as_mut().unwrap().color = color;
    }


    pub fn collapse_tree(&mut self) {
        self.game.captures = (0, 0);
        self.game.ko = None;
        self.tree_loc = (0, 0);
        self.exercises[self.current_exercise].table.truncate(1);
        self.exercises[self.current_exercise].table[0].truncate(1);
    }

    // caller will NOT account for border themselves. values inclusive
    pub fn clear_to(&mut self, window: (usize, usize, usize, usize)) {
        // this is checked twice then!:
        let (row_start, row_end, col_start, col_end) = window;
        for i in 0..21 {
            for j in 0..21 {
                if i > (row_end + 1)
                    || i < (row_start + 1)
                    || j < (col_start + 1)
                    || j > (col_end + 1)
                {
                    self.game.stones[i][j] = None;
                }
            }
        }
    }

    pub fn get_current_move_mut(&mut self) -> Option<&mut Move> {
        let (row, col) = self.tree_loc;

        self.exercises
            .get_mut(self.current_exercise)?
            .table
            .get_mut(row)?
            .get_mut(col)?
            .as_mut()
    }

    pub fn get_current_move(&self) -> Option<&Move> {
        let (row, col) = self.tree_loc;

        self.exercises
            .get(self.current_exercise)?
            .table
            .get(row)?
            .get(col)?
            .as_ref()
    }

    pub fn location(&self) -> (usize, usize) {
        (self.current_exercise, self.exercises.len())
    }

    pub async fn load(path: &Path, exercise_file: &str) -> EditingData {
        let exercises = fs::load_exercises(path, exercise_file).await.unwrap();
        if exercises.is_empty() {
            EditingData {
                game: GameState::default(),
                tree_loc: (0, 0),
                exercises: vec![MoveTree::new()],
                current_exercise: 0,
            }
        } else {
            let i = exercises.len() - 1;
            EditingData {
                game: exercises[i].initial,
                tree_loc: (0, 0),
                exercises,
                current_exercise: i,
            }
        }
    }

    pub fn get_table(&self) -> Vec<Vec<Option<Move>>> {
        self.exercises[self.current_exercise].table.clone()
    }

    pub async fn save(&self, path: &Path, exercise_file: &str) {
        fs::save_exercises(path, &self.exercises, exercise_file)
            .await
            .unwrap()
    }
}
