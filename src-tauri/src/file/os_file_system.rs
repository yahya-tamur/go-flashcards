use std::fs::File;

use crate::Result;

pub trait OsFileSystem: Sized + std::fmt::Debug {
    //will contain PathBuf or FsUri
    //later, read that from file.
    fn initialize(app: &tauri::AppHandle) -> Result<Self>;

    fn open_file(&self, folders: &[&str], file: &str) -> Result<(bool, File)>;
    fn delete_file(&self, folders: &[&str], file: &str) -> Result<()>;
    fn list_exercises(&self) -> Result<Vec<String>>;
    fn pick_sgf_import(&self, app: &tauri::AppHandle) -> Result<Option<File>>;
    fn pick_sgf_export(&self, app: &tauri::AppHandle, name: &str) -> Result<Option<File>>;
}
