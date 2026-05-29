// refactor later I guess

pub mod app_data;
pub mod config;
pub mod editing_data;
pub mod flashcard_algorithm;
pub mod fs;
pub mod go_rules;
pub mod move_tree;
pub mod study_data;

use tauri::{Builder, Manager};

use tokio::sync::Mutex;

use app_data::AppData;
use go_rules::{Color, GameState};
use move_tree::*;

use serde::{Deserialize, Serialize};

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

#[tauri::command]
async fn set_stone(
    state: tauri::State<'_, Mutex<AppData>>,
    i: usize,
    j: usize,
    color: Option<Color>,
) -> Result<(), String> {
    match &mut *(state.lock().await) {
        AppData::Editing(editing_data) => {
            editing_data.place_stone(i, j, color);
            Ok(())
        }
        _ => unimplemented!(),
    }
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
    match &*state.lock().await {
        AppData::Editing(editing_data) => {
            let (row, col) = editing_data.tree_loc;
            let current_move = editing_data.get_current_move().unwrap();
            let color = current_move.color;
            let comment = current_move.comment.clone();
            let variant = current_move.variant;
            let (current_location, max_location) = editing_data.location();
            Ok(Snapshot {
                game: editing_data.game,

                table: editing_data.get_table(),
                row,
                col,
                color,
                comment,
                variant,

                current_location,
                max_location,
            })
        }
        AppData::Study(study_data) => {
            let move_tree = study_data.get_move_tree();
            let (row, col) = study_data.tree_loc;
            let current_move = move_tree.table[row][col].as_ref().unwrap();
            let (current_location, max_location) = study_data.location();

            Ok(Snapshot {
                game: study_data.game,
                table: move_tree.table.clone(),
                row,
                col,
                color: current_move.color,
                comment: current_move.comment.clone(),
                variant: current_move.variant,
                current_location,
                max_location,
            })
        }
        _ => unimplemented!(),
    }
}

//copies game and tree. If tauri serializes anyway, is that necessary?
#[tauri::command]
async fn set_window(
    state: tauri::State<'_, Mutex<AppData>>,
    window: (usize, usize, usize, usize),
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            editing_data.game.window = window;
            editing_data.clear_to(window);
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn play(
    state: tauri::State<'_, Mutex<AppData>>,
    loc: Option<(usize, usize)>,
    color: Color,
) -> Result<bool, String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => Ok(editing_data.play(loc, color)),
        AppData::Study(study_data) => Ok(study_data.try_play(loc, color)),
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn jump(state: tauri::State<'_, Mutex<AppData>>, r: usize, c: usize) -> Result<(), String> {
        match &mut *state.lock().await {
        AppData::Editing(editing_data) => {editing_data.jump(r, c); Ok(())},
        AppData::Study(study_data) => {study_data.jump(r, c); Ok(())},
        _ => unimplemented!(),
    }   
}

#[tauri::command]
async fn start_setup(state: tauri::State<'_, Mutex<AppData>>, index: usize) -> Result<(), String> {
    if let AppData::Editing(editing_data) = &mut *state.lock().await {
        editing_data.start_setup(index);
        Ok(())
    } else {
        Err("aa".to_string())
    }
}

#[tauri::command]
async fn finish_setup(state: tauri::State<'_, Mutex<AppData>>, color: Color) -> Result<(), String> {
    if let AppData::Editing(editing_data) = &mut *state.lock().await {
        editing_data.finish_setup(color);
        Ok(())
    } else {
        Err("aa".to_string())
    }
}

#[tauri::command]
async fn collapse_tree(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    if let AppData::Editing(editing_data) = &mut *state.lock().await {
        editing_data.collapse_tree();
        Ok(())
    } else {
        Err("aa".to_string())
    }
}

#[tauri::command]
async fn comment(state: tauri::State<'_, Mutex<AppData>>, comment: String) -> Result<(), String> {
    // if let AppData::Editing(editing_data) = &mut *state.lock().await {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            if let Some(mov) = editing_data.get_current_move_mut() {
                mov.comment = comment;
            } else {
                println!("Something happened? {:?}", editing_data);
            }
            Ok(())
        }
        aaa => {
            println!("Not in editing mode???! {:?}", aaa);
            Err("aa".to_string())
        }
    }
}

#[tauri::command]
async fn set_variant(
    state: tauri::State<'_, Mutex<AppData>>,
    variant: Variant,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            if let Some(mov) = editing_data.get_current_move_mut() {
                mov.variant = variant;
            } else {
                println!("Something happened? {:?}", editing_data);
            }
            Ok(())
        }
        aaa => {
            println!("Not in editing mode???! {:?}", aaa);
            Err("aa".to_string())
        }
    }
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
        aaa => {
            println!("Not in editing mode???! {:?}", aaa);
            Err("aa".to_string())
        }
    }
}

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
        aaa => {
            println!("Not in editing mode???! {:?}", aaa);
            Err("aa".to_string())
        }
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
        AppData::Study(study_data) => Ok(study_data
            .answer(&app.path().app_data_dir().unwrap(), correct)
            .await
            ),
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn get_history(
    state: tauri::State<'_, Mutex<AppData>>,
) -> Result<Vec<bool>, String> {
    match &mut *state.lock().await {
        AppData::Study(study_data) => Ok(study_data
            .get_history()
            .iter()
            .map(|a| *a)
            .collect()),
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
            set_stone,
            start_setup,
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
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
