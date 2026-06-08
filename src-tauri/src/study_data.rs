use std::collections::{HashMap, VecDeque};

use crate::config::{self, Config};
use crate::flashcard_algorithm::pick;
use crate::navigator::Navigator;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::move_tree::MoveTree;

use crate::fs;
use std::path::Path;

#[derive(Debug, Deserialize, Serialize)]
pub struct History {
    pub id: Uuid,
    hist: Option<VecDeque<bool>>, // something better later
}

impl History {
    pub fn update(&mut self, correct: bool) {
        if let Some(v) = self.hist.as_mut() {
            v.push_back(correct);
            while v.len() > 10 {
                v.pop_front();
            }
        } else {
            self.hist = Some(VecDeque::from([correct]));
        }
    }

    pub fn bucket(&self) -> usize {
        if let Some(v) = self.hist.as_ref() {
            v.iter().filter(|x| **x).count() + 1
        } else {
            0
        }
    }
}

// I didn't use hashmaps for exercise_srcs and history_srcs
// but that's probably a very unnecessary optimization.

#[derive(Debug)]
pub struct StudyData {
    pub navigator: Navigator,
    config: Config,

    // think about current

    // This is very much like a sql database??
    current_exercise: usize,
    past_exercises: Vec<Uuid>,

    coords: HashMap<Uuid, (usize, usize)>,

    exercise_srcs: Vec<Vec<MoveTree>>,
    history_srcs: Vec<Vec<History>>,

    names: Vec<String>,

    // make this an option and separate phases here too?
    current_selection: (usize, usize),
    selection_pool: Vec<Vec<Uuid>>,
}

impl StudyData {
    pub async fn load(path: &Path, flashcard_set: &str) -> StudyData {
        // load everything...
        let config = config::read_toml(&fs::load_config(path).await.unwrap()).unwrap();

        let names: Vec<String> = config
            .flashcard_set
            .iter()
            .find(|fs| fs.name == flashcard_set)
            .unwrap()
            .sources
            .clone();

        let mut exercise_srcs: Vec<Vec<MoveTree>> = Vec::new();
        let mut history_srcs: Vec<Vec<History>> = Vec::new();

        for name in &names {
            let exercise_src = fs::load_exercises(path, name).await.unwrap().1;
            // later use config
            let mut history_src = fs::load_history(path, name).await.unwrap();

            let mut i = 0usize;

            while i < exercise_src.len().min(history_src.len()) {
                if exercise_src[i].id != history_src[i].id {
                    break;
                }
                i += 1;
            }

            match () {
                () if exercise_src.len() == history_src.len() && i == history_src.len() => {}
                () if exercise_src.len() > history_src.len() && i == history_src.len() => {
                    for exercise in exercise_src.iter().skip(i) {
                        history_src.push(History {
                            id: exercise.id,
                            hist: None,
                        })
                    }
                    fs::save_history(path, &history_src, name).await.unwrap();
                }
                _ => {
                    let mut hist_map: HashMap<Uuid, Option<VecDeque<bool>>> = history_src
                        .split_off(i)
                        .into_iter()
                        .map(|h| (h.id, h.hist))
                        .collect();
                    for exercise in exercise_src.iter().skip(i) {
                        let id = exercise.id;
                        history_src.push(History {
                            id,
                            hist: hist_map.remove(&id).unwrap_or(None),
                        })
                    }
                    fs::save_history(path, &history_src, name).await.unwrap();
                }
            }
            exercise_srcs.push(exercise_src);
            history_srcs.push(history_src);
        }

        let mut coords: HashMap<Uuid, (usize, usize)> = HashMap::new();
        let mut selection_pool: Vec<Vec<Uuid>> = vec![Vec::new(); 12];
        for (i, history_src) in history_srcs.iter().enumerate() {
            for (j, history) in history_src.iter().enumerate() {
                selection_pool[history.bucket()].push(history.id);
                coords.insert(history.id, (i, j));
            }
        }
        let (sel_i, sel_j) = pick(&config, &selection_pool);
        let current = selection_pool[sel_i][sel_j];
        let past_exercises = vec![current];
        let current_exercise = 0;
        let (i, j) = coords[&current];

        let navigator = Navigator::load(exercise_srcs[i][j].clone());

        // load
        StudyData {
            navigator,
            config,
            past_exercises,
            current_exercise,
            current_selection: (sel_i, sel_j),
            coords,
            selection_pool,
            names,
            exercise_srcs,
            history_srcs,
        }
    }

    pub async fn answer(&mut self, app_data: &Path, correct: bool) {
        let (sel_i, sel_j) = self.current_selection;

        if self.current_exercise != self.past_exercises.len() - 1
            || self.selection_pool[sel_i][sel_j] != self.past_exercises[self.current_exercise]
        {
            println!("{:?}", self);
            panic!("tried to answer a different question????");
        }

        let current_id = self.past_exercises[self.current_exercise];
        let (i, j) = self.coords[&current_id];

        self.selection_pool[sel_i].swap_remove(sel_j);
        self.history_srcs[i][j].update(correct);
        self.selection_pool[self.history_srcs[i][j].bucket()].push(current_id);

        fs::save_history(app_data, &self.history_srcs[i], &self.names[i])
            .await
            .unwrap();
    }

    pub fn get_history(&self) -> &VecDeque<bool> {
        let current_id = self.past_exercises[self.current_exercise];
        let (i, j) = self.coords[&current_id];
        self.history_srcs[i][j].hist.as_ref().unwrap()
    }

    pub async fn next(&mut self) {
        let (sel_i, sel_j) = pick(&self.config, &self.selection_pool);
        let next_id = self.selection_pool[sel_i][sel_j];
        let (i, j) = self.coords[&next_id];

        self.current_selection = (sel_i, sel_j);
        self.current_exercise = self.past_exercises.len();
        self.past_exercises.push(next_id);

        self.navigator = Navigator::load(self.exercise_srcs[i][j].clone());
    }

    pub fn location(&self) -> (usize, usize) {
        (self.current_exercise, self.past_exercises.len())
    }

    // makes blue nodes

    pub async fn stop_editing(&mut self, app_data: &Path, save: bool) {
        let (i, j) = self.coords[&self.past_exercises[self.current_exercise]];

        if save {
            // remove new variants
            self.navigator.clear_edits();

            self.exercise_srcs[i][j] = self.navigator.move_tree.clone();
            fs::save_exercises(app_data, &self.exercise_srcs[i], &self.names[i])
                .await
                .unwrap();
        } else {
            self.navigator = Navigator::load(self.exercise_srcs[i][j].clone());
        }
    }

    pub async fn discard_edits(&mut self) {}

    // does not update selection. DO NOT try answering etc. after this.
    pub fn jump_to_exercise(&mut self, index: usize) {
        self.current_exercise = index;
        let (i, j) = self.coords[&self.past_exercises[index]];
        self.navigator = Navigator::load(self.exercise_srcs[i][j].clone());
    }

    /*
    // will probably never implement.
    // situation on deleting everything?
    delete_exercise -> yes, shift everything + remake coords.
     */
}
