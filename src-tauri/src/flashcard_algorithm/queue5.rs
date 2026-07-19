use std::collections::VecDeque;

use crate::flashcard_algorithm::FlashcardAlgorithm;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub(super) struct Queue5 {
    pub(super) breakpoints: [usize; 3],
    pub(super) weights: [f64; 5],
    pub(super) total: usize,
}

// 5 is the number of 'buckets' the flashcards can fall into.
impl FlashcardAlgorithm<5> for Queue5 {
    type History = VecDeque<bool>;
    const FILE_EXT: &'static str = "q5";

    fn new_history() -> Self::History {
        VecDeque::new()
    }
    fn update(&self, hist: &mut Self::History, correct: bool) {
        hist.push_back(correct);
        while hist.len() > self.total {
            hist.pop_front();
        }
    }
    fn bucket(&self, hist: &Self::History) -> usize {
        if hist.is_empty() {
            0
        } else {
            match hist.iter().filter(|x| **x).count() {
                val if val < self.breakpoints[0] => 1,
                val if val < self.breakpoints[1] => 2,
                val if val < self.breakpoints[2] => 3,
                _ => 4,
            }
        }
    }

    // While the distribution is taken from the configuration in this algorithm,
    // it may be chosen based on the number of flashcards in each bucket.

    // Although these functions will only be called with T = Uuid,
    // they are generic over T to disallow picking based on the id's themselves.

    fn view_history(&self, hist: &Self::History) -> String {
        hist.iter().map(|b| if *b { "🌟" } else { "❌" }).collect()
    }

    fn distribution<T>(&self, _selection_pool: &[Vec<T>; 5]) -> [f64; 5] {
        self.weights
    }
    fn progress<T>(&self, pool_sizes: &[Vec<T>; 5]) -> Vec<usize> {
        pool_sizes.iter().map(|v| v.len()).collect()
    }
}
