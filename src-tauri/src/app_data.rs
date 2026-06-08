use std::path::Path;

use crate::{editing_data::EditingData, study_data::StudyData};

#[allow(clippy::large_enum_variant)]
#[derive(Default, Debug)]
pub enum AppData {
    Editing(EditingData),
    #[default]
    Main,
    Study(StudyData),
}

impl AppData {
    pub async fn edit_new(&mut self, path: &Path, exercise_file: &str) -> bool {
        let (created, data) = EditingData::load(path, exercise_file).await;
        *self = AppData::Editing(data);
        created
    }

    pub fn main(&mut self) {
        *self = AppData::Main;
    }

    // Will read relevant stuff off of config.
    pub async fn study_new(&mut self, path: &Path, study_file: &str) {
        *self = AppData::Study(StudyData::load(path, study_file).await)
    }
}
