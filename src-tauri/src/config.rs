use serde::Deserialize;

// Warning:
// Since I will implement syntax highlighting in frontend,
// it will not be valid for all (valid) toml.

// No #'s in strings on the right-hand side!!

// I'll try to implement different colors for:
// lhs, =, int / string / bool
// [[]]

// but nothing else!!

// load a config into appdata::study?
// so editing and main modes have no configuration?
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

    // later: check all sources exist.
    toml::from_str(s).map_err(|err| {
        if let Some(range) = err.span() {
            (err.message().to_string(), range.start, range.end)
        } else {
            (err.message().to_string(), 0, 0)
        }
    })

}

#[test]
fn test_config() {
    let a: Result<Config, toml::de::Error> = toml::from_str(
        r#"
    item1 = "OptionA"
    item2 = true

    [[flashcard_set]]
    name = "blorp"
    sources = ["blorp1", "blorp2]
    item3 = 5
    "#,
    );

    println!("{:?}", a);
}
