use indexmap::IndexMap;
use regex::Regex;
use specta::Type;
use std::collections::{HashMap, HashSet};
use toml::{Spanned, Value};

use struct_patch::Patch;

use crate::{error::error, Result};
use serde::{Deserialize, Serialize};

use crate::{file::FileSystem, flashcard_algorithm::algorithm_config::AlgorithmConfig};

#[derive(PartialEq, Deserialize, Debug, Copy, Clone, Serialize, Type)]
#[serde(rename_all = "snake_case")]
pub enum ShowRecent {
    None,
    Circle,
    Number,
}

#[derive(Deserialize, Patch, PartialEq, Debug, Clone, Serialize, Type)]
#[patch(attribute(derive(Deserialize, Debug, Clone)))]
#[patch(attribute(serde(deny_unknown_fields, rename_all = "snake_case")))]
pub struct ActiveConfig {
    pub transfer_marks: bool,
    pub random_orientation: bool,
    pub random_color: bool,
    pub show_recent: ShowRecent,
}

#[derive(Deserialize, Patch, PartialEq, Debug, Clone, Serialize, Type)]
#[patch(attribute(derive(Deserialize, Debug, Clone)))]
#[patch(attribute(serde(deny_unknown_fields, rename_all = "snake_case")))]
pub struct FlashcardSetConfig {
    pub algorithm: AlgorithmConfig,
    pub shared: bool,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields, rename_all = "snake_case")]
struct ConfigFile {
    #[serde(rename = "editing")]
    editing_config: Option<EditingConfig>,

    #[serde(rename = "flashcard_set", default)]
    study_sets: IndexMap<String, StudyConfig>,

    #[serde(rename = "default")]
    default_config: DefaultConfig,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "snake_case")]
struct EditingConfig {
    #[serde(default)]
    source_config: HashMap<Spanned<String>, ActiveConfigPatch>,

    #[serde(flatten)]
    config: ActiveConfigPatch,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "snake_case")]
struct DefaultConfig {
    #[serde(flatten)]
    set_config: FlashcardSetConfig,

    #[serde(flatten)]
    config: ActiveConfig,
}

#[derive(Deserialize, Debug)]
#[serde(deny_unknown_fields)]
#[serde(rename_all = "snake_case")]
struct StudyConfig {
    sources: Vec<Spanned<String>>,
    #[serde(default)]
    source_config: HashMap<Spanned<String>, ActiveConfigPatch>,

    #[serde(flatten)]
    config: ActiveConfigPatch,

    #[serde(flatten)]
    set_config: FlashcardSetConfigPatch,
}

pub fn flashcard_sets(fs: &mut FileSystem) -> Result<Vec<String>> {
    let input = fs.load_config()?;

    let config = toml::from_str::<ConfigFile>(&input)?;

    Ok(config.study_sets.into_keys().collect())
}

pub fn load_editing(fs: &mut FileSystem, name: &str) -> Result<ActiveConfig> {
    let input = fs.load_config()?;
    let config: ConfigFile = toml::from_str(&input)?;

    let mut active_config = config.default_config.config.clone();

    if let Some(editing_config) = config.editing_config {
        active_config = active_config << editing_config.config;
        if let Some(src_config) = editing_config.source_config.get(name) {
            active_config = active_config << src_config.clone();
        }
    }
    Ok(active_config)
}

pub fn load_study(
    fs: &mut FileSystem,
    name: &str,
) -> Result<(FlashcardSetConfig, Vec<(String, ActiveConfig)>)> {
    let input = fs.load_config()?;
    let config: ConfigFile = toml::from_str(&input)?;

    let mut set_config = config.default_config.set_config.clone();
    let mut active_config = config.default_config.config.clone();

    let study_config = config
        .study_sets
        .get(name)
        .ok_or_else(|| error("configuration not found."))?;

    active_config = active_config << study_config.config.clone();
    set_config = set_config << study_config.set_config.clone();

    Ok((
        set_config,
        study_config
            .sources
            .iter()
            .map(|source| {
                let mut config = active_config.clone();
                if let Some(src_config) = study_config.source_config.get(source) {
                    config = config << src_config.clone();
                }
                (source.as_ref().clone(), config)
            })
            .collect(),
    ))
}

