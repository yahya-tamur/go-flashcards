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
    if let AppData::Editing(editing_data) = &mut *(state.lock().await) {
        if editing_data.place_stone(i, j, color) {
            return Ok(());
        }
    }
    Err("error".to_string())
}

#[derive(Serialize, Deserialize)]
pub struct TreeSnapshot {
    pub table: Vec<Vec<Option<Move>>>,
    pub row: usize,
    pub col: usize,
    pub color: Color,
    pub comment: String,
    pub variant: Variant,
}

// struct that gets sent to frontend.

// maybe later put a struct inside this that's an enum based on state
// (and make edit_location be one of its enums)
#[derive(Serialize, Deserialize)]
pub struct Snapshot {
    pub game: GameState,
    pub tree: Option<TreeSnapshot>,
    pub edit_location: (usize, usize),
}

//copies game and tree. If tauri serializes anyway, is that necessary?
#[tauri::command]
async fn get_data(state: tauri::State<'_, Mutex<AppData>>) -> Result<Snapshot, String> {
    println!("getting data.");
    if let AppData::Editing(editing_data) = &*state.lock().await {
        println!("{:?}", editing_data);
        if let Some((row, col)) = editing_data.tree_loc {
            let current_move = editing_data.get_current_move().unwrap();
            let color = current_move.color;
            let comment = current_move.comment.clone();
            let variant = current_move.variant;
            Ok(Snapshot {
                game: editing_data.game,
                tree: Some(TreeSnapshot {
                    table: editing_data.get_table(),
                    row,
                    col,
                    color,
                    comment,
                    variant,
                }),
                edit_location: editing_data.location(),
            })
        } else {
            Ok(Snapshot {
                game: editing_data.game,
                tree: None,
                edit_location: editing_data.location(),
            })
        }
    } else {
        Err("unimplemented!".to_string())
    }
}

//copies game and tree. If tauri serializes anyway, is that necessary?
#[tauri::command]
async fn set_window(
    state: tauri::State<'_, Mutex<AppData>>,
    window: (usize, usize, usize, usize),
) -> Result<(), String> {
    if let AppData::Editing(editing_data) = &mut *state.lock().await {
        if editing_data.tree_loc.is_none() {
            editing_data.game.window = window;
            editing_data.clear_to(window);
            Ok(())
        } else {
            Err("tree already there?".to_string())
        }
    } else {
        Err("unimplemented!".to_string())
    }
}

#[tauri::command]
async fn play(
    state: tauri::State<'_, Mutex<AppData>>,
    loc: Option<(usize, usize)>,
    color: Color,
) -> Result<bool, String> {
    if let AppData::Editing(editing_data) = &mut *state.lock().await {
        Ok(editing_data.play(loc, color))
    } else {
        Err("aa".to_string())
    }
}

#[tauri::command]
async fn jump(state: tauri::State<'_, Mutex<AppData>>, r: usize, c: usize) -> Result<(), String> {
    if let AppData::Editing(editing_data) = &mut *state.lock().await {
        editing_data.jump(r, c);
        Ok(())
    } else {
        Err("aa".to_string())
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
    exercise: String,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            editing_data
                .save(&app.path().app_data_dir().unwrap(), &exercise)
                .await;
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

// later also edit config file.
#[tauri::command]
async fn edit_new(
    app: tauri::AppHandle,
    state: tauri::State<'_, Mutex<AppData>>,
    exercise: &str,
) -> Result<(), String> {
    state
        .lock()
        .await
        .edit_new(&app.path().app_data_dir().unwrap(), exercise)
        .await;
    Ok(())
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
            main_menu,
            set_window,
            edit_new,
            load_study,
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
