// refactor later I guess

pub mod app_data;
pub mod config;
pub mod editing_data;
pub mod flashcard_algorithm;
pub mod fs;
pub mod go_rules;
pub mod move_tree;
pub mod navigator;
pub mod study_data;

use crate::navigator::Navigator;

use tauri::{Builder, Manager};

use tokio::sync::Mutex;

use app_data::AppData;
use go_rules::{Color, GameState};
use move_tree::*;

use serde::{Deserialize, Serialize};

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

async fn navigate<'a, A>(
    state: tauri::State<'a, Mutex<AppData>>,
    f: impl FnOnce(&mut Navigator, bool) -> A,
) -> A {
    match &mut *(state.lock().await) {
        AppData::Editing(editing_data) => f(&mut editing_data.navigator, false),
        AppData::Study(study_data) => f(&mut study_data.navigator, true),
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn set_stone(
    state: tauri::State<'_, Mutex<AppData>>,
    i: usize,
    j: usize,
    color: Option<Color>,
) -> Result<(), String> {
    navigate(state, |nav, _| nav.place_stone(i, j, color)).await;
    Ok(())
}

// struct that gets sent to frontend.

// maybe later put a struct inside this that's an enum based on state
// (and make edit_location be one of its enums)
#[derive(Serialize, Deserialize)]
pub struct Snapshot {
    pub game: GameState,
    pub table: Vec<Vec<Option<Move>>>,
    pub row: usize,
    pub col: usize,
    pub color: Color,
    pub comment: String,
    pub variant: Variant,
    pub current_location: usize,
    pub max_location: usize,
}

//copies game and tree. If tauri serializes anyway, is that necessary?
#[tauri::command]
async fn get_data(state: tauri::State<'_, Mutex<AppData>>) -> Result<Snapshot, String> {
    println!("getting data.");
    let get_data = |nav: &Navigator, loc: (usize, usize)| {
        let (row, col) = nav.tree_loc;
        let current_move = nav.current();
        Snapshot {
            game: nav.game,
            table: nav.move_tree.table.clone(),
            row,
            col,
            color: current_move.color,
            comment: current_move.comment.clone(),
            variant: current_move.variant,
            current_location: loc.0,
            max_location: loc.1,
        }
    };
    match &*state.lock().await {
        AppData::Editing(editing_data) => {
            Ok(get_data(&editing_data.navigator, editing_data.location()))
        }
        AppData::Study(study_data) => Ok(get_data(&study_data.navigator, study_data.location())),
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn set_window(
    state: tauri::State<'_, Mutex<AppData>>,
    window: (usize, usize, usize, usize),
) -> Result<(), String> {
    navigate(state, |nav, _| nav.clear_to(window)).await;
    Ok(())
}

#[tauri::command]
async fn play(
    state: tauri::State<'_, Mutex<AppData>>,
    loc: Option<(usize, usize)>,
    color: Color,
) -> Result<bool, String> {
    Ok(navigate(state, |nav, study| nav.play(loc, color, study)).await)
}

#[tauri::command]
async fn jump(state: tauri::State<'_, Mutex<AppData>>, r: usize, c: usize) -> Result<(), String> {
    navigate(state, |nav, _| nav.jump(r, c)).await;
    Ok(())
}

#[tauri::command]
async fn delete_branch(state: tauri::State<'_, Mutex<AppData>>) -> Result<bool, String> {
    Ok(navigate(state, |nav, _| nav.delete_branch()).await)
}

#[tauri::command]
async fn new_exercise(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            editing_data.new_exercise();
            Ok(())
        }
        AppData::Study(study_data) => {
            study_data.next().await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn finish_setup(state: tauri::State<'_, Mutex<AppData>>, color: Color) -> Result<(), String> {
    navigate(state, |nav, _| nav.finish_setup(color)).await;
    Ok(())
}

#[tauri::command]
async fn collapse_tree(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    navigate(state, |nav, _| nav.collapse_tree()).await;
    Ok(())
}

#[tauri::command]
async fn comment(state: tauri::State<'_, Mutex<AppData>>, comment: String) -> Result<(), String> {
    navigate(state, |nav, _| {
        nav.current_mut().comment = comment;
    })
    .await;
    Ok(())
}

#[tauri::command]
async fn set_variant(
    state: tauri::State<'_, Mutex<AppData>>,
    variant: Variant,
) -> Result<(), String> {
    navigate(state, |nav, study| nav.set_variant(variant, study)).await;
    Ok(())
}

#[tauri::command]
async fn jump_to_exercise(
    state: tauri::State<'_, Mutex<AppData>>,
    index: usize,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            editing_data.jump_to_exercise(index);
            Ok(())
        }
        AppData::Study(study_data) => {
            study_data.jump_to_exercise(index);
            Ok(())
        }
        _ => unimplemented!(),
    }
}

// TODO~~
#[tauri::command]
async fn save_exercises(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            editing_data.save(&app.path().app_data_dir().unwrap()).await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

// frontend switches itself to EditingPhase.
// EditingScreen useEffect calls this, which switches
// it to editing mode.
#[tauri::command]
async fn load_exercises(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    exercise: String,
) -> Result<(), String> {
    state
        .lock()
        .await
        .edit_new(&app.path().app_data_dir().unwrap(), &exercise)
        .await;
    Ok(())
}

use crate::config::read_toml;

#[tauri::command]
async fn get_config(app: tauri::AppHandle) -> Result<String, String> {
    fs::load_config(&app.path().app_data_dir().unwrap())
        .await
        .map_err(|err| {
            println!("{:?}", err);
            "aa".to_string()
        })
}

#[tauri::command]
async fn set_config(app: tauri::AppHandle, config: String) -> Result<(), (String, usize, usize)> {
    match read_toml(&config) {
        Ok(_config_obj) => {
            crate::fs::save_config(&app.path().app_data_dir().unwrap(), &config)
                .await
                .unwrap();
            Ok(())
        }
        Err(error) => Err(error),
    }
}

#[tauri::command]
async fn list_exercises(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    match fs::list_exercises(&app.path().app_data_dir().unwrap()).await {
        Ok(v) => Ok(v),
        Err(e) => {
            println!("{:?}", e);
            Err("aa".to_string())
        }
    }
}

#[tauri::command]
async fn main_menu(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    state.lock().await.main();
    Ok(())
}

#[tauri::command]
async fn load_study(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    flashcard_set: &str,
) -> Result<(), String> {
    state
        .lock()
        .await
        .study_new(&app.path().app_data_dir().unwrap(), flashcard_set)
        .await;

    Ok(())
}

use crate::fs::load_config;
#[tauri::command]
async fn list_studies(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let config_str = load_config(&app.path().app_data_dir().unwrap())
        .await
        .unwrap();
    match crate::config::read_toml(&config_str) {
        Ok(config) => Ok(config.flashcard_set.into_iter().map(|f| f.name).collect()),
        Err(_) => Err("invalid config".to_string()),
    }
}

#[tauri::command]
async fn answer(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    correct: bool,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Study(study_data) => {
            study_data
                .answer(&app.path().app_data_dir().unwrap(), correct)
                .await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn stop_editing(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    save: bool,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Study(study_data) => {
            study_data
                .stop_editing(&app.path().app_data_dir().unwrap(), save)
                .await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn get_history(state: tauri::State<'_, Mutex<AppData>>) -> Result<Vec<bool>, String> {
    match &mut *state.lock().await {
        AppData::Study(study_data) => Ok(study_data.get_history().iter().copied().collect()),
        _ => unimplemented!(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        //.any_thread()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_data,
            play,
            jump,
            delete_branch,
            set_stone,
            new_exercise,
            finish_setup,
            collapse_tree,
            comment,
            set_variant,
            jump_to_exercise,
            save_exercises,
            load_exercises,
            get_config,
            set_config,
            list_exercises,
            list_studies,
            main_menu,
            set_window,
            load_study,
            answer,
            get_history,
            stop_editing,
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
