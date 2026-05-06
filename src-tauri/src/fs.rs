use flate2::{read::GzDecoder, write::GzEncoder, Compression};
use std::{io::Result, path::Path};
use tokio::fs;

use serde_json;

use crate::move_tree::MoveTree;

//later copy starting directory from bundle to app data?

// /.com.../
//      /app_data
//          /exercise_sets
//              prob.json.(gz?)
//          /history
//              prob.(json?).(gz?)
//          config.?
//
pub async fn create_directory_structure(app_data: &Path) -> Result<()> {
    fs::create_dir_all(app_data.join("app_data").join("exercises")).await?;
    fs::create_dir_all(app_data.join("app_data").join("history")).await?;
    Ok(())
}

pub async fn save_exercises(app_data: &Path, vec: &Vec<MoveTree>) -> Result<()> {
    create_directory_structure(app_data).await?;
    let mut gz = GzEncoder::new(Vec::new(), Compression::best());
    serde_json::to_writer(&mut gz, &vec)?;
    fs::write(
        app_data
            .join("app_data")
            .join("exercises")
            .join("test.json.gz"),
        gz.finish()?,
    )
    .await?;
    Ok(())
}

pub async fn load_exercises(app_data: &Path) -> Result<Vec<MoveTree>> {
    let compressed = fs::read(
        app_data
            .join("app_data")
            .join("exercises")
            .join("test.json.gz"),
    )
    .await?;

    let gz = GzDecoder::new(&compressed[..]);
    let ans = serde_json::from_reader(gz)?;

    Ok(ans)
}
