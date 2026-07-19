pub mod android_fs;
pub mod os_file_system;
pub mod wrapper;

use include_dir::{include_dir, Dir};

static INITIAL_APP_DATA: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/data/initial_app_data");

/* *
//#[cfg(not(target_os = "android"))]
mod fs;

#[cfg(not(target_os = "android"))]
#[path = "android_fs.rs"]
mod fs;
// */

pub mod windows_linux_fs;

pub type FileSystem = wrapper::FileSystem<windows_linux_fs::WindowsLinuxFileSystem>;
