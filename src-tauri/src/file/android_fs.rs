pub use std::fs::File;
use std::{fs::OpenOptions, path::PathBuf};

use crate::error::error;
use crate::Result;
use tauri::Manager;
use tauri_plugin_android_fs::{AndroidFsExt, FsUri, PrivateDir};
use tauri_plugin_dialog::DialogExt;

use super::os_file_system::OsFileSystem;
use super::INITIAL_APP_DATA;

#[derive(Debug)]
pub struct AndroidFileSystem {
    app_data: FsUri,
}

impl AndroidFileSystem {
    fn resolve(&self, folders: &[&str], file: &str) -> PathBuf {
        unimplemented!()
        /*  let mut path = self.app_data.clone();
        for folder in folders {
            path = path.join(folder);
        }
        path = path.join(file);
        path*/
    }
}

impl OsFileSystem for AndroidFileSystem {
    fn initialize(app: &tauri::AppHandle) -> Result<Self> {
        let app_data = app
            .android_fs()
            .private_storage()
            .resolve_uri(PrivateDir::Data, "");
        Err(error(&format!("{app_data:?}")))
        /*
        let app_data = app.path().app_data_dir()?;

        if !app_data.join("app_data").try_exists()? {
            INITIAL_APP_DATA.extract(app_data.clone())?;
        }
        let app_data = app_data.join("app_data");
        if !app_data.join("config.toml").try_exists()? {
            std::fs::File::create(app_data.join("config.toml"))?;
        }
        std::fs::create_dir_all(app_data.join("exercises"))?;
        std::fs::create_dir_all(app_data.join("history"))?;
        Ok(WindowsLinuxFileSystem { app_data })*/
    }

    fn open_file(&self, folders: &[&str], file: &str) -> Result<(bool, File)> {
        Err(error(&"unimplemented"))
        /*
        let exists = self.resolve(folders, file).try_exists()?;
        let path = self.resolve(folders, file);

        let file = OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .truncate(false)
            .open(path)?;

        Ok((!exists, file))*/
    }

    fn delete_file(&self, folders: &[&str], file: &str) -> Result<()> {
        Err(error(&"unimplemented"))
        /*
        std::fs::remove_file(self.resolve(folders, file))?;
        Ok(())*/
    }

    fn list_exercises(&self) -> Result<Vec<String>> {
        Err(error(&"unimplemented"))
        /*
        let mut ans = Vec::new();
        for entry in std::fs::read_dir(self.app_data.join("exercises"))? {
            let entry = entry?;
            if !entry.file_type()?.is_file() {
                continue;
            }
            if let Some(name) = entry.path().file_prefix() {
                if let Some(utf8name) = name.to_str() {
                    ans.push(utf8name.to_owned());
                }
            }
        }
        Ok(ans)*/
    }
    fn pick_sgf_import(&self, app: &tauri::AppHandle) -> Result<Option<File>> {
        Err(error(&"unimplemented"))
        /*
        match app
            .dialog()
            .file()
            .add_filter("Sgf", &["sgf"])
            .blocking_pick_file()
        {
            Some(path) => Ok(Some(OpenOptions::new().read(true).open(path.into_path()?)?)),
            None => Ok(None),
        }*/
    }

    fn pick_sgf_export(&self, app: &tauri::AppHandle, name: &str) -> Result<Option<File>> {
        Err(error(&"unimplemented"))
        /*
        match app
            .dialog()
            .file()
            .add_filter("Sgf", &["sgf"])
            .set_file_name(name)
            .blocking_save_file()
        {
            Some(path) => Ok(Some(
                OpenOptions::new()
                    .write(true)
                    .create(true)
                    .truncate(false)
                    .open(path.into_path()?)?,
            )),
            None => Ok(None),
        }*/
    }
}
