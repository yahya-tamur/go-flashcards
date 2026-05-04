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
    comment: String,
    mark: Variant
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
    if let Some(tree_data) = state.tree_data.as_ref() {
        let color = tree_data.color()?;
        let comment = tree_data.comment()?;
        let mark = tree_data.mark()?;
        Ok(Snapshot {
        game: state.game,
        tree:  Some(TreeSnapshot {
            table: tree_data.move_tree.table.clone(),
            row: tree_data.row,
            col: tree_data.col,
            color,
            comment,
            mark,
        })})
    } else {
        Ok(Snapshot {
            game: state.game,
            tree: None
        })
    }
    
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
async fn clear_to(state: tauri::State<'_, Mutex<AppData>>, rows: (usize, usize), cols: (usize, usize)) -> Result<(), String> {
    state
        .lock()
        .await
        .clear_to(rows, cols)
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

#[tauri::command]
async fn collapse_tree(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    state
        .lock()
        .await
        .collapse_tree()
        .then_some(())
        .ok_or("err".to_string())
}

#[tauri::command]
async fn comment(state: tauri::State<'_, Mutex<AppData>>, comment: String) -> Result<(), String> {
    state
        .lock()
        .await
        .tree_data
        .as_mut()
        .ok_or("err".to_string())
        .and_then(|td| {td.set_comment(comment)})
}

#[tauri::command]
async fn set_mark(state: tauri::State<'_, Mutex<AppData>>, variant: Variant) -> Result<(), String> {
    println!("aaa {:?}", variant);
    state
        .lock()
        .await
        .tree_data
        .as_mut()
        .ok_or("err".to_string())
        .and_then(|td| {td.set_mark(variant)})

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
            initialize_tree,
            collapse_tree,
            clear_to,
            comment,
            set_mark,
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
