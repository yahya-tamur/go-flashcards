use crate::error::error;
use crate::Result;
pub use std::fs::File;
use tauri_plugin_android_fs::{AndroidFsExt, Entry, FileAccessMode, FsUri, PrivateDir};

use super::os_file_system::OsFileSystem;
use super::INITIAL_APP_DATA;

pub struct AndroidFileSystem {
    app_data: FsUri,
    app: tauri::AppHandle,
}

enum EntryQuery<'a> {
    File { name: &'a str },
    Dir { name: &'a str },
}

fn check_directory(
    app: &tauri::AppHandle,
    dir: &FsUri,
    query: EntryQuery,
) -> Result<Option<FsUri>> {
    match query {
        EntryQuery::File { name: query_name } => {
            for entry in app.android_fs().read_dir(dir)? {
                if let Entry::File { name, uri, .. } = entry {
                    if query_name == name {
                        return Ok(Some(uri));
                    }
                }
            }
        }
        EntryQuery::Dir { name: query_name } => {
            for entry in app.android_fs().read_dir(dir)? {
                if let Entry::Dir { name, uri, .. } = entry {
                    if query_name == name {
                        return Ok(Some(uri));
                    }
                }
            }
        }
    }
    Ok(None)
}

impl AndroidFileSystem {
    fn resolve_path(&self, folders: &[&str]) -> Result<FsUri> {
        let mut path = self.app_data.clone();

        for folder in folders {
            if let Some(path_) =
                check_directory(&self.app, &path, EntryQuery::Dir { name: folder })?
            {
                path = path_
            } else {
                path = self.app.android_fs().create_new_dir(&path, folder)?;
            }
        }
        Ok(path)
    }
}

impl OsFileSystem for AndroidFileSystem {
    fn initialize(app: &tauri::AppHandle) -> Result<Self> {
        let app_data = app
            .android_fs()
            .private_storage()
            .resolve_uri(PrivateDir::Data, "")?;

        // let mut afs = AndroidFileSystem {app_data: app_data.clone(), app: app.clone()};

        if check_directory(app, &app_data, EntryQuery::Dir { name: "app_data" })?.is_none() {
            for entry in INITIAL_APP_DATA.find("**/*")? {
                if let include_dir::DirEntry::File(file) = entry {
                    let opened = app
                        .android_fs()
                        .create_new_file(&app_data, file.path(), None)?;
                    app.android_fs().write(&opened, file.contents())?;
                    println!("{:?}", file);
                }
            }
        }

        let Some(app_data) = check_directory(app, &app_data, EntryQuery::Dir { name: "app_data" })?
        else {
            return Err(error("app data doesn't exist, and couldn't be created."));
        };

        if check_directory(
            app,
            &app_data,
            EntryQuery::File {
                name: "config.toml",
            },
        )?
        .is_none()
        {
            app.android_fs()
                .create_new_file(&app_data, "config.toml", None)?;
        }

        app.android_fs().create_dir_all(&app_data, "exercises")?;
        app.android_fs().create_dir_all(&app_data, "history")?;
        app.android_fs().create_dir_all(&app_data, "assets")?;

        Ok(AndroidFileSystem {
            app_data,
            app: app.clone(),
        })
    }

    fn open_file(&self, folders: &[&str], file: &str) -> Result<(bool, File)> {
        let mut created = false;

        let path = self.resolve_path(folders)?;

        let file_path = match check_directory(&self.app, &path, EntryQuery::File { name: file })? {
            Some(path_) => path_,
            None => {
                created = true;
                self.app.android_fs().create_new_file(&path, file, None)?
            }
        };

        let file = self
            .app
            .android_fs()
            .open_file(&file_path, FileAccessMode::ReadWrite)?;
        Ok((created, file))
    }

    fn delete_file(&self, folders: &[&str], file: &str) -> Result<()> {
        let path = self.resolve_path(folders)?;
        if let Some(file_path) = check_directory(&self.app, &path, EntryQuery::File { name: file })?
        {
            self.app.android_fs().remove_file(&file_path)?;
        };
        Ok(())
    }

    fn list_exercises(&self) -> Result<Vec<String>> {
        let mut ans = Vec::new();
        let path = self.resolve_path(&["exercises"])?;

        for entry in self.app.android_fs().read_dir(&path)? {
            if let Entry::File { name, .. } = entry {
                if name.len() >= 8 && name[name.len() - 8..] == *".json.gz" {
                    ans.push(name[..name.len() - 8].to_owned());
                }
            }
        }

        Ok(ans)
    }

    fn pick_sgf(&self) -> Result<Option<File>> {
        if let Some(path) =
            self.app
                .android_fs()
                .picker()
                .pick_file(None, &["application/x-go-sgf"], false)?
        {
            let file = self
                .app
                .android_fs()
                .open_file(&path, FileAccessMode::Read)?;
            return Ok(Some(file));
        }
        Ok(None)
    }

    fn save_sgf(&self, name: &str) -> Result<Option<File>> {
        if let Some(path) = self.app.android_fs().picker().save_file(
            None,
            name,
            Some("application/x-go-sgf"),
            false,
        )? {
            let file = self
                .app
                .android_fs()
                .open_file(&path, FileAccessMode::WriteTruncate)?;
            return Ok(Some(file));
        }
        Ok(None)
    }
}
