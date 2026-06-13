use crate::config::{self, ActiveConfig};
use crate::fs;
use crate::move_tree::MoveTree;
use crate::problem::Problem;

use std::mem::swap;
use std::path::Path;

// setup phase:
// tree_loc is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Debug)]
pub struct EditingData {
    pub config: ActiveConfig,
    pub file: String,

    pub move_tree: MoveTree,

    exercises: Vec<Problem>,
    pub current_exercise: usize,
}

impl EditingData {
    fn save_current_and_load(&mut self, mut move_tree: MoveTree) {
        swap(&mut move_tree, &mut self.move_tree);
        self.exercises[self.current_exercise] = move_tree.save();
    }

    pub fn jump_to_exercise(&mut self, index: usize) {
        self.save_current_and_load(MoveTree::load(&self.exercises[index]));

        self.current_exercise = index;
    }

    pub fn new_exercise(&mut self) {
        self.save_current_and_load(MoveTree::default());

        self.exercises.push(Problem::default());
        self.current_exercise = self.exercises.len() - 1;
    }

    pub fn location(&self) -> (usize, usize) {
        (self.current_exercise, self.exercises.len())
    }

    pub async fn load(path: &Path, exercise_file: &str) -> (bool, EditingData) {
        let config = config::load_config(path, Some(exercise_file), true).await;
        let (created, exercises) = fs::load_exercises(path, exercise_file).await.unwrap();
        (
            created,
            if exercises.is_empty() {
                EditingData {
                    config,
                    exercises: vec![Problem::default()],
                    move_tree: MoveTree::default(),
                    current_exercise: 0,
                    file: exercise_file.to_string(),
                }
            } else {
                let i = exercises.len() - 1;
                let move_tree = MoveTree::load(&exercises[i]);
                EditingData {
                    config,
                    exercises,
                    current_exercise: i,
                    move_tree,
                    file: exercise_file.to_string(),
                }
            },
        )
    }

    pub async fn save(&mut self, path: &Path) {
        let saved_copy = self.move_tree.clone();
        self.exercises[self.current_exercise] = saved_copy.save();
        fs::save_exercises(path, &self.exercises, &self.file)
            .await
            .unwrap()
    }
}
