
// not even crate fs or async

use std::{fs, path::Path};
use sgf_parse::{SgfNode, go::{Move, Prop, parse}};

use crate::game_state::Color;


pub fn sgf_parse(app_data: &Path) {
    println!("AA");
    let sgf = fs::read(app_data
         .join("app_data")
        .join("test.sgf")
        ).unwrap();
    let sgf = str::from_utf8(&sgf).unwrap();

    let mut collection = parse(sgf).unwrap();

    load_sgf(collection.pop().unwrap());
}

// will destroy input!

pub fn load_sgf(start: SgfNode<Prop>) /* -> Problem */ {
    let mut stack :Vec<Option<SgfNode<Prop>>> = vec![Some(start)];
    //let prev_moves :Vec<(usize, usize, Color)> = Vec::new();
    let mut prev_moves: Vec<Option<Prop>> = Vec::new();
    while let Some(node) = stack.pop() {
        let Some(node) = node else {
            prev_moves.pop();
            continue;
        };
        prev_moves.push(node.get_move().map(|v| v.clone()) );
        node.children.into_iter().for_each(|node| stack.push(Some(node)));
        println!("{:?}", prev_moves);
    }

 }