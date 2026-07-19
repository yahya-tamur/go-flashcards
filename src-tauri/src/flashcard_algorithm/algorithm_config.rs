use serde::{Deserialize, Serialize};
use specta::Type;

use super::{HistoryKeeper, HistoryKeeperParams};
use crate::Result;

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
    config: AlgorithmConfig,
    params: HistoryKeeperParams<'_>,
) -> Result<Box<dyn HistoryKeeper>> {
    match config {
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
