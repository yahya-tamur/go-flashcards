use std::{
    fs::File,
    io::{BufReader, Read, Seek, SeekFrom, Write},
};

use flate2::{bufread::GzDecoder, write::GzEncoder, Compression};
use indexmap::IndexMap;
use serde::{de::DeserializeOwned, Serialize};

use crate::{game::Problem, Result};

pub trait OsFileSystemTrait: Sized + std::fmt::Debug {
    //will contain PathBuf or FsUri
    //later, read that from file.
    fn initialize(app: &tauri::AppHandle) -> Result<Self>;

    fn os_open_file(&self, folders: &[&str], file: &str) -> Result<(bool, File)>;
    fn delete_file(&self, folders: &[&str], file: &str) -> Result<()>;
    fn list_exercises(&self) -> Result<Vec<String>>;
    fn pick_sgf_import(&self, app: &tauri::AppHandle) -> Result<Option<File>>;
    fn pick_sgf_export(&self, app: &tauri::AppHandle, name: &str) -> Result<Option<File>>;
}

#[derive(Debug)]
pub struct FileSystem<FS>
where
    FS: OsFileSystemTrait,
{
    osfs: FS,
    open_files: IndexMap<String, File>,
}

impl<OsFS> FileSystem<OsFS>
where
    OsFS: OsFileSystemTrait,
{
    pub fn initialize(app: &tauri::AppHandle) -> Result<Self> {
        let osfs = OsFS::initialize(app)?;
        Ok(FileSystem {
            osfs,
            open_files: IndexMap::new(),
        })
    }

    fn path_key(folders: &[&str], file: &str) -> String {
        format!("{}/\\/\\{file}", folders.join("/\\/\\"))
    }

    fn open_file(&mut self, folders: &[&str], file: &str) -> Result<(bool, &mut File)> {
        let key = Self::path_key(folders, file);
        let mut created = false;
        if !self.open_files.contains_key(&key) {
            let (created_, file) = self.osfs.os_open_file(folders, file)?;
            self.open_files.insert(key.clone(), file);
            created = created_;
        }

        let file = &mut self.open_files[&key];
        file.seek(SeekFrom::Start(0))?;

        let mut buf = Vec::new();
        file.read_to_end(&mut buf)?;
        println!("file contents: {:?}", String::from_utf8(buf));
        file.seek(SeekFrom::Start(0))?;
        Ok((created, file))
    }

    fn read_compressed<T>(&mut self, folders: &[&str], name: &str) -> Result<Vec<T>>
    where
        T: DeserializeOwned + Serialize,
    {
        let (created, file) = self.open_file(folders, name)?;
        println!("{:?} {:?}", created, name);

        if created {
            self.write_compressed(folders, name, &Vec::<T>::new())
                .unwrap();
            return Ok(Vec::new());
        }

        let reader = BufReader::new(file);
        let gz = GzDecoder::new(reader);
        let ans = serde_json::from_reader(gz)?;
        Ok(ans)
    }

    fn write_compressed<T>(&mut self, folders: &[&str], file: &str, v: &T) -> Result<()>
    where
        T: Serialize,
    {
        let (_, file) = self.open_file(folders, file)?;
        let mut gz = GzEncoder::new(file, Compression::best());
        serde_json::to_writer(&mut gz, v)?;
        let file = gz.finish()?;
        let current_pos = file.stream_position()?;
        file.set_len(current_pos)?;
        file.seek(SeekFrom::Start(0))?;
        Ok(())
    }

    pub fn exit(&mut self) -> Result<()> {
        while let Some((_, file)) = self.open_files.pop() {
            file.sync_all()?;
        }
        Ok(())
    }

    pub fn load_exercises(&mut self, exercise: &str) -> Result<Vec<Problem>> {
        self.read_compressed(&["exercises"], &format!("{exercise}.json.gz"))
    }
    pub fn load_history<H>(&mut self, exercise: &str, extension: &str) -> Result<Vec<H>>
    where
        H: DeserializeOwned + Serialize,
    {
        self.read_compressed(&["history"], &format!("{exercise}.{extension}.json.gz"))
    }

    pub fn save_exercises(&mut self, vec: &Vec<Problem>, exercise: &str) -> Result<()> {
        self.write_compressed(&["exercises"], &format!("{exercise}.json.gz"), vec)
    }

    pub fn save_history<H>(&mut self, exercise: &str, extension: &str, vec: &Vec<H>) -> Result<()>
    where
        H: Serialize,
    {
        self.write_compressed(
            &["exercises"],
            &format!("{exercise}.{extension}.json.gz"),
            vec,
        )
    }

    pub fn delete_exercise(&mut self, exercise: &str) -> Result<()> {
        let key = Self::path_key(&["exercises"], &format!("{exercise}.json.gz"));
        {
            self.open_files.swap_remove(&key);
        }
        self.osfs
            .delete_file(&["exercises"], &format!("{exercise}.json.gz"))?;
        Ok(())
    }

    pub fn save_config(&mut self, content: &str) -> Result<()> {
        let (_, file) = self.open_file(&[], "config.toml")?;
        file.write_all(content.as_bytes())?;
        let current_pos = file.stream_position()?;
        file.set_len(current_pos)?;
        Ok(())
    }

    pub fn load_config(&mut self) -> Result<String> {
        let (_, file) = self.open_file(&[], "config.toml")?;
        let mut contents = Vec::new();

        file.read_to_end(&mut contents)?;
        Ok(String::from_utf8(contents)?)
    }

    pub fn list_exercises(&self) -> Result<Vec<String>> {
        self.osfs.list_exercises()
    }

    pub fn save_sgf(&self, app: &tauri::AppHandle, name: &str, content: &str) -> Result<()> {
        let pick = self.osfs.pick_sgf_export(app, &format!("{name}.sgf"))?;

        if let Some(mut file) = pick {
            file.seek(SeekFrom::Start(0))?;
            file.write_all(content.as_bytes())?;
            let current_pos = file.stream_position()?;
            file.set_len(current_pos)?;
            Ok(())
        } else {
            Ok(())
        }
    }

    pub fn receive_sgf(&self, app: &tauri::AppHandle) -> Result<Option<String>> {
        let pick = self.osfs.pick_sgf_import(app)?;

        if let Some(mut file) = pick {
            let mut contents = Vec::new();
            file.seek(SeekFrom::Start(0))?;
            file.read_to_end(&mut contents)?;
            Ok(Some(String::from_utf8(contents)?))
        } else {
            Ok(None)
        }
    }
}
