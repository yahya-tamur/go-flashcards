// refactor later I guess

pub mod app_data;
pub mod color;
pub mod go_rules;
pub mod move_tree;

use tauri::{Builder, Manager};
use tokio::sync::Mutex;

use app_data::*;
use color::*;
use move_tree::*;

use serde::{Deserialize, Serialize};

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

#[derive(Serialize, Deserialize)]
struct TreeSnapshot {
    table: Vec<Vec<Option<Move>>>,
    row: usize,
    col: usize,
    color: Color,
}

// struct that gets sent to frontend.
#[derive(Serialize, Deserialize)]
struct Snapshot {
    game: GameState,
    tree: Option<TreeSnapshot>,
}

#[tauri::command]
async fn set_stone(
    state: tauri::State<'_, Mutex<AppData>>,
    i: usize,
    j: usize,
    color: Option<Color>,
) -> Result<(), String> {
    state
        .lock()
        .await
        .place_stone(i, j, color)
        .then_some(())
        .ok_or("error".to_string())
}

//copies game and tree. If tauri serializes anyway, is that necessary?
#[tauri::command]
async fn get_data(state: tauri::State<'_, Mutex<AppData>>) -> Result<Snapshot, String> {
    let state = state.lock().await;
    println!("{:?}", state.tree_data);
    Ok(Snapshot {
        game: state.game,
        tree: state.tree_data.as_ref().map(|tree_data| TreeSnapshot {
            table: tree_data.move_tree.table.clone(),
            row: tree_data.row,
            col: tree_data.col,
            color: tree_data.color(),
        }),
    })
}

#[tauri::command]
async fn play(
    state: tauri::State<'_, Mutex<AppData>>,
    loc: Option<(usize, usize)>,
    color: Color,
) -> Result<bool, String> {
    Ok(state.lock().await.play(loc, color))
}

#[tauri::command]
async fn jump(state: tauri::State<'_, Mutex<AppData>>, r: usize, c: usize) -> Result<(), String> {
    state
        .lock()
        .await
        .jump(r, c)
        .then_some(())
        .ok_or("err".to_string())
}

#[tauri::command]
async fn initialize_tree(
    state: tauri::State<'_, Mutex<AppData>>,
    color: Color,
) -> Result<(), String> {
    state
        .lock()
        .await
        .initialize_tree(color)
        .then_some(())
        .ok_or("err".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        //.any_thread()
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_data,
            play,
            jump,
            set_stone,
            initialize_tree
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
