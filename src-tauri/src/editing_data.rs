use crate::fs;
use crate::move_tree::MoveTree;
use crate::navigator::Navigator;

use std::path::Path;

// setup phase:
// tree_loc is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Debug)]
pub struct EditingData {
    pub file: String,

    pub navigator: Navigator,

    exercises: Vec<MoveTree>,
    pub current_exercise: usize,
}

impl EditingData {
    pub fn jump_to_exercise(&mut self, index: usize) {
        self.exercises[self.current_exercise] = self.navigator.move_tree.clone();

        self.navigator = Navigator::load(self.exercises[index].clone());
        self.current_exercise = index;
    }

    pub fn new_exercise(&mut self) {
        self.exercises[self.current_exercise] = self.navigator.move_tree.clone();
        self.navigator = Navigator::default();
        self.exercises.push(MoveTree::default());
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
                    exercises: vec![MoveTree::default()],
                    navigator: Navigator::default(),
                    current_exercise: 0,
                    file: exercise_file.to_string(),
                }
            } else {
                let i = exercises.len() - 1;
                let navigator = Navigator::load(exercises[i].clone());
                EditingData {
                    exercises,
                    current_exercise: i,
                    navigator,
                    file: exercise_file.to_string(),
                }
            },
        )
    }

    pub async fn save(&mut self, path: &Path) {
        self.exercises[self.current_exercise] = self.navigator.move_tree.clone();
        fs::save_exercises(path, &self.exercises, &self.file)
            .await
            .unwrap()
    }
}
