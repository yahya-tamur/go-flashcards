// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use go_flashcards_lib::*;

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

//#[tauri::command]
//async fn get_game(state: tauri::State<'_, Mutex<AppData>>) -> Result<GameState, String> {
    //Ok(state.lock().await.move_tree.game)
//}

// later something should do something to move_tree, etc.
//#[tauri::command]
//async fn play(
    //state: tauri::State<'_, Mutex<AppData>>,
    //i: usize,
    //j: usize,
    //color: Stone,
//) -> Result<GameState, String> {
    //if place_stone(&mut state.lock().await.move_tree.game, i, j, color) {
        //Ok(state.lock().await.move_tree.game)
    //} else {
        //Err("invalid move".to_owned())
    //}
//}

// make other commands accessing / changing movetree to also always return updated board?

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    run();
}
