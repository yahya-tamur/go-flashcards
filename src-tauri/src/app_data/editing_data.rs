use crate::config::{self, ActiveConfig};
use crate::file::FileSystem;
use crate::game::{MoveTree, Problem};
use crate::sgf::{problem_to_sgf, sgf_to_problem};
use crate::Result;

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
    fn load_tree(&mut self) -> Result<()> {
        self.move_tree =
            MoveTree::new(self.config.clone(), &self.exercises[self.current_exercise])?;
        Ok(())
    }

    pub fn jump_to_exercise(&mut self, index: usize) -> Result<()> {
        self.exercises[self.current_exercise] = self.move_tree.save()?;
        self.current_exercise = index;
        self.load_tree()
    }

    pub fn new_exercise(&mut self, insert: bool) -> Result<()> {
        self.exercises[self.current_exercise] = self.move_tree.save()?;

        if insert {
            self.exercises
                .insert(self.current_exercise, Problem::default());
        } else {
            self.exercises.push(Problem::default());
            self.current_exercise = self.exercises.len() - 1;
        };

        self.load_tree()
    }

    pub fn delete_exercise(&mut self) -> Result<()> {
        self.exercises.remove(self.current_exercise);
        if self.exercises.is_empty() {
            self.exercises.push(Problem::default());
        } else if self.exercises.len() == self.current_exercise {
            self.current_exercise -= 1;
        }
        self.load_tree()
    }

    pub fn location(&self) -> (usize, usize) {
        (self.current_exercise, self.exercises.len())
    }

    pub fn load(fs: &mut FileSystem, exercise_file: &str) -> Result<EditingData> {
        let config = Arc::new(config::load_editing(fs, exercise_file)?);
        let exercises = fs.load_exercises(exercise_file)?;

        if exercises.is_empty() {
            let exercises = vec![Problem::default()];
            let move_tree = MoveTree::new(config.clone(), &exercises[0])?;
            Ok(EditingData {
                config,
                exercises,
                move_tree,
                current_exercise: 0,
                file: exercise_file.to_string(),
            })
        } else {
            let i = exercises.len() - 1;
            let move_tree = MoveTree::new(config.clone(), &exercises[i])?;
            Ok(EditingData {
                config,
                exercises,
                current_exercise: i,
                move_tree,
                file: exercise_file.to_string(),
            })
        }
    }

    pub fn save(&mut self, fs: &mut FileSystem) -> Result<()> {
        let mut saved_copy = self.move_tree.clone();
        self.exercises[self.current_exercise] = saved_copy.save()?;
        fs.save_exercises(&self.exercises, &self.file)?;
        Ok(())
    }

    pub fn export_sgf(&self) -> Result<String> {
        let mut converted = Vec::new();
        for problem in self.exercises.iter() {
            converted.push(GoGame(problem_to_sgf(problem)?));
        }
        Ok(serialize(converted.iter()))
    }

    pub fn import_sgf(&mut self, sgf: &str) -> Result<()> {
        self.exercises[self.current_exercise] = self.move_tree.save()?;

        let trees = parse(sgf)?;
        for game in trees {
            self.exercises.push(sgf_to_problem(game)?);
        }

        self.current_exercise = self.exercises.len() - 1;

        self.load_tree()?;

        Ok(())
    }
}
