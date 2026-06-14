// refactor later I guess

pub mod app_data;
pub mod config;
pub mod editing_data;
pub mod flashcard_algorithm;
pub mod fs;
pub mod game_state;
pub mod move_tree;
pub mod problem;
pub mod snapshot;
pub mod study_data;

use config::ActiveConfig;
use game_state::Mark;
use move_tree::MoveTree;
use problem::Variant;
use snapshot::{snapshot, Snapshot};

use tauri::{Builder, Manager};

use tokio::sync::Mutex;

use app_data::AppData;
use game_state::Color;

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

async fn apply_to_move_tree<'a, A>(
    state: tauri::State<'a, Mutex<AppData>>,
    f: impl FnOnce(&mut MoveTree, bool) -> A,
) -> A {
    match &mut *(state.lock().await) {
        AppData::Editing(editing_data) => f(&mut editing_data.move_tree, false),
        AppData::Study(study_data) => f(&mut study_data.move_tree, true),
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn place_stone(
    state: tauri::State<'_, Mutex<AppData>>,
    i: usize,
    j: usize,
    color: Option<Color>,
) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| move_tree.place_stone(i, j, color)).await;
    Ok(())
}

#[tauri::command]
async fn get_data(state: tauri::State<'_, Mutex<AppData>>) -> Result<Snapshot, String> {
    match &*state.lock().await {
        AppData::Editing(editing_data) => Ok(snapshot(
            &editing_data.move_tree,
            editing_data.location(),
            &editing_data.config,
        )),
        AppData::Study(study_data) => Ok(snapshot(
            &study_data.move_tree,
            study_data.location(),
            &study_data.config,
        )),
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn set_window(
    state: tauri::State<'_, Mutex<AppData>>,
    window: (usize, usize, usize, usize),
) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| move_tree.set_window(window)).await;
    Ok(())
}

#[tauri::command]
async fn try_set_window(
    state: tauri::State<'_, Mutex<AppData>>,
    window: (usize, usize, usize, usize),
) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| move_tree.try_set_window(window)).await;
    Ok(())
}

#[tauri::command]
async fn play(
    state: tauri::State<'_, Mutex<AppData>>,
    loc: Option<(usize, usize)>,
    color: Color,
) -> Result<bool, String> {
    Ok(apply_to_move_tree(state, |move_tree, study| move_tree.play(loc, color, study)).await)
}

#[tauri::command]
async fn jump(state: tauri::State<'_, Mutex<AppData>>, r: usize, c: usize) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| move_tree.jump(r, c)).await;
    Ok(())
}

#[tauri::command]
async fn delete_branch(state: tauri::State<'_, Mutex<AppData>>) -> Result<bool, String> {
    Ok(apply_to_move_tree(state, |move_tree, _| move_tree.delete_branch()).await)
}

#[tauri::command]
async fn new_exercise(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            editing_data.new_exercise();
            Ok(())
        }
        AppData::Study(study_data) => {
            study_data.next().await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn finish_setup(state: tauri::State<'_, Mutex<AppData>>, color: Color) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| move_tree.finish_setup(color)).await;
    Ok(())
}

#[tauri::command]
async fn collapse_tree(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| move_tree.collapse_tree()).await;
    Ok(())
}

#[tauri::command]
async fn comment(state: tauri::State<'_, Mutex<AppData>>, comment: String) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| {
        move_tree.current_mut().comment = comment;
    })
    .await;
    Ok(())
}

#[tauri::command]
async fn set_mark(
    state: tauri::State<'_, Mutex<AppData>>,
    mark: Option<Mark>,
    i: usize,
    j: usize,
) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, _| {
        move_tree.set_mark(mark, i, j);
    })
    .await;

    Ok(())
}