#[derive(Serialize, Type)]
#[serde(tag = "result")]
pub enum ValidationResult {
    Valid,
    Invalid {
        error: String,
        range: Option<(u32, u32)>,
    },
}

pub fn validate(fs: &mut FileSystem, input: &str) -> Result<ValidationResult> {
    let config = match toml::from_str::<ConfigFile>(input) {
        Err(e) => {
            return Ok(ValidationResult::Invalid {
                error: e.message().to_string(),
                range: e.span().map(|r| (r.start as u32, r.end as u32)),
            });
        }
        Ok(config) => config,
    };

    println!("ASDFASDFASDFASDF");

    println!("ASDFASDFASDFASDF");

    println!("ASDFASDFASDFASDF");
    let exercise_files: HashSet<String> = fs.list_exercises()?.into_iter().collect();

    if let Some(editing_config) = config.editing_config {
        for source in editing_config.source_config.keys() {
            if !exercise_files.contains(source.get_ref()) {
                return Ok(ValidationResult::Invalid {
                    error: format!(r#"source "{}" not found."#, source.get_ref()),
                    range: Some((source.span().start as u32, source.span().end as u32)),
                });
            }
        }
    }

    for (_name, study_set) in config.study_sets {
        let mut sources: HashSet<String> = HashSet::new();
        for source in study_set.sources.iter() {
            if !exercise_files.contains(source.get_ref()) {
                return Ok(ValidationResult::Invalid {
                    error: format!(r#"source "{}" not found."#, source.get_ref()),
                    range: Some((source.span().start as u32, source.span().end as u32)),
                });
            }
            if !sources.insert(source.get_ref().clone()) {
                return Ok(ValidationResult::Invalid {
                    error: format!(r#"duplicate source "{}"."#, source.get_ref()),
                    range: Some((source.span().start as u32, source.span().end as u32)),
                });
            }
        }
        for source in study_set.source_config.keys() {
            if !sources.contains(source.as_ref()) {
                return Ok(ValidationResult::Invalid {
                    error: format!(r#"source "{}" not in this set."#, source.get_ref()),
                    range: Some((source.span().start as u32, source.span().end as u32)),
                });
            }
        }
    }

    Ok(ValidationResult::Valid)
}

pub fn add_exercise(fs: &mut FileSystem, name: &str) -> Result<()> {
    let bare_key_re = Regex::new(r#"^[A-Za-z0-9_\-]*$"#).unwrap();

    let qname = &format!(
        r#""{}""#,
        name.to_string().replace("\\", "\\\\").replace("\"", "\\\"")
    );

    let name = if bare_key_re.is_match(name) {
        name
    } else {
        qname
    };

    let new_set = format!("[flashcard_set.{}]\nsources = [{}]", name, qname);

    let old_config = fs.load_config()?;

    let parsed_toml =
        toml::from_str::<IndexMap<Spanned<String>, IndexMap<Spanned<String>, Value>>>(&old_config)?;

    let start_of_last_flashcard_set = match parsed_toml.get("flashcard_set") {
        None => 0,
        Some(map) => map
            .keys()
            .map(|spanned_value| spanned_value.span().end)
            .max()
            .unwrap_or(0),
    };

    let any_table_re = Regex::new(r"(?m)^[^\S\n]*\[.*$").unwrap();

    // insert right before next [table]
    let n: usize = any_table_re
        .find_at(&old_config, start_of_last_flashcard_set)
        .map_or(old_config.len(), |m| m.start());

    let mut i = 0;
    if !old_config.is_empty() && (n == 0 || old_config[n - 1..n] == *"\n") {
        i += 1;
        if old_config.len() > 1 && (n <= 1 || old_config[n - 2..n - 1] == *"\n") {
            i += 1;
        }
    }

    fs.save_config(&format!(
        "{}{}{}\n\n{}",
        &old_config[..n],
        "\n".repeat(2 - i),
        new_set,
        &old_config[n..]
    ))?;
    Ok(())
}
