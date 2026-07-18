use crate::{error::error, Result};
use rand::{
    distr::{weighted::WeightedIndex, Distribution},
    rng, RngExt,
};
use serde::{Deserialize, Serialize};
use std::fmt::Debug;

// history file; Map<Uuid, History> stored in <exercise_set(.flashcard_set ? ).FILE_EXT.json.gz>

// All flashcards must

pub trait FlashcardAlgorithm<const BUCKET_NUMBER: usize>: Debug {
    type History: for<'a> Deserialize<'a> + Serialize + Debug;

    const FILE_EXT: &'static str;

    fn new_history() -> Self::History;

    fn view_history(&self, hist: &Self::History) -> String;
    fn update(&self, hist: &mut Self::History, correct: bool);
    fn bucket(&self, hist: &Self::History) -> usize;
    fn distribution<T>(&self, selection_pool: &[Vec<T>; BUCKET_NUMBER]) -> [f64; BUCKET_NUMBER];
    fn view<T>(&self, selection_pool: &[Vec<T>; BUCKET_NUMBER]) -> Vec<usize>;

    fn pick<T>(&self, selection_pool: &[Vec<T>; BUCKET_NUMBER]) -> Result<(usize, usize)> {
        let sizes: [usize; BUCKET_NUMBER] = selection_pool.each_ref().map(|v| v.len());
        let dist = self.distribution(selection_pool);

        let dist: Vec<f64> = dist
            .iter()
            .enumerate()
            .map(|(i, f)| {
                if sizes[i] == 0 || *f < 0.0 || f.is_nan() {
                    0f64
                } else {
                    *f
                }
            })
            .collect();

        if dist.iter().all(|v| *v == 0.0) {
            return Err(error("nothing to pick from!"));
        }

        match WeightedIndex::new(dist) {
            Ok(wi) => {
                let i = wi.sample(&mut rng());
                if selection_pool[i].is_empty() {
                    return Err(error("Tried to pick from empty range."));
                }
                let j = rng().random_range(0..selection_pool[i].len());
                Ok((i, j))
            }
            Err(e) => Err(error(&format!("Distribution error: {}", e))),
        }
    }
}
