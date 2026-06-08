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

use regex::Regex;

pub fn add_exercise(s: &str, name: &str) -> String {
    let new_set = format!(
        r#"[[flashcard_set]]{}name = "{}"{}sources = ["{}"]"#,
        "\n", name, "\n", name,
    );

    if s.is_empty() {
        return new_set;
    }

    // find last [[flashcard_set]]
    let set_re = Regex::new(r"(?m)^\s*\[\[\s*flashcard_set\s*\]\]\s*$").unwrap();

    let end_of_flashcards: usize = set_re.find_iter(s).last().map_or(0, |m| m.end());

    // find next [table]
    let any_table_re = Regex::new(r"(?m)^[^\S\n]*\[.*$").unwrap();
    let start_of_next: usize = any_table_re
        .find_at(s, end_of_flashcards + 1)
        .map_or(s.len(), |m| m.start());

    let mut i = 0;
    if start_of_next > 0 && s[start_of_next - 1..start_of_next] == *"\n" {
        i += 1
    }
    if start_of_next >= 2 && s[start_of_next - 2..start_of_next - 1] == *"\n" {
        i += 1;
    }
    format!(
        r#"{}{}{}{}{}"#,
        &s[..start_of_next],
        "\n".repeat(2 - i),
        new_set,
        "\n\n",
        &s[start_of_next..]
    )
}
