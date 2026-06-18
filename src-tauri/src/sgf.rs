// not even crate fs or async

use sgf_parse::{
    go::{self, parse, Point, Prop},
    SgfNode, SimpleText, Text,
};
use std::{collections::HashSet, fs, hash::Hash, ops::ControlFlow, path::Path};
use uuid::Uuid;

use crate::{
    game_state::{Color::*, GameState, Mark::*},
    problem::{Move, Problem, Variant},
};

pub fn sgf_parse(app_data: &Path) -> Problem {
    println!("AA");
    let sgf = fs::read(app_data.join("app_data").join("test.sgf")).unwrap();
    let sgf = str::from_utf8(&sgf).unwrap();

    let mut collection = parse(sgf).unwrap();

    sgf_to_problem(collection.pop().unwrap())
}

// will destroy input!

//

// maybe provide US node when serializing.

pub fn sgf_to_problem(mut start: SgfNode<Prop>) -> Problem {
    let x = |p: &go::Point| p.x as usize + 1;
    let y = |p: &go::Point| p.y as usize + 1;

    let mut gs: GameState = GameState::default();
    let mut comment: String = String::new();

    let (mut min_row, mut max_row, mut min_col, mut max_col) = (1usize, 19usize, 1usize, 19usize);
    let mut initial_color = Black;

    while start.get_move().is_none() && start.children.len() <= 1 {
        for prop in start.properties() {
            #[cfg_attr(rustfmt, rustfmt_skip)]
            match prop {
                Prop::AB(set) => set.iter().for_each(|p| gs.stones[x(p)][y(p)] = Some(Black)),
                Prop::AW(set) => set.iter().for_each(|p| gs.stones[x(p)][y(p)] = Some(White)),
                Prop::VW(set) => set.iter().for_each(|p| {
                    min_row = min_row.min(x(p));
                    max_row = max_row.max(x(p));
                    min_col = min_col.min(y(p));
                    max_col = max_col.max(y(p));
                }),
                Prop::SQ(set) => set.iter().for_each(|p| gs.marks[x(p)][y(p)] = Some(Square)),
                Prop::TR(set) => set.iter().for_each(|p| gs.marks[x(p)][y(p)] = Some(Triangle)),
                Prop::MA(set) => set.iter().for_each(|p| gs.marks[x(p)][y(p)] = Some(Cross)),
                Prop::LB(dict) => dict.iter().for_each(|(p, cmt)| gs.marks[x(p)][y(p)] = Some(Label(cmt.to_string()))),
                Prop::CR(set) => set.iter().for_each(|p| gs.marks[x(p)][y(p)] = Some(Circle)),
                Prop::N(text) => comment = format!("{}{}{}",text,if comment.is_empty() { "" } else { " " },comment),
                Prop::C(text) => comment = format!("{}{}{}",comment,if comment.is_empty() { "" } else { " " },text),                   
                Prop::PL(color) => initial_color = if *color == sgf_parse::Color::Black {Black} else {White},
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
                    Prop::SQ(set) => set
                        .iter()
                        .for_each(|p| new_move.marks.push((x(p), y(p), Square))),
                    Prop::TR(set) => set
                        .iter()
                        .for_each(|p| new_move.marks.push((x(p), y(p), Triangle))),
                    Prop::MA(set) => set
                        .iter()
                        .for_each(|p| new_move.marks.push((x(p), y(p), Cross))),
                    Prop::CR(set) => set
                        .iter()
                        .for_each(|p| new_move.marks.push((x(p), y(p), Circle))),
                    Prop::LB(dict) => dict.iter().for_each(|(p, cmt)| {
                        new_move.marks.push((x(p), y(p), Label(cmt.to_string())))
                    }),
                    Prop::N(text) => {
                        if text.text == "Corrent" {
                            new_move.variant = Variant::Correct
                        } else if text.text == "Incorrect" {
                            new_move.variant = Variant::Incorrect
                        } else {
                            new_move.comment = format!(
                                "{}{}{}",
                                text,
                                if new_move.comment.is_empty() { "" } else { " " },
                                new_move.comment
                            )
                        }
                    }
                    Prop::C(text) => {
                        new_move.comment = format!(
                            "{}{}{}",
                            new_move.comment,
                            if new_move.comment.is_empty() { "" } else { " " },
                            text.text
                        )
                    }
                    Prop::B(p) => {
                        if let go::Move::Move(p) = p {
                            new_move.loc = Some((x(p), y(p)));
                            new_move.color = Black
                        }
                    }
                    Prop::W(p) => {
                        if let go::Move::Move(p) = p {
                            new_move.loc = Some((x(p), y(p)));
                            new_move.color = White
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
        initial: gs,
        id: Uuid::new_v4(),
        table,
        window: (min_row, max_row, min_col, max_col),
    }
}

pub fn problem_to_sgf(problem: &Problem) -> SgfNode<Prop> {
    let mut start = SgfNode::<Prop>::new(
        vec![
            Prop::FF(4),
            Prop::CA(SimpleText {
                text: "UTF-8".to_owned(),
            }),
            Prop::GM(1),
            Prop::SZ((19, 19)), //RU?
        ],
        vec![],
        true,
    );

    let pt = |i: usize, j: usize| Point {
        x: (i - 1) as u8,
        y: (j - 1) as u8,
    };

    let mut black = HashSet::new();
    let mut white = HashSet::new();
    let mut circle = HashSet::new();
    let mut cross = HashSet::new();
    let mut triangle = HashSet::new();
    let mut square = HashSet::new();
    let mut label = HashSet::new();

    for i in 1..19 {
        for j in 1..19 {
            match problem.initial.stones[i][j] {
                Some(Black) => {
                    black.insert(pt(i, j));
                }
                Some(White) => {
                    white.insert(pt(i, j));
                }
                _ => {}
            };
            match problem.initial.marks[i][j] {
                Some(Circle) => {
                    circle.insert(pt(i, j));
                }
                Some(Square) => {
                    square.insert(pt(i, j));
                }
                Some(Triangle) => {
                    triangle.insert(pt(i, j));
                }
                Some(Cross) => {
                    cross.insert(pt(i, j));
                }
                Some(Label(ref str)) => {
                    label.insert((pt(i, j), SimpleText { text: str.clone() }));
                }
                _ => {}
            }
        }
    }

    if !black.is_empty() {
        start.properties.push(Prop::AB(black))
    };
    if !white.is_empty() {
        start.properties.push(Prop::AW(white))
    };
    if !circle.is_empty() {
        start.properties.push(Prop::CR(circle))
    };
    if !cross.is_empty() {
        start.properties.push(Prop::MA(cross))
    };
    if !triangle.is_empty() {
        start.properties.push(Prop::TR(triangle))
    };
    if !square.is_empty() {
        start.properties.push(Prop::SQ(square))
    };
    if !label.is_empty() {
        start.properties.push(Prop::LB(label))
    };

    let first_move: &Move = problem.table[0][0].as_ref().unwrap();

    if !first_move.comment.is_empty() {
        start.properties.push(Prop::C(Text {
            text: first_move.comment.clone(),
        }));
    }

    start
        .properties
        .push(Prop::PL(if first_move.color == Black {
            sgf_parse::Color::White
        } else {
            sgf_parse::Color::Black
        }));

    let (row_start, row_end, col_start, col_end) = problem.window;
    start.properties.push(Prop::VW(
        (row_start..=row_end)
            .flat_map(|i| (col_start..=col_end).map(move |j| (i, j)))
            .map(|(i, j)| pt(i, j))
            .collect(),
    ));

    panic!()
}
