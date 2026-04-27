// refactor later I guess

pub mod common;
pub mod go_rules;
pub mod move_tree;

use tauri::{Builder, Manager};
use tokio::sync::Mutex;

use common::*;
use move_tree::*;

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

// is all this boilerplate? should I implement the impl appdata functions here for example?

// do the two get functions need to be separate?

#[tauri::command]
async fn get_tree(state: tauri::State<'_, Mutex<AppData>>) -> Result<MoveTree, String> {
    Ok(state
        .lock()
        .await
        .move_tree
        .clone()
        .ok_or("tree not initialized")?)
}

#[tauri::command]
async fn get_game(state: tauri::State<'_, Mutex<AppData>>) -> Result<GameState, String> {
    Ok(state.lock().await.game)
}

// later something should do something to move_tree, etc.
#[tauri::command]
async fn play(
    state: tauri::State<'_, Mutex<AppData>>,
    loc: Option<(usize, usize)>,
    r: usize,
    c: usize,
    color: Stone,
) -> Result<(usize, usize), String> {
    Ok(state.lock().await.play(loc, r, c, color).ok_or("err")?)
}

// I guess implement initialize, place_stone later.
#[tauri::command]
async fn jump(state: tauri::State<'_, Mutex<AppData>>, r: usize, c: usize) -> Result<bool, String> {
    Ok(state.lock().await.jump(r, c))
}
// I guess implement initialize, place_stone later.
#[tauri::command]
async fn initialize_tree(
    state: tauri::State<'_, Mutex<AppData>>,
    stone: Stone,
) -> Result<bool, String> {
    Ok(state.lock().await.initialize_tree(stone))
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
            get_tree,
            get_game,
            play,
            jump,
            initialize_tree
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
