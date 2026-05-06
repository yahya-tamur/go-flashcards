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
enum GlobalItem {
    OptionA,
    OptionB,
}

#[derive(Deserialize, Debug)]
struct FlashcardSet {
    name: String,
    sources: Vec<String>,
    item2: Option<bool>,
    item3: Option<usize>,
}

#[derive(Deserialize, Debug)]
struct Config {
    item1: GlobalItem,
    item2: Option<bool>,
    item3: Option<usize>,
    flashcard_set: Vec<FlashcardSet>,
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
