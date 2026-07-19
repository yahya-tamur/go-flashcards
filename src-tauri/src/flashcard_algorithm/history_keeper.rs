use std::collections::HashMap;

use uuid::Uuid;

use crate::{file::FileSystem, game::Problem, Result};
use std::fmt::Debug;

use super::FlashcardAlgorithm;

pub trait Sealed {}

pub trait HistoryKeeper: Debug + Sealed + Send + 'static {
    fn answer(
        &mut self,
        fs: &mut FileSystem,
        history_loc: (usize, usize),
        correct: bool,
    ) -> Result<String>;

    fn progress(&self) -> Vec<usize>;
    fn next(&mut self) -> Result<Uuid>;
}

#[derive(Debug)]
pub struct FAHistoryKeeper<FA, const BUCKET_NUMBER: usize>
where
    FA: FlashcardAlgorithm<BUCKET_NUMBER>,
    FA: Debug,
{
    algorithm: FA,
    histories: Vec<Vec<(Uuid, FA::History)>>,
    names: Vec<String>,
    selection_pool: [Vec<Uuid>; BUCKET_NUMBER],
    current_selection: (usize, usize),
}

pub struct HistoryKeeperParams<'a> {
    pub names: &'a Vec<String>,
    pub exercises: &'a Vec<Vec<Problem>>,
    pub fs: &'a mut FileSystem,
}

pub fn load_history<FA, const BUCKET_NUMBER: usize>(
    algorithm: FA,
    params: HistoryKeeperParams<'_>,
) -> Result<Box<dyn HistoryKeeper>>
where
    FA: FlashcardAlgorithm<BUCKET_NUMBER>,
{
    let HistoryKeeperParams {
        fs,
        names,
        exercises,
    } = params;

    let mut histories = Vec::new();

    for (i, name) in names.iter().enumerate() {
        let mut history_file: Vec<(Uuid, FA::History)> = fs.load_history(name, FA::FILE_EXT)?;

        let mut j = 0usize;
        while j < exercises.len().min(history_file.len()) {
            if exercises[i][j].id != history_file[j].0 {
                break;
            }
            j += 1;
        }

        match () {
            () if exercises[i].len() == history_file.len() && j == history_file.len() => {}
            () if exercises[i].len() > history_file.len() && j == history_file.len() => {
                for exercise in exercises[i].iter().skip(j) {
                    history_file.push((exercise.id, FA::new_history()))
                }
                fs.save_history(name, FA::FILE_EXT, &history_file)?;
            }
            _ => {
                let mut hist_map: HashMap<Uuid, FA::History> =
                    history_file.split_off(j).into_iter().collect();
                for exercise in exercises[i].iter().skip(j) {
                    history_file.push((
                        exercise.id,
                        hist_map
                            .remove(&exercise.id)
                            .unwrap_or_else(FA::new_history),
                    ))
                }
                fs.save_history(name, FA::FILE_EXT, &history_file)?;
            }
        }
        histories.push(history_file);
    }

    let mut selection_pool = std::array::from_fn(|_| Vec::<Uuid>::new());

    for history_file in histories.iter() {
        for (id, history) in history_file.iter() {
            selection_pool[algorithm.bucket(history)].push(*id);
        }
    }

    Ok(Box::new(FAHistoryKeeper {
        algorithm,
        histories,
        names: names.clone(),
        selection_pool,
        current_selection: (0, 0),
    }))
}

impl<FA, const BUCKET_NUMBER: usize> Sealed for FAHistoryKeeper<FA, BUCKET_NUMBER> where
    FA: FlashcardAlgorithm<BUCKET_NUMBER>
{
}

impl<FA, const BUCKET_NUMBER: usize> HistoryKeeper for FAHistoryKeeper<FA, BUCKET_NUMBER>
where
    FA: FlashcardAlgorithm<BUCKET_NUMBER>,
{
    fn answer(
        &mut self,
        fs: &mut FileSystem,
        (i, j): (usize, usize),
        correct: bool,
    ) -> Result<String> {
        let (sel_i, sel_j) = self.current_selection;

        let hist_id = self.selection_pool[sel_i].swap_remove(sel_j);
        self.algorithm.update(&mut self.histories[i][j].1, correct);
        self.selection_pool[self.algorithm.bucket(&self.histories[i][j].1)].push(hist_id);

        fs.save_history(&self.names[i], FA::FILE_EXT, &self.histories[i])
            .map(|()| self.algorithm.view_history(&self.histories[i][j].1))
    }

    fn progress(&self) -> Vec<usize> {
        self.algorithm.progress(&self.selection_pool)
    }

    fn next(&mut self) -> Result<Uuid> {
        let (sel_i, sel_j) = self.algorithm.pick(&self.selection_pool)?;

        self.current_selection = (sel_i, sel_j);
        Ok(self.selection_pool[sel_i][sel_j])
    }
}
