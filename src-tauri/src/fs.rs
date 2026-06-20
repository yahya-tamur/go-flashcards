use flate2::{read::GzDecoder, write::GzEncoder, Compression};
use std::{io::Result, path::Path, time::SystemTime};
use tokio::fs;

use serde_json;

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

pub async fn save_exercises(
    app_data: &Path,
    vec: &Vec<Problem>,
    exercise_file: &str,
) -> Result<()> {
    create_directory_structure(app_data).await?;
    let mut gz = GzEncoder::new(Vec::new(), Compression::best());
    serde_json::to_writer(&mut gz, &vec)?;
    fs::write(
        app_data
            .join("app_data")
            .join("exercises")
            .join(exercise_file.to_owned() + ".json.gz"),
        gz.finish()?,
    )
    .await?;
    Ok(())
}

pub async fn load_exercises(app_data: &Path, exercise_file: &str) -> Result<(bool, Vec<Problem>)> {
    let file = app_data
        .join("app_data")
        .join("exercises")
        .join(exercise_file.to_owned() + ".json.gz");

    if file.exists() {
        let compressed = fs::read(file).await?;

        let gz = GzDecoder::new(&compressed[..]);
        let ans = serde_json::from_reader(gz)?;
        Ok((false, ans))
    } else {
        Ok((true, Vec::new()))
    }
}

use crate::problem::Problem;
use crate::study_data::History;

pub async fn load_history(app_data: &Path, exercise_file: &str) -> Result<Vec<History>> {
    let file = app_data
        .join("app_data")
        .join("history")
        .join(exercise_file.to_owned() + ".json.gz");

    if file.exists() {
        let compressed = fs::read(file).await?;

        let gz = GzDecoder::new(&compressed[..]);
        let ans = serde_json::from_reader(gz)?;
        Ok(ans)
    } else {
        Ok(Vec::new())
    }
}

pub async fn save_history(app_data: &Path, vec: &Vec<History>, exercise_file: &str) -> Result<()> {
    create_directory_structure(app_data).await?;
    let mut gz = GzEncoder::new(Vec::new(), Compression::best());
    serde_json::to_writer(&mut gz, &vec)?;
    fs::write(
        app_data
            .join("app_data")
            .join("history")
            .join(exercise_file.to_owned() + ".json.gz"),
        gz.finish()?,
    )
    .await?;
    Ok(())
}

pub async fn save_config(app_data: &Path, s: &str) -> Result<()> {
    fs::write(app_data.join("app_data").join("config.toml"), s).await
}

pub async fn load_config(app_data: &Path) -> Result<String> {
    fs::read_to_string(app_data.join("app_data").join("config.toml")).await
}

// returns list of exercises in order of most recently modified
pub async fn list_exercises(app_data: &Path) -> Result<Vec<String>> {
    let mut v: Vec<(String, SystemTime)> = Vec::new();

    let mut entries = fs::read_dir(app_data.join("app_data").join("exercises")).await?;

    while let Some(entry) = entries.next_entry().await? {
        v.push((
            entry
                .path()
                .file_prefix()
                .unwrap()
                .to_str()
                .unwrap()
                .to_string(),
            entry.metadata().await?.created()?,
        ))
    }
    v.sort_by_key(|(_a, b)| *b);

    Ok(v.into_iter().map(|(a, _b)| a).collect())
}

use tauri_plugin_dialog::DialogExt;

pub async fn receive_sgf(app: tauri::AppHandle) -> std::result::Result<String, ()> {
    if let Some(filepath) = app
        .dialog()
        .file()
        .add_filter("Sgf", &["sgf"])
        .blocking_pick_file()
    {
        let path = filepath.into_path().map_err(|_| ())?;
        let filecontent = fs::read(path).await.map_err(|_| ())?;
        let sgfstr = String::from_utf8(filecontent).map_err(|_| ())?;

        Ok(sgfstr)
    } else {
        Err(())
    }
}

pub async fn save_sgf(app_data: &Path, name: &str, sgf: &str) -> Result<()> {
    fs::write(
        app_data
            .join("app_data")
            .join("sgfs")
            .join(name.to_owned() + ".sgf"),
        sgf,
    )
    .await?;
    Ok(())
}

//pub async fn load_config(app_data: &Path) -> Result<Config> {
//
//}

//pub async fn get_config()
