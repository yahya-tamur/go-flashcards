use std::{
    fs::File,
    io::{BufReader, BufWriter, Read, Seek, SeekFrom, Write},
};

use super::os_file_system::OsFileSystem;
use flate2::{bufread::GzDecoder, write::GzEncoder, Compression};
use indexmap::IndexMap;
use serde::{de::DeserializeOwned, Serialize};
use specta::Type;

use crate::{error::error, game::Problem, Result};

#[derive(Debug)]
pub struct FileSystemWrapper<FS>
where
    FS: OsFileSystem,
{
    osfs: FS,
    open_files: IndexMap<String, File>,
}

#[derive(Type, Serialize)]
pub struct Bytes(pub Vec<u8>);

impl<OsFS> FileSystemWrapper<OsFS>
where
    OsFS: OsFileSystem,
{
    pub fn initialize(app: &tauri::AppHandle) -> Result<Self> {
        let osfs = OsFS::initialize(app)?;
        Ok(FileSystemWrapper {
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
            created = self.osfs.file_exists(folders, file)?;
            let file = self.osfs.open_file(folders, file)?;
            self.open_files.insert(key.clone(), file);
        }

        let file = &mut self.open_files[&key];
        file.seek(SeekFrom::Start(0))?;

        Ok((created, file))
    }

    fn read_compressed<T>(&mut self, folders: &[&str], name: &str) -> Result<Vec<T>>
    where
        T: DeserializeOwned + Serialize + std::fmt::Debug,
    {
        let (created, file) = self.open_file(folders, name)?;

        if created {
            self.write_compressed(folders, name, &Vec::<T>::new())?;
            return Ok(Vec::new());
        }

        let reader = BufReader::new(file);
        let gz = GzDecoder::new(reader);
        let ans = serde_json::from_reader(gz)?;
        Ok(ans)
    }

    fn write_compressed<T>(&mut self, folders: &[&str], name: &str, v: &T) -> Result<()>
    where
        T: Serialize + std::fmt::Debug,
    {
        let (_, mut file) = self.open_file(folders, name)?;

        let current_pos = {
            let mut writer = BufWriter::new(&mut file);
            let mut gz = GzEncoder::new(&mut writer, Compression::best());
            serde_json::to_writer(&mut gz, v)?;
            gz.finish()?;

            writer.flush()?;
            writer.stream_position()?
        };

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
        H: DeserializeOwned + Serialize + std::fmt::Debug,
    {
        self.read_compressed(&["history"], &format!("{exercise}.{extension}.json.gz"))
    }

    pub fn save_exercises(&mut self, vec: &Vec<Problem>, exercise: &str) -> Result<()> {
        self.write_compressed(&["exercises"], &format!("{exercise}.json.gz"), vec)
    }

    pub fn save_history<H>(&mut self, exercise: &str, extension: &str, vec: &Vec<H>) -> Result<()>
    where
        H: Serialize + std::fmt::Debug,
    {
        self.write_compressed(
            &["history"],
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

    pub fn load_asset(&mut self, asset: &str) -> Result<Vec<u8>> {
        if !self.osfs.file_exists(&["assets"], asset)? {
            return Err(error(&format!("couldn't find asset {asset}")));
        }

        let (_, file) = self.open_file(&["assets"], asset)?;

        let mut contents = Vec::new();

        file.read_to_end(&mut contents)?;

        Ok(contents)
    }

    pub fn list_exercises(&self) -> Result<Vec<String>> {
        self.osfs.list_exercises()
    }

    pub fn save_sgf(&self, name: &str, content: &str) -> Result<()> {
        let pick = self.osfs.save_sgf(&format!("{name}.sgf"))?;

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

    pub fn receive_sgf(&self) -> Result<Option<String>> {
        let pick = self.osfs.pick_sgf()?;

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
