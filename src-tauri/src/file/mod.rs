pub mod android_fs;
pub mod common;

use include_dir::{include_dir, Dir};

static INITIAL_APP_DATA: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/data/initial_app_data");

/* *
//#[cfg(not(target_os = "android"))]
mod fs;

#[cfg(not(target_os = "android"))]
#[path = "android_fs.rs"]
mod fs;
// */

pub mod fs;

pub type FileSystem = common::FileSystem<fs::OsFileSystem>;
