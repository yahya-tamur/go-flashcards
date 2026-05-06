use crate::editing_data::EditingData;

#[allow(clippy::large_enum_variant)]
#[derive(Default, Debug)]
pub enum AppData {
    Editing(EditingData),
    #[default]
    Config,
    Study,
}

impl AppData {
    pub fn edit_new(&mut self) {
        *self = AppData::Editing(EditingData::default());
    }
}
