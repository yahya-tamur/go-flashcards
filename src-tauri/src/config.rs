use std::{collections::HashMap, path::Path};
use toml::{Spanned, Table, Value};

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug, Copy, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ShowRecent {
    None,
    Circle,
    Number,
}

#[derive(Deserialize, Debug, Clone, Serialize)]
#[serde(deny_unknown_fields)]
pub struct ActiveConfig {
    pub show_recent: ShowRecent,
    pub sources: Option<Vec<String>>,
    pub item2: bool,
    pub item3: usize,
}

#[allow(dead_code)]
#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
struct Config {
    show_recent: Option<Spanned<ShowRecent>>,
    sources: Option<Vec<Spanned<String>>>,
    item2: Option<Spanned<bool>>,
    item3: Option<Spanned<usize>>,
}

use crate::fs;

pub async fn flashcard_sets(app_data: &Path) -> Vec<String> {
    let input = fs::load_config(app_data).await.unwrap();
    let table: Table = toml::from_str(&input).unwrap();
    table
        .into_iter()
        .map(|t| t.0)
        .filter(|s| *s != "default" && *s != "editing")
        .collect()
}

pub async fn load_config(app_data: &Path, name: Option<&str>, exercise: bool) -> ActiveConfig {
    let input = fs::load_config(app_data).await.unwrap();
    let mut table: HashMap<String, Table> = toml::from_str(&input).unwrap();

    let mut config = table.remove("default").unwrap();

    if let Some(target) = name {
        if let Some(map) = table.remove(target) {
            config.extend(map);
        }
    }

    if exercise {
        if let Some(map) = table.remove("editing") {
            config.extend(map);
        }
    }

    config.try_into().unwrap()
}

pub async fn validate(app_data: &Path, input: Option<&str>) -> Result<(), (String, usize, usize)> {
    // will check: - no unnecessary options,

    let input: &str = match input {
        Some(input) => input,
        None => &fs::load_config(app_data).await.unwrap(),
    };

    let table: HashMap<Spanned<String>, Config> = toml::from_str(input).map_err(|err| {
        println!("{:?}", err);
        if let Some(range) = err.span() {
            (err.message().to_string(), range.start, range.end)
        } else {
            (err.message().to_string(), 0, 0)
        }
    })?;

    // possible, since there are no top level items, which is checked earlier.
    let level2table: HashMap<String, HashMap<Spanned<String>, Value>> =
        toml::from_str(input).unwrap();

    println!("{:?}", level2table);

    // check default has all necessary options (and no sources option)
    let Some((default_span, _default_options)) = table.get_key_value("default") else {
        let r = input.find("\n").unwrap_or(input.len());
        return Err(("No default options found.".to_string(), 0, r));
    };

    for default_option in ["show_recent", "item2", "item3"] {
        if !level2table["default"].contains_key(default_option) {
            return Err((
                format!(r#"default should have "{default_option}" option."#),
                default_span.span().start,
                default_span.span().end,
            ));
        }
    }

    // check all sources are valid.

    let exercise_list = fs::list_exercises(app_data).await.unwrap();

    for (key, val) in &table {
        if key.get_ref() == "default" || key.get_ref() == "editing" {
            if let Some((key_span, _)) = level2table[key.get_ref()].get_key_value("sources") {
                return Err((
                    format!("{key} should not have 'sources' option."),
                    key_span.span().start,
                    key_span.span().end,
                ));
            }
        } else {
            match &val.sources {
                Some(v) => {
                    for source in v {
                        if exercise_list.iter().all(|a| a != source.get_ref()) {
                            return Err((
                                format!(r#"source "{}" not found."#, source.get_ref()),
                                source.span().start,
                                source.span().end,
                            ));
                        }
                    }
                }
                None => {
                    if exercise_list.iter().all(|a| a != key.get_ref()) {
                        return Err((
                            format!(r#"source "{}" not found."#, key.get_ref()),
                            key.span().start,
                            key.span().end,
                        ));
                    }
                }
            }
        }
    }

    Ok(())
}

pub async fn add_exercise(app_data: &Path, name: &str) {
    let old_config = fs::load_config(app_data).await.unwrap();
    let mut i = 0;
    if !old_config.is_empty() && old_config[old_config.len() - 1..old_config.len()] == *"\n" {
        i += 1;
    }
    if old_config.len() > 1 && old_config[old_config.len() - 2..old_config.len() - 1] == *"\n" {
        i += 1;
    }

    fs::save_config(
        app_data,
        &format!("{}{}[{}]", old_config, "\n".repeat(2 - i), name),
    )
    .await
    .unwrap();
}
