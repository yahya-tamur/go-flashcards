use crate::editing_data::EditingData;
use crate::config::Config;

#[allow(clippy::large_enum_variant)]
#[derive(Default, Debug)]
pub enum AppData {
    Editing(EditingData),
    Config(Config),
    #[default]
    Study,
}

impl AppData {
    pub fn edit_new(&mut self) {
        *self = AppData::Editing(EditingData::default());
    }
}
