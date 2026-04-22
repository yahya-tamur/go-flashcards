use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct MyStruct {
    board: Vec<Vec<u8>>,
    comment: String,
}

impl MyStruct {
    pub fn new() -> MyStruct {
        MyStruct { board: vec![vec![0,1], vec![2,3]], comment: ("blorb".to_string()) }
    }
}

#[tauri::command]
fn greet2() -> MyStruct {
    MyStruct::new()
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, greet2])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
