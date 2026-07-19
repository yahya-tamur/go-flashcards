// refactor later I guess

pub mod app_data;
pub mod config;
pub mod error;
pub mod file;
pub mod flashcard_algorithm;
pub mod game;
pub mod interop;
pub mod sgf;

pub use error::Result;

use config::{ActiveConfig, ValidationResult};
use error::error;
use game::{MoveTree, Paint, RectangleMark, Variant};

use tauri::{Builder, Manager};

use tokio::sync::Mutex;

use app_data::AppData;
use game::Color;

//use specta_typescript::{Typescript, semantic};
//use tauri_specta::*

// is std sync mutex better? is tauri multithreaded? probably doesn't matter, since
// won't be getting too many requests / second. Probably didn't even need mutex.

async fn apply_to_move_tree<'a, A>(
    state: tauri::State<'a, Mutex<AppData>>,
    f: impl FnOnce(&mut MoveTree, bool) -> Result<A>,
) -> Result<A> {
    //let a = &mut (&mut *state.lock().await).phase;
    match state.lock().await.phase {
        AppPhase::Editing(ref mut editing_data) => f(&mut editing_data.move_tree, false),
        AppPhase::Study(ref mut study_data) => f(&mut study_data.move_tree, true),
        AppPhase::Main => Err(error("Tried to 'apply to move tree' on main mode.")),
    }
}

