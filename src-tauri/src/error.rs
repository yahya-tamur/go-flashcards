use std::{
    fmt::{Display, Formatter},
    string::FromUtf8Error,
};

use serde::Serialize;
use sgf_parse::SgfParseError;
use specta::Type;

#[derive(Debug, Type, Serialize)]
pub struct DisplayableError(String);

pub type Result<T> = std::result::Result<T, DisplayableError>;

pub fn error(message: &str) -> DisplayableError {
    DisplayableError(message.to_owned())
}

impl Display for DisplayableError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "Error: {}", self.0)
    }
}

impl std::error::Error for DisplayableError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

impl From<std::io::Error> for DisplayableError {
    fn from(err: std::io::Error) -> Self {
        DisplayableError(format!("file system error: {}", err))
    }
}

impl From<serde_json::Error> for DisplayableError {
    fn from(err: serde_json::Error) -> Self {
        DisplayableError(format!("json error: {}", err))
    }
}

impl From<FromUtf8Error> for DisplayableError {
    fn from(err: FromUtf8Error) -> Self {
        DisplayableError(format!("utf 8 conversion error: {}", err))
    }
}

impl From<toml::de::Error> for DisplayableError {
    fn from(err: toml::de::Error) -> Self {
        DisplayableError(format!("toml parsing error: {}", err))
    }
}

#[cfg(not(target_os = "android"))]
impl From<tauri_plugin_fs::Error> for DisplayableError {
    fn from(err: tauri_plugin_fs::Error) -> Self {
        DisplayableError(format!("file system plugin error: {}", err))
    }
}

impl From<tauri::Error> for DisplayableError {
    fn from(err: tauri::Error) -> Self {
        DisplayableError(format!("tauri error: {}", err))
    }
}

impl From<SgfParseError> for DisplayableError {
    fn from(err: SgfParseError) -> Self {
        DisplayableError(format!("sgf parse error: {}", err))
    }
}

impl From<regex::Error> for DisplayableError {
    fn from(err: regex::Error) -> Self {
        DisplayableError(format!("regex error: {}", err))
    }
}

#[cfg(target_os = "android")]
impl From<tauri_plugin_android_fs::Error> for DisplayableError {
    fn from(err: tauri_plugin_android_fs::Error) -> Self {
        DisplayableError(format!("android file system plugin error: {}", err))
    }
}

impl From<glob::PatternError> for DisplayableError {
    fn from(err: glob::PatternError) -> Self {
        DisplayableError(format!("glob pattern error: {}", err))
    }
}
