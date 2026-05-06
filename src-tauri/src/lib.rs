// refactor later I guess

pub mod app_data;
pub mod config_parser;
pub mod editing_data;
pub mod fs;
pub mod go_rules;
pub mod move_tree;

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
    pub mark: Variant,
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
    if let AppData::Editing(editing_data) = &*state.lock().await {
        let edit_location = (editing_data.current_exercise, editing_data.exercises.len());
        if let Some((row, col)) = editing_data.tree_loc {
            let current_move = editing_data.get_current_move().unwrap();
            let color = current_move.color;
            let comment = current_move.comment.clone();
            let mark = current_move.variant;
            Ok(Snapshot {
                game: editing_data.game,
                tree: Some(TreeSnapshot {
                    table: editing_data.exercises[editing_data.current_exercise]
                        .table
                        .clone(),
                    row,
                    col,
                    color,
                    comment,
                    mark,
                }),
                edit_location,
            })
        } else {
            Ok(Snapshot {
                game: editing_data.game,
                tree: None,
                edit_location,
            })
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
async fn clear_to(
    state: tauri::State<'_, Mutex<AppData>>,
    rows: (usize, usize),
    cols: (usize, usize),
) -> Result<(), String> {
    if let AppData::Editing(editing_data) = &mut *state.lock().await {
        editing_data.clear_to(rows, cols);
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
async fn set_mark(state: tauri::State<'_, Mutex<AppData>>, variant: Variant) -> Result<(), String> {
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
async fn edit_new(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    state.lock().await.edit_new();
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
        aaa => {
            println!("Not in editing mode???! {:?}", aaa);
            Err("aa".to_string())
        }
    }
}

#[tauri::command]
async fn save(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            fs::save_exercises(&app.path().app_data_dir().unwrap(), &editing_data.exercises)
                .await
                .map_err(|e| {
                    println!("{:?}", e);
                    "aa".to_string()
                })
        }
        aaa => {
            println!("Not in editing mode???! {:?}", aaa);
            Err("aa".to_string())
        }
    }
}

#[tauri::command]
async fn load(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            editing_data.exercises = fs::load_exercises(&app.path().app_data_dir().unwrap())
                .await
                .unwrap();
            editing_data.tree_loc = Some((0, 0));
            editing_data.current_exercise = 0;
            editing_data.game = editing_data.exercises[0].initial;
            Ok(())
        }

        aaa => {
            println!("Not in editing mode???! {:?}", aaa);
            Err("aa".to_string())
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        //.any_thread()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            println!("{:?}", app.path().app_data_dir());

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
            clear_to,
            comment,
            set_mark,
            edit_new,
            jump_to_exercise,
            save,
            load
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
