use crate::file::FileSystem;
use crate::Result;

use super::{EditingData, StudyData};

#[allow(clippy::large_enum_variant)]
#[derive(Debug)]
pub enum AppPhase {
    Editing(EditingData),
    Main,
    Study(StudyData),
}

pub struct AppData {
    pub fs: FileSystem,
    pub phase: AppPhase,
}

impl AppData {
    pub async fn edit_new(&mut self, exercise_file: &str) -> Result<()> {
        self.phase = AppPhase::Editing(EditingData::load(&mut self.fs, exercise_file)?);
        Ok(())
    }

    pub fn main(&mut self) {
        self.phase = AppPhase::Main;
    }

    // Will read relevant stuff off of config.
    pub async fn study_new(&mut self, study_file: &str) -> Result<()> {
        self.phase = AppPhase::Study(StudyData::load(&mut self.fs, study_file)?);
        Ok(())
    }
}
