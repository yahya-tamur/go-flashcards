use serde::{Deserialize, Serialize};
use specta::Type;

use crate::flashcard_algorithm::history_keeper::HistoryKeeperParams;

use super::load_history;

use super::Queue5;

#[derive(Deserialize, PartialEq, Debug, Clone, Type, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum AlgorithmConfig {
    Queue5 {
        breakpoints: [usize; 3],
        weights: [f64; 5],
        total: usize,
    },
}

pub fn load_history_keeper(
    a: AlgorithmConfig,
    params: HistoryKeeperParams<'_>,
) -> Box<dyn super::HistoryKeeperTrait + Send> {
    match a {
        AlgorithmConfig::Queue5 {
            breakpoints,
            weights,
            total,
        } => load_history(
            Queue5 {
                breakpoints,
                weights,
                total,
            },
            params,
        ),
    }
}
