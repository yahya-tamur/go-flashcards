// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use go_flashcards_lib::go_rules::*;
use go_flashcards_lib::*;
use tauri::{Builder, Manager};
use tokio::sync::Mutex;

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

#[tauri::command]
async fn get_game(state: tauri::State<'_, Mutex<AppData>>) -> Result<GameState, String> {
    Ok(state.lock().await.move_tree.game)
}

// later something should do something to move_tree, etc.
#[tauri::command]
async fn play(
    state: tauri::State<'_, Mutex<AppData>>,
    i: usize,
    j: usize,
    color: Stone,
) -> Result<GameState, String> {
    if place_stone(&mut state.lock().await.move_tree.game, i, j, color) {
        Ok(state.lock().await.move_tree.game)
    } else {
        Err("invalid move".to_owned())
    }
}

// make other commands accessing / changing movetree to also always return updated board?

fn main() {
    Builder::default()
        .any_thread()
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_game, play])
        .run(tauri::generate_context!())
        .unwrap();
}