#[tauri::command]
#[specta::specta]
async fn set_stones(
    state: tauri::State<'_, Mutex<AppData>>,
    stones: Vec<(u32, u32, Color)>,
) -> Result<()> {
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.set_stones(
            stones
                .into_iter()
                .map(|(i, j, c)| (i as usize, j as usize, c))
                .collect(),
        );
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn get_data(state: tauri::State<'_, Mutex<AppData>>) -> Result<Snapshot> {
    match state.lock().await.phase {
        AppPhase::Editing(ref editing_data) => Ok(MoveTree::snapshot(
            &editing_data.move_tree,
            editing_data.location(),
            None,
        )?),
        AppPhase::Study(ref study_data) => Ok(MoveTree::snapshot(
            &study_data.move_tree,
            study_data.location(),
            Some(study_data.progress()),
        )?),
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn set_window(
    state: tauri::State<'_, Mutex<AppData>>,
    window: (u32, u32, u32, u32),
) -> Result<()> {
    let (a, b, c, d) = window;
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.set_window((a as usize, b as usize, c as usize, d as usize));
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn play(state: tauri::State<'_, Mutex<AppData>>, loc: Option<(u32, u32)>) -> Result<bool> {
    apply_to_move_tree(state, |move_tree, study| {
        move_tree.play(loc.map(|(i, j)| (i as usize, j as usize)), study)
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn jump(state: tauri::State<'_, Mutex<AppData>>, r: u32, c: u32) -> Result<()> {
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.jump(r as usize, c as usize);
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn delete_branch(state: tauri::State<'_, Mutex<AppData>>) -> Result<bool> {
    apply_to_move_tree(state, |move_tree, _| Ok(move_tree.delete_branch())).await
}

#[tauri::command]
#[specta::specta]
async fn new_exercise(state: tauri::State<'_, Mutex<AppData>>, insert: bool) -> Result<()> {
    match state.lock().await.phase {
        AppPhase::Editing(ref mut editing_data) => {
            let _: () = editing_data.new_exercise(insert)?;
            Ok(())
        }
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn next_exercise(state: tauri::State<'_, Mutex<AppData>>) -> Result<()> {
    match state.lock().await.phase {
        AppPhase::Study(ref mut study_data) => study_data.next_question(),
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn delete_exercise(state: tauri::State<'_, Mutex<AppData>>) -> Result<()> {
    match state.lock().await.phase {
        AppPhase::Editing(ref mut editing_data) => {
            let _: () = editing_data.delete_exercise()?;
            Ok(())
        }
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn finish_setup(state: tauri::State<'_, Mutex<AppData>>, color: Color) -> Result<()> {
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.finish_setup(Some(color))?;
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn collapse_tree(state: tauri::State<'_, Mutex<AppData>>) -> Result<()> {
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.collapse_tree()?;
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn comment(state: tauri::State<'_, Mutex<AppData>>, comment: String) -> Result<()> {
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.current_mut()?.comment = comment;
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn paint(
    state: tauri::State<'_, Mutex<AppData>>,
    paint: Paint,
    locs: Vec<(u32, u32)>,
    label: String,
) -> Result<()> {
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.paint(
            paint,
            locs.into_iter()
                .map(|(i, j)| (i as usize, j as usize))
                .collect(),
            label,
        )?;
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn mark_rectangle(
    state: tauri::State<'_, Mutex<AppData>>,
    mark: RectangleMark,
    start: (u32, u32),
    end: (u32, u32),
) -> Result<()> {
    apply_to_move_tree(state, |move_tree, _| {
        let _: () = move_tree.mark_rectangle(
            mark,
            (start.0 as usize, start.1 as usize),
            (end.0 as usize, end.1 as usize),
        )?;
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn set_variant(state: tauri::State<'_, Mutex<AppData>>, variant: Variant) -> Result<()> {
    apply_to_move_tree(state, |move_tree, study| {
        let _: () = move_tree.set_variant(variant, study)?;
        Ok(())
    })
    .await
}

#[tauri::command]
#[specta::specta]
async fn jump_to_exercise(state: tauri::State<'_, Mutex<AppData>>, index: u32) -> Result<()> {
    match state.lock().await.phase {
        AppPhase::Editing(ref mut editing_data) => {
            let _: () = editing_data.jump_to_exercise(index as usize)?;
            Ok(())
        }
        AppPhase::Study(ref mut study_data) => {
            let _: () = study_data.jump_to_exercise(index as usize)?;
            Ok(())
        }
        AppPhase::Main => Err(error("Tried 'jump_to_exercise' on main")),
    }
}

#[tauri::command]
#[specta::specta]
async fn save_exercises(state: tauri::State<'_, Mutex<AppData>>) -> Result<()> {
    let app_data = &mut *state.lock().await;
    if let AppPhase::Editing(ref mut editing_data) = app_data.phase {
        if app_data
            .fs
            .list_exercises()?
            .into_iter()
            .all(|e| e != editing_data.file)
        {
            config::add_exercise(&mut app_data.fs, &editing_data.file)?;
        }
        editing_data.save(&mut app_data.fs)?;
        Ok(())
    } else {
        Err(error("invalid phase!"))
    }
}

#[tauri::command]
#[specta::specta]
async fn delete_exercise_file(
    state: tauri::State<'_, Mutex<AppData>>,
    exercise: String,
) -> Result<()> {
    let app_data = &mut *state.lock().await;
    app_data.fs.delete_exercise(&exercise)?;
    Ok(())
}

// frontend switches itself to EditingPhase.
// EditingScreen useEffect calls this, which switches
// it to editing mode.
#[tauri::command]
#[specta::specta]
async fn load_exercises(state: tauri::State<'_, Mutex<AppData>>, exercise: String) -> Result<()> {
    state.lock().await.edit_new(&exercise).await
}

#[tauri::command]
#[specta::specta]
async fn get_config(state: tauri::State<'_, Mutex<AppData>>) -> Result<ActiveConfig> {
    match state.lock().await.phase {
        AppPhase::Editing(ref editing_data) => Ok((*editing_data.config).clone()),
        AppPhase::Study(ref study_data) => Ok((study_data.get_config()).clone()),
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn get_config_str(state: tauri::State<'_, Mutex<AppData>>) -> Result<String> {
    let app_data = &mut *state.lock().await;
    app_data.fs.load_config()
}

#[tauri::command]
#[specta::specta]
async fn set_config_str(
    state: tauri::State<'_, Mutex<AppData>>,
    config: String,
) -> Result<ValidationResult> {
    let app_data = &mut *state.lock().await;
    let result = config::validate(&mut app_data.fs, &config)?;

    if let ValidationResult::Valid = result {
        app_data.fs.save_config(&config)?;
    }

    Ok(result)
}

#[tauri::command]
#[specta::specta]
async fn list_exercises(state: tauri::State<'_, Mutex<AppData>>) -> Result<Vec<String>> {
    let app_data = &mut *state.lock().await;
    app_data.fs.list_exercises()
}

#[tauri::command]
#[specta::specta]
async fn main_menu(state: tauri::State<'_, Mutex<AppData>>) -> Result<()> {
    state.lock().await.main();
    Ok(())
}

#[tauri::command]
#[specta::specta]
async fn load_study(state: tauri::State<'_, Mutex<AppData>>, flashcard_set: &str) -> Result<()> {
    state.lock().await.study_new(flashcard_set).await
}

#[tauri::command]
#[specta::specta]
async fn list_studies(state: tauri::State<'_, Mutex<AppData>>) -> Result<Vec<String>> {
    let app_data = &mut *state.lock().await;
    crate::config::flashcard_sets(&mut app_data.fs)
}

#[tauri::command]
#[specta::specta]
async fn answer(state: tauri::State<'_, Mutex<AppData>>, correct: bool) -> Result<String> {
    let app_data = &mut *state.lock().await;
    match app_data.phase {
        AppPhase::Study(ref mut study_data) => study_data.answer(&mut app_data.fs, correct),
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn stop_editing(state: tauri::State<'_, Mutex<AppData>>, save: bool) -> Result<()> {
    let app_data = &mut *state.lock().await;
    match app_data.phase {
        AppPhase::Study(ref mut study_data) => {
            study_data.stop_editing(&mut app_data.fs, save).await?;
            Ok(())
        }
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn export_sgf(state: tauri::State<'_, Mutex<AppData>>) -> Result<()> {
    let app_data = &mut *state.lock().await;
    match app_data.phase {
        AppPhase::Editing(ref editing_data) => {
            app_data
                .fs
                .save_sgf(&editing_data.file, &editing_data.export_sgf()?)?;
            Ok(())
        }
        _ => Err(error("invalid phase!")),
    }
}

#[tauri::command]
#[specta::specta]
async fn import_sgf(state: tauri::State<'_, Mutex<AppData>>) -> Result<()> {
    let app_data = &mut *state.lock().await;
    match app_data.phase {
        AppPhase::Editing(ref mut editing_data) => {
            if let Some(sgf) = app_data.fs.receive_sgf()? {
                editing_data.import_sgf(&sgf)?;
            }
            Ok(())
        }
        _ => Err(error("invalid phase!")),
    }
}

macro_rules! apply_fns {
    ($macr:ident) => {{
        $macr![
            get_data,
            play,
            jump,
            delete_branch,
            set_stones,
            new_exercise,
            next_exercise,
            delete_exercise,
            finish_setup,
            collapse_tree,
            comment,
            set_variant,
            delete_exercise_file,
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
            load_study,
            answer,
            stop_editing,
            paint,
            mark_rectangle,
            import_sgf,
            export_sgf,
        ]
    }};
}

use tauri::generate_handler;

use crate::{app_data::data::AppPhase, interop::Snapshot};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    use crate::file::FileSystem;
    #[cfg(debug_assertions)]
    {
        use specta_typescript::Typescript;
        use std::env;
        use tauri_specta::collect_commands;

        if env::args().any(|a| a == "make-bindings") {
            tauri_specta::Builder::<tauri::Wry>::new()
                .commands(apply_fns!(collect_commands))
                .export(Typescript::default(), "../src/bindings.ts")
                .unwrap();
            return;
        }
    }

    let mut builder = Builder::default();

    #[cfg(not(target_os = "android"))]
    {
        builder = builder.plugin(tauri_plugin_dialog::init());
    }

    #[cfg(target_os = "android")]
    {
        builder = builder.plugin(tauri_plugin_android_fs::init());
    }

    builder
        // .any_thread()
        .setup(|app| {
            let Ok(fs) = FileSystem::initialize(app.handle()) else {
                println!("Error initializing file system!!");
                std::process::exit(1);
            };
            app.manage(Mutex::new(AppData {
                fs,
                phase: AppPhase::Main,
            }));
            Ok(())
        })
        .invoke_handler(apply_fns!(generate_handler))
        .run(tauri::generate_context!())
        .unwrap();
}
