use std::collections::HashMap;
use std::sync::Arc;

use crate::config::{self, ActiveConfig};
use crate::error::error;
use crate::flashcard_algorithm::algorithm_config::load_history_keeper;
use crate::flashcard_algorithm::{HistoryKeeper, HistoryKeeperParams};
use crate::game::MoveTree;
use crate::game::Problem;
use crate::Result;

use uuid::Uuid;

use crate::file::FileSystem;

// I didn't use hashmaps for exercise_srcs and history_srcs
// but that's probably a very unnecessary optimization.

#[derive(Debug)]
pub struct StudyData {
    pub move_tree: MoveTree,
    pub src_configs: Vec<Arc<ActiveConfig>>,
    current: usize,
    past_exercises: Vec<Uuid>,

    coords: HashMap<Uuid, (usize, usize)>,

    exercises: Vec<Vec<Problem>>,
    // history_srcs: Vec<Vec<<Algorithm as Fl::History>>,
    names: Vec<String>,

    keeper: Box<dyn HistoryKeeper + Send>,
    // make this an option and separate phases here too?
    //   current_selection: (usize, usize),
    //   selection_pool: Vec<Vec<Uuid>>,
}

impl StudyData {
    pub fn load(fs: &mut FileSystem, flashcard_set: &str) -> Result<StudyData> {
        let (set_config, sources) = config::load_study(fs, flashcard_set)?;

        let mut exercises: Vec<Vec<Problem>> = Vec::new();
        let mut src_configs: Vec<Arc<ActiveConfig>> = Vec::new();
        let mut names: Vec<String> = Vec::new();

        for (name, config) in sources {
            let exercise = fs.load_exercises(&name)?;

            exercises.push(exercise);
            src_configs.push(Arc::new(config));
            names.push(name);
        }

        let mut keeper = load_history_keeper(
            set_config.algorithm,
            HistoryKeeperParams {
                fs,
                names: &names,
                exercises: &exercises,
            },
        )?;

        let mut coords: HashMap<Uuid, (usize, usize)> = HashMap::new();
        for (i, exercise_file) in exercises.iter().enumerate() {
            for (j, problem) in exercise_file.iter().enumerate() {
                coords.insert(problem.id, (i, j));
            }
        }

        let id = keeper.next()?;
        let past_exercises = vec![id];

        let (i, j) = coords[&id];

        let move_tree = MoveTree::new(src_configs[i].clone(), &exercises[i][j])?;

        // load
        Ok(StudyData {
            move_tree,
            src_configs,
            current: 0,
            past_exercises,
            coords,
            exercises,
            names,
            keeper,
        })
    }

    fn load_tree(&mut self) -> Result<()> {
        let (i, j) = self.coords[&self.past_exercises[self.current]];
        self.move_tree = MoveTree::new(self.src_configs[i].clone(), &self.exercises[i][j])?;
        Ok(())
    }

    pub fn answer(&mut self, fs: &mut FileSystem, correct: bool) -> Result<String> {
        if self.current != self.past_exercises.len() - 1 {
            return Err(error("tried to answer a different question????"));
        }

        let current_id = self.past_exercises[self.current];
        let (i, j) = self.coords[&current_id];
        self.keeper.answer(fs, (i, j), correct)
    }

    pub fn next_question(&mut self) -> Result<()> {
        let id = self.keeper.next()?;
        self.current = self.past_exercises.len();
        self.past_exercises.push(id);

        self.load_tree()?;
        Ok(())
    }

    pub fn location(&self) -> (usize, usize) {
        (self.current, self.past_exercises.len())
    }

    // makes blue nodes

    pub async fn stop_editing(&mut self, fs: &mut FileSystem, save: bool) -> Result<()> {
        if save {
            let (i, j) = self.coords[&self.past_exercises[self.current]];

            self.exercises[i][j] = self.move_tree.save()?;
            fs.save_exercises(&self.exercises[i], &self.names[i])?;
        }
        self.load_tree()?;
        Ok(())
    }

    // does not update selection. DO NOT try answering etc. after this.
    pub fn jump_to_exercise(&mut self, index: usize) -> Result<()> {
        self.current = index;
        self.load_tree()?;
        Ok(())
    }

    pub fn get_config(&self) -> ActiveConfig {
        let (i, _j) = self.coords[&self.past_exercises[self.current]];
        (*self.src_configs[i]).clone()
    }
    /*
    // will probably never implement.
    // situation on deleting everything?
    delete_exercise -> yes, shift everything + remake coords.
     */
}
