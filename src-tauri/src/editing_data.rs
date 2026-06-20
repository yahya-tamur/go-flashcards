use crate::config::{self, ActiveConfig};
use crate::fs;
use crate::move_tree::MoveTree;
use crate::problem::Problem;
use crate::sgf::{problem_to_sgf, sgf_to_problem};

use std::path::Path;
use std::sync::Arc;

use sgf_parse::go::parse;
use sgf_parse::{serialize, GameTree::GoGame};

// setup phase:
// tree_loc is None,
// call place_stone to set up game.
// tree phase:
// call play to play move.
#[derive(Debug)]
pub struct EditingData {
    pub config: Arc<ActiveConfig>,
    pub file: String,

    pub move_tree: MoveTree,

    exercises: Vec<Problem>,
    pub current_exercise: usize,
}

impl EditingData {
    //only for testing!
    pub fn current_problem(&self) -> &Problem {
        &self.exercises[self.current_exercise]
    }

    pub fn jump_to_exercise(&mut self, index: usize) {
        self.exercises[self.current_exercise] = self.move_tree.save();
        self.move_tree.load(&self.exercises[index]);

        self.current_exercise = index;
    }

    pub fn new_exercise(&mut self) {
        self.exercises[self.current_exercise] = self.move_tree.save();

        self.exercises.push(Problem::default());
        self.current_exercise = self.exercises.len() - 1;

        self.move_tree
            .load(&self.exercises[self.exercises.len() - 1]);
    }

    pub fn location(&self) -> (usize, usize) {
        (self.current_exercise, self.exercises.len())
    }

    pub async fn load(path: &Path, exercise_file: &str) -> (bool, EditingData) {
        let config = Arc::new(config::load_config(path, Some(exercise_file), true).await);
        let (created, exercises) = fs::load_exercises(path, exercise_file).await.unwrap();
        (
            created,
            if exercises.is_empty() {
                let exercises = vec![Problem::default()];
                let move_tree = MoveTree::new(config.clone(), &exercises[0]);
                EditingData {
                    config,
                    exercises,
                    move_tree,
                    current_exercise: 0,
                    file: exercise_file.to_string(),
                }
            } else {
                let i = exercises.len() - 1;
                let move_tree = MoveTree::new(config.clone(), &exercises[i]);
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

    pub fn export_sgf(&self) -> String {
        let problems: Vec<sgf_parse::GameTree> = self
            .exercises
            .iter()
            .map(|prob| GoGame(problem_to_sgf(prob)))
            .collect();
        serialize(problems.iter())
    }

    pub fn import_sgf(&mut self, sgf: &str) -> bool {
        self.exercises[self.current_exercise] = self.move_tree.save();

        let Ok(trees) = parse(sgf) else {
            return false;
        };
        for game in trees {
            self.exercises.push(sgf_to_problem(game));
        }

        self.current_exercise = self.exercises.len() - 1;

        self.move_tree
            .load(&self.exercises[self.exercises.len() - 1]);

        true
    }
}
