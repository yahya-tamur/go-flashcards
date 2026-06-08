use crate::fs;
use crate::move_tree::MoveTree;
use crate::problem::Problem;

use std::path::Path;

// setup phase:
// tree_loc is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Debug)]
pub struct EditingData {
    pub file: String,

    pub move_tree: MoveTree,

    exercises: Vec<Problem>,
    pub current_exercise: usize,
}

impl EditingData {
    pub fn jump_to_exercise(&mut self, index: usize) {
        self.exercises[self.current_exercise] = self.move_tree.problem.clone();

        self.move_tree = MoveTree::load(self.exercises[index].clone());
        self.current_exercise = index;
    }

    pub fn new_exercise(&mut self) {
        self.exercises[self.current_exercise] = self.move_tree.problem.clone();
        self.move_tree = MoveTree::default();
        self.exercises.push(Problem::default());
        self.current_exercise = self.exercises.len() - 1;
    }

    pub fn location(&self) -> (usize, usize) {
        (self.current_exercise, self.exercises.len())
    }

    pub async fn load(path: &Path, exercise_file: &str) -> (bool, EditingData) {
        let (created, exercises) = fs::load_exercises(path, exercise_file).await.unwrap();
        (
            created,
            if exercises.is_empty() {
                EditingData {
                    exercises: vec![Problem::default()],
                    move_tree: MoveTree::default(),
                    current_exercise: 0,
                    file: exercise_file.to_string(),
                }
            } else {
                let i = exercises.len() - 1;
                let move_tree = MoveTree::load(exercises[i].clone());
                EditingData {
                    exercises,
                    current_exercise: i,
                    move_tree,
                    file: exercise_file.to_string(),
                }
            },
        )
    }

    pub async fn save(&mut self, path: &Path) {
        self.exercises[self.current_exercise] = self.move_tree.problem.clone();
        fs::save_exercises(path, &self.exercises, &self.file)
            .await
            .unwrap()
    }
}
