use std::fs::File;

use crate::Result;

pub trait OsFileSystem: Sized {
    //will contain PathBuf or FsUri
    //later, read that from file.
    fn initialize(app: &tauri::AppHandle) -> Result<Self>;

    // should open with read = true, write = true, create = true, truncate = false
    fn open_file(&self, folders: &[&str], file: &str) -> Result<(bool, File)>;
    fn delete_file(&self, folders: &[&str], file: &str) -> Result<()>;
    fn list_exercises(&self) -> Result<Vec<String>>;
    fn pick_sgf(&self) -> Result<Option<File>>;
    fn save_sgf(&self, name: &str) -> Result<Option<File>>;
}
