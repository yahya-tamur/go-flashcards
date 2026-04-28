// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use go_flashcards_lib::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
fn main() {
    run();
}
