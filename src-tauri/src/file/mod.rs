pub mod os_file_system;
pub mod wrapper;

use include_dir::{include_dir, Dir};

static INITIAL_APP_DATA: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/data/initial_app_data");

#[cfg(not(target_os = "android"))]
mod windows_linux_fs;

#[cfg(not(target_os = "android"))]
pub type FileSystem = wrapper::FileSystemWrapper<windows_linux_fs::WindowsLinuxFileSystem>;

#[cfg(target_os = "android")]
pub mod android_fs;

#[cfg(target_os = "android")]
pub type FileSystem = wrapper::FileSystemWrapper<android_fs::AndroidFileSystem>;
