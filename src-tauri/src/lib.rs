// refactor later I guess

pub mod go_rules;

#[derive(Clone, Copy, PartialEq, Eq, Debug, Serialize, Deserialize)]
#[repr(u8)]
pub enum Stone {
    Black = 0,
    White = 1,
}

pub fn other_color(c: Stone) -> Stone {
    match c {
        Stone::Black => Stone::White,
        Stone::White => Stone::Black,
    }
}

#[derive(Clone, Copy, Serialize, Deserialize, Default)]
pub struct GameState {
    pub stones: [[Option<Stone>; 21]; 21],
    pub captures: (usize, usize),
    pub ko: Option<(usize, usize)>,
}

#[derive(Serialize, Deserialize, Default)]
pub struct MoveTree {
    pub game: GameState,
}

#[derive(Serialize, Deserialize, Default)]
pub struct AppData {
    pub move_tree: MoveTree,
}

use serde::{Deserialize, Serialize};

use tauri::{Builder, Manager};
use tokio::sync::Mutex;

use go_rules::*;

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


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        //.any_thread()
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_game, play])
        .run(tauri::generate_context!())
        .unwrap();
}

