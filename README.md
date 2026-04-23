#

looking good and easy enough to use!

to do

- reduce autocomplete in vscode!
- use svg to draw move tree
- implement go board and rules

- new movetree structure.

- actual tree: (data oriented)
- data: id => Node // (Vec<Node>)
- parent: id => id // (Vec<usize>)
- buildTree: generates // (Vec<Vec< usize > >)
- play: (can shift built tree)
- delete: needs to actually make new data array or something

#

trying out new architecture for previous project (tauri, hopefully material ui)

cons:

- seems complicated.
  - this might be the simplest solution for rust backend + material ui
  - I'm not 100% sure I need rust backend, but shouldn't be worse than electron

pros:

- can eventually compile to mobile
- will hopefully look good using material ui
- hopefully won't have to implement horizontal scrolling etc. myself

below is default readme for tauri, I'll delete it later.

# Tauri + React

This template should help get you started developing with Tauri and React in Vite.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
