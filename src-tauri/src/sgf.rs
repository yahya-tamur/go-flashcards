// not even crate fs or async

use sgf_parse::{
    go,
    go::{parse, Prop},
    SgfNode,
};
use std::{fs, path::Path};
use uuid::Uuid;

use crate::{
    game_state::{Color, GameState, Mark},
    problem::{Move, Problem},
};

pub fn sgf_parse(app_data: &Path) -> Problem {
    println!("AA");
    let sgf = fs::read(app_data.join("app_data").join("test.sgf")).unwrap();
    let sgf = str::from_utf8(&sgf).unwrap();

    let mut collection = parse(sgf).unwrap();

    load_sgf(collection.pop().unwrap())
}

// will destroy input!

// maybe provide US node when serializing.

pub fn load_sgf(mut start: SgfNode<Prop>) -> Problem {
    let mut initial: GameState = GameState::default();
    let mut comment: String = String::new();

    let (mut min_row, mut max_row, mut min_col, mut max_col) = (1usize, 19usize, 1usize, 19usize);
    let mut initial_color = Color::Black;

    while start.get_move().is_none() && start.children.len() <= 1 {
        for prop in start.properties() {
            match prop {
                Prop::AB(set) => set.iter().for_each(|pt| {
                    initial.stones[pt.x as usize + 1][pt.y as usize + 1] = Some(Color::Black)
                }),
                Prop::AW(set) => set.iter().for_each(|pt| {
                    initial.stones[pt.x as usize + 1][pt.y as usize + 1] = Some(Color::White)
                }),
                Prop::VW(set) => set.iter().for_each(|pt| {
                    min_row = min_row.min(pt.x as usize + 1);
                    max_row = max_row.max(pt.x as usize + 1);
                    min_col = min_col.min(pt.y as usize + 1);
                    max_col = max_col.max(pt.y as usize + 1);
                }),
                Prop::SQ(set) => set.iter().for_each(|pt| {
                    initial.marks[pt.x as usize + 1][pt.y as usize + 1] = Some(Mark::Square)
                }),
                Prop::TR(set) => set.iter().for_each(|pt| {
                    initial.marks[pt.x as usize + 1][pt.y as usize + 1] = Some(Mark::Triangle)
                }),
                Prop::MA(set) => set.iter().for_each(|pt| {
                    initial.marks[pt.x as usize + 1][pt.y as usize + 1] = Some(Mark::Cross)
                }),
                Prop::LB(dict) => dict.iter().for_each(|(pt, cmt)| {
                    initial.marks[pt.x as usize + 1][pt.y as usize + 1] =
                        Some(Mark::Label(cmt.to_string()))
                }),
                Prop::CR(set) => set.iter().for_each(|pt| {
                    initial.marks[pt.x as usize + 1][pt.y as usize + 1] = Some(Mark::Circle)
                }),
                Prop::N(text) => {
                    comment = format!(
                        "{}{}{}",
                        text,
                        if comment.is_empty() { "" } else { " " },
                        comment
                    )
                }
                Prop::C(text) => {
                    comment = format!(
                        "{}{}{}",
                        comment,
                        if comment.is_empty() { "" } else { " " },
                        text
                    )
                }
                Prop::PL(color) => {
                    initial_color = if *color == sgf_parse::Color::Black {
                        Color::Black
                    } else {
                        Color::White
                    }
                }
                Prop::B(_) | Prop::W(_) => unreachable!(""),
                a => println!("ignoring property {}", a),
            }
        }
        if let Some(node) = start.children.pop() {
            start = node;
        } else {
            break;
        }
    }
    // also try to color initial based on next move later

    let mut table = vec![vec![Some(Move {
        loc: None,
        comment,
        color: initial_color,
        ..Move::default()
    })]];
    let mut first_loop = true;
    let mut i = 0;
    let mut stack: Vec<(SgfNode<Prop>, usize)> = vec![(start, 1)];

    while let Some((mut node, mut j)) = stack.pop() {
        // write whole 'main variation' to tree.

        if !first_loop {
            i += 1;
            table.push(vec![None; j]);
        }
        first_loop = false;
        loop {
            let mut new_move = Move::default();

            for prop in node.properties() {
                match prop {
                    Prop::SQ(set) => set.iter().for_each(|pt| {
                        new_move
                            .marks
                            .push((pt.x as usize + 1, pt.y as usize + 1, Mark::Square))
                    }),
                    Prop::TR(set) => set.iter().for_each(|pt| {
                        new_move
                            .marks
                            .push((pt.x as usize + 1, pt.y as usize + 1, Mark::Triangle))
                    }),
                    Prop::MA(set) => set.iter().for_each(|pt| {
                        new_move
                            .marks
                            .push((pt.x as usize + 1, pt.y as usize + 1, Mark::Cross))
                    }),
                    Prop::CR(set) => set.iter().for_each(|pt| {
                        new_move
                            .marks
                            .push((pt.x as usize + 1, pt.y as usize + 1, Mark::Circle))
                    }),
                    Prop::LB(dict) => dict.iter().for_each(|(pt, cmt)| {
                        new_move.marks.push((
                            pt.x as usize + 1,
                            pt.y as usize + 1,
                            Mark::Label(cmt.to_string()),
                        ))
                    }),
                    Prop::N(text) => {
                        new_move.comment = format!(
                            "{}{}{}",
                            text,
                            if new_move.comment.is_empty() { "" } else { " " },
                            new_move.comment
                        )
                    }
                    Prop::C(text) => {
                        new_move.comment = format!(
                            "{}{}{}",
                            new_move.comment,
                            if new_move.comment.is_empty() { "" } else { " " },
                            text
                        )
                    }
                    Prop::B(pt) => {
                        if let go::Move::Move(pt) = pt {
                            new_move.loc = Some((pt.x as usize + 1, pt.y as usize + 1));
                            new_move.color = Color::Black
                        }
                    }
                    Prop::W(pt) => {
                        if let go::Move::Move(pt) = pt {
                            new_move.loc = Some((pt.x as usize + 1, pt.y as usize + 1));
                            new_move.color = Color::White
                        }
                    }
                    a => println!("ignoring property {}", a),
                }
            }
            table[i].push(Some(new_move));

            if node.children.is_empty() {
                break;
            }

            for child in node.children.drain(1..) {
                stack.push((child, j + 1));
            }

            node = node.children.pop().unwrap();
            j += 1;
        }
    }
    Problem {
        initial,
        id: Uuid::new_v4(),
        table,
        window: (min_row, max_row, min_col, max_col),
    }
}