#[tauri::command]
async fn set_variant(
    state: tauri::State<'_, Mutex<AppData>>,
    variant: Variant,
) -> Result<(), String> {
    apply_to_move_tree(state, |move_tree, study| {
        move_tree.set_variant(variant, study)
    })
    .await;
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
        AppData::Study(study_data) => {
            study_data.jump_to_exercise(index);
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn save_exercises(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => {
            let exercises = fs::list_exercises(&app.path().app_data_dir().unwrap())
                .await
                .unwrap();
            if exercises.into_iter().all(|e| e != editing_data.file) {
                config::add_exercise(&app.path().app_data_dir().unwrap(), &editing_data.file).await;
            }
            editing_data.save(&app.path().app_data_dir().unwrap()).await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

// frontend switches itself to EditingPhase.
// EditingScreen useEffect calls this, which switches
// it to editing mode.
#[tauri::command]
async fn load_exercises(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    exercise: String,
) -> Result<(), String> {
    state
        .lock()
        .await
        .edit_new(&app.path().app_data_dir().unwrap(), &exercise)
        .await;
    Ok(())
}

#[tauri::command]
async fn get_config(state: tauri::State<'_, Mutex<AppData>>) -> Result<ActiveConfig, String> {
    match &mut *state.lock().await {
        AppData::Editing(editing_data) => Ok((*editing_data.config).clone()),
        AppData::Study(study_data) => Ok((*study_data.config).clone()),
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn get_config_str(app: tauri::AppHandle) -> Result<String, String> {
    Ok(fs::load_config(&app.path().app_data_dir().unwrap())
        .await
        .unwrap())
}

#[tauri::command]
async fn set_config_str(
    app: tauri::AppHandle,
    config: String,
) -> Result<(), (String, usize, usize)> {
    match config::validate(&app.path().app_data_dir().unwrap(), Some(&config)).await {
        Ok(()) => {
            crate::fs::save_config(&app.path().app_data_dir().unwrap(), &config)
                .await
                .unwrap();
            Ok(())
        }
        Err(error) => Err(error),
    }
}

#[tauri::command]
async fn list_exercises(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    Ok(fs::list_exercises(&app.path().app_data_dir().unwrap())
        .await
        .unwrap())
}

#[tauri::command]
async fn main_menu(state: tauri::State<'_, Mutex<AppData>>) -> Result<(), String> {
    state.lock().await.main();
    Ok(())
}

#[tauri::command]
async fn load_study(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    flashcard_set: &str,
) -> Result<(), String> {
    state
        .lock()
        .await
        .study_new(&app.path().app_data_dir().unwrap(), flashcard_set)
        .await;

    Ok(())
}

#[tauri::command]
async fn list_studies(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    Ok(crate::config::flashcard_sets(&app.path().app_data_dir().unwrap()).await)
}

#[tauri::command]
async fn answer(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    correct: bool,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Study(study_data) => {
            study_data
                .answer(&app.path().app_data_dir().unwrap(), correct)
                .await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn stop_editing(
    state: tauri::State<'_, Mutex<AppData>>,
    app: tauri::AppHandle,
    save: bool,
) -> Result<(), String> {
    match &mut *state.lock().await {
        AppData::Study(study_data) => {
            study_data
                .stop_editing(&app.path().app_data_dir().unwrap(), save)
                .await;
            Ok(())
        }
        _ => unimplemented!(),
    }
}

#[tauri::command]
async fn get_history(state: tauri::State<'_, Mutex<AppData>>) -> Result<Vec<bool>, String> {
    match &mut *state.lock().await {
        AppData::Study(study_data) => Ok(study_data.get_history().iter().copied().collect()),
        _ => unimplemented!(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        //.any_thread()
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            app.manage(Mutex::new(AppData::default()));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_data,
            play,
            jump,
            delete_branch,
            place_stone,
            new_exercise,
            finish_setup,
            collapse_tree,
            comment,
            set_variant,
            jump_to_exercise,
            save_exercises,
            load_exercises,
            get_config_str,
            set_config_str,
            get_config,
            list_exercises,
            list_studies,
            main_menu,
            set_window,
            try_set_window,
            load_study,
            answer,
            get_history,
            stop_editing,
            set_mark
        ])
        .run(tauri::generate_context!())
        .unwrap();
}
