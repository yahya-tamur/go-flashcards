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

// is all this boilerplate? should I implement the impl appdata functions here for example?

// do the two get functions need to be separate?

//maybe redundant, but is easier to add to in the future.
#[derive(Serialize, Deserialize)]
struct GameData {
    game: GameState,
    tree: Vec<Vec<Option<Move>>>,
    row: usize,
    col: usize,
}

//copies game and tree. If tauri serializes anyway, is that necessary?
#[tauri::command]
async fn get_data(state: tauri::State<'_, Mutex<AppData>>) -> Result<GameData, String> {
    let state = state.lock().await;
    Ok(GameData {
        game: state.game,
        tree: state
            .move_tree
            .as_ref()
            .map_or_else(|| vec![vec![None]], |mt| mt.table.clone()),
        row: state.row,
        col: state.col,
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
    stone: Color,
) -> Result<(), String> {
    state
        .lock()
        .await
        .initialize_tree(stone)
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
            initialize_tree
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
