use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub enum GlobalItem {
    OptionA,
    OptionB,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
pub struct FlashcardSet {
    pub name: String,
    pub sources: Vec<String>,
    pub item2: Option<bool>,
    pub item3: Option<usize>,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
pub struct Config {
    pub item1: GlobalItem,
    pub item2: Option<bool>,
    pub item3: Option<usize>,
    pub flashcard_set: Vec<FlashcardSet>,
}

pub fn read_toml(s: &str) -> Result<Config, (String, usize, usize)> {
    toml::from_str(s).map_err(|err| {
        if let Some(range) = err.span() {
            (err.message().to_string(), range.start, range.end)
        } else {
            (err.message().to_string(), 0, 0)
        }
    })
}
