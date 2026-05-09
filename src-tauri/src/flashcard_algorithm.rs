use uuid::Uuid;

use crate::config::Config;

use rand::random_range;

// for now, just give equal probability to each pool.

// selection_pool[0]: never seen, selection_pool[1]: got correct zero times,
// selection_pool[2]: got correct once, etc.

// returns index in selection_pool.

pub fn pick(_config: &Config, selection_pool: &[Vec<Uuid>]) -> (usize, usize) {
    let i = random_range(0..selection_pool.len());
    let j = random_range(0..selection_pool[i].len());
    (i, j)
}
