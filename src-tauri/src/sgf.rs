// not even crate fs or async

// ALL COMMENTS:
// add to sgf? :
// AP: application program
// US: user who typed it in.??
// uuid of problem.
// initial color? (sgf -> problem especially.)
// imports, esp. when sgf_parse::thing ovelaps.

use sgf_parse::{
    go::{self, Point, Prop},
    SgfNode, SimpleText, Text,
};

use crate::{error::error, Result};
use std::collections::HashSet;
use uuid::Uuid;

use crate::game::{Color::*, Mark::*, Move, Problem, Variant};

fn error_on_none<T>(opt: Option<T>) -> Result<T> {
    opt.ok_or_else(|| error("error converting sgf."))
}

pub fn sgf_to_problem(mut start: SgfNode<Prop>) -> Result<Problem> {
    let x = |p: &go::Point| p.x as usize + 1;
    let y = |p: &go::Point| p.y as usize + 1;

    // let mut gs: GameState = GameState::default();
    let mut initial_black = Vec::new();
    let mut initial_white = Vec::new();

    let mut mov: Move = Move::default();

    let (mut min_row, mut max_row, mut min_col, mut max_col) = (1usize, 19usize, 1usize, 19usize);
    let mut id = Uuid::new_v4();

    while start.get_move().is_none() && start.children.len() <= 1 {
        for prop in start.properties() {
            match prop {
                Prop::AB(set) => set.iter().for_each(|p| initial_black.push((x(p), y(p)))),
                Prop::AW(set) => set.iter().for_each(|p| initial_white.push((x(p), y(p)))),
                Prop::VW(set) => {
                    min_row = error_on_none(set.iter().map(&x).min())?;
                    max_row = error_on_none(set.iter().map(&x).max())?;
                    min_col = error_on_none(set.iter().map(&y).min())?;
                    max_col = error_on_none(set.iter().map(&y).max())?;
                }
                Prop::SQ(set) => set
                    .iter()
                    .for_each(|p| mov.marks.push((x(p), y(p), Square))),
                Prop::TR(set) => set
                    .iter()
                    .for_each(|p| mov.marks.push((x(p), y(p), Triangle))),
                Prop::MA(set) => set.iter().for_each(|p| mov.marks.push((x(p), y(p), Cross))),
                Prop::TB(set) => set
                    .iter()
                    .for_each(|p| mov.marks.push((x(p), y(p), BlackTerritory))),
                Prop::TW(set) => set
                    .iter()
                    .for_each(|p| mov.marks.push((x(p), y(p), WhiteTerritory))),
                Prop::LB(dict) => dict
                    .iter()
                    .for_each(|(p, cmt)| mov.marks.push((x(p), y(p), Label(cmt.to_string())))),
                Prop::CR(set) => set
                    .iter()
                    .for_each(|p| mov.marks.push((x(p), y(p), Circle))),
                Prop::N(text) => {
                    if text.text == "Correct" {
                        mov.variant = Variant::Correct
                    } else if text.text == "Incorrect" {
                        mov.variant = Variant::Incorrect
                    } else {
                        println!("{}", text.text);
                        mov.comment = format!(
                            "{}{}{}",
                            text,
                            if mov.comment.is_empty() { "" } else { " " },
                            mov.comment
                        )
                    }
                }
                Prop::C(text) => {
                    mov.comment = format!(
                        "{}{}{}",
                        mov.comment,
                        if mov.comment.is_empty() { "" } else { " " },
                        text
                    )
                }
                Prop::PL(color) => {
                    mov.color = if *color == sgf_parse::Color::Black {
                        White
                    } else {
                        Black
                    }
                }
                Prop::GN(game_name) => {
                    if let Ok(uuid) = Uuid::try_parse(&game_name.text) {
                        id = uuid;
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

    let mut table = vec![vec![Some(mov)]];
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
                    Prop::TB(set) => set
                        .iter()
                        .for_each(|p| new_move.marks.push((x(p), y(p), BlackTerritory))),
                    Prop::TW(set) => set
                        .iter()
                        .for_each(|p| new_move.marks.push((x(p), y(p), WhiteTerritory))),
                    Prop::LB(dict) => dict.iter().for_each(|(p, cmt)| {
                        new_move.marks.push((x(p), y(p), Label(cmt.to_string())))
                    }),
                    Prop::N(text) => {
                        if text.text == "Correct" {
                            new_move.variant = Variant::Correct
                        } else if text.text == "Incorrect" {
                            new_move.variant = Variant::Incorrect
                        } else {
                            println!("{}", text.text);
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

            node = error_on_none(node.children.pop())?;
            j += 1;
        }
    }
    if table[0].len() > 1 {
        let (root, rest) = table[0].split_at_mut(1);
        if let Some(mov) = rest[0].as_ref() {
            error_on_none(root[0].as_mut())?.color = match mov.color {
                Black => White,
                White => Black,
            };
        }
    }

    Ok(Problem {
        initial_black,
        initial_white,
        id,
        table,
        window: (min_row, max_row, min_col, max_col),
    })
}

#[derive(Default)]
struct NodeBuilder {
    other_props: Vec<Prop>,
    black: Option<go::Move>,
    white: Option<go::Move>,
    add_black: HashSet<Point>,
    add_white: HashSet<Point>,
    black_territory: HashSet<Point>,
    white_territory: HashSet<Point>,
    circle: HashSet<Point>,
    cross: HashSet<Point>,
    triangle: HashSet<Point>,
    square: HashSet<Point>,
    label: HashSet<(Point, SimpleText)>,
}

impl NodeBuilder {
    fn start(other_props: Vec<Prop>) -> NodeBuilder {
        NodeBuilder {
            other_props,
            ..Default::default()
        }
    }
    fn finalize(mut self, root: bool) -> SgfNode<Prop> {
        if let Some(m) = self.black {
            self.other_props.push(Prop::B(m));
        };
        if let Some(m) = self.white {
            self.other_props.push(Prop::W(m));
        };
        if !self.add_black.is_empty() {
            self.other_props.push(Prop::AB(self.add_black))
        };
        if !self.add_white.is_empty() {
            self.other_props.push(Prop::AW(self.add_white))
        };
        if !self.black_territory.is_empty() {
            self.other_props.push(Prop::TB(self.black_territory))
        };
        if !self.white_territory.is_empty() {
            self.other_props.push(Prop::TW(self.white_territory))
        };
        if !self.circle.is_empty() {
            self.other_props.push(Prop::CR(self.circle))
        };
        if !self.cross.is_empty() {
            self.other_props.push(Prop::MA(self.cross))
        };
        if !self.triangle.is_empty() {
            self.other_props.push(Prop::TR(self.triangle))
        };
        if !self.square.is_empty() {
            self.other_props.push(Prop::SQ(self.square))
        };
        if !self.label.is_empty() {
            self.other_props.push(Prop::LB(self.label))
        };
        SgfNode::<Prop>::new(self.other_props, vec![], root)
    }
}

pub fn problem_to_sgf(problem: &Problem) -> Result<SgfNode<Prop>> {
    let pt = |i: usize, j: usize| Point {
        x: (i - 1) as u8,
        y: (j - 1) as u8,
    };

    // US field? (user who input the game/problem)
    let mut start = NodeBuilder::start(vec![
        Prop::FF(4),
        Prop::CA(SimpleText {
            text: "UTF-8".to_owned(),
        }),
        Prop::GM(1),
        Prop::SZ((19, 19)),
        Prop::AP((
            SimpleText {
                text: "go-flashcards".to_owned(),
            },
            SimpleText {
                text: env!("CARGO_PKG_VERSION").to_owned(),
            },
        )),
        Prop::GN(SimpleText {
            text: problem.id.to_string(),
        }),
    ]);

    for &(i, j) in problem.initial_black.iter() {
        start.add_black.insert(pt(i, j));
    }
    for &(i, j) in problem.initial_white.iter() {
        start.add_white.insert(pt(i, j));
    }

    let first_move: &Move = error_on_none(problem.table[0][0].as_ref())?;

    for mark in first_move.marks.iter() {
        match *mark {
            (i, j, Circle) => {
                start.circle.insert(pt(i, j));
            }
            (i, j, Square) => {
                start.square.insert(pt(i, j));
            }
            (i, j, Triangle) => {
                start.triangle.insert(pt(i, j));
            }
            (i, j, Cross) => {
                start.cross.insert(pt(i, j));
            }
            (i, j, BlackTerritory) => {
                start.black_territory.insert(pt(i, j));
            }
            (i, j, WhiteTerritory) => {
                start.white_territory.insert(pt(i, j));
            }
            (i, j, Label(ref str)) => {
                start
                    .label
                    .insert((pt(i, j), SimpleText { text: str.clone() }));
            }
        }
    }

    if !first_move.comment.is_empty() {
        start.other_props.push(Prop::C(Text {
            text: first_move.comment.clone(),
        }));
    }

    match first_move.variant {
        Variant::Correct => start.other_props.push(Prop::N(SimpleText {
            text: "Correct".to_owned(),
        })),
        Variant::Incorrect => start.other_props.push(Prop::N(SimpleText {
            text: "Incorrect".to_owned(),
        })),
        _ => {}
    }

    start
        .other_props
        .push(Prop::PL(if first_move.color == Black {
            sgf_parse::Color::White
        } else {
            sgf_parse::Color::Black
        }));

    let (row_start, row_end, col_start, col_end) = problem.window;
    start.other_props.push(Prop::VW(
        (row_start..=row_end)
            .flat_map(|i| (col_start..=col_end).map(move |j| (i, j)))
            .map(|(i, j)| pt(i, j))
            .collect(),
    ));

    let start = start.finalize(true);

    let mut node_table: Vec<Vec<Option<SgfNode<Prop>>>> = problem
        .table
        .iter()
        .map(|line| vec![const { None }; line.len()])
        .collect();

    node_table[0][0] = Some(start);

    for (i, line) in problem.table.iter().enumerate() {
        for (j, node) in line.iter().enumerate().skip(1) {
            let Some(node) = node else {
                continue;
            };
            let mut nb = NodeBuilder::default();
            let move_prop = match node.loc {
                Some((i, j)) => go::Move::Move(pt(i, j)),
                None => go::Move::Pass,
            };
            match node.color {
                Black => nb.black = Some(move_prop),
                White => nb.white = Some(move_prop),
            };
            match node.variant {
                Variant::Correct => nb.other_props.push(Prop::N(SimpleText::from("Correct"))),
                Variant::Incorrect => nb.other_props.push(Prop::N(SimpleText::from("Incorrect"))),
                _ => {}
            }
            if !node.comment.is_empty() {
                nb.other_props.push(Prop::C(Text {
                    text: node.comment.clone(),
                }));
            }
            for &(i, j, ref mark) in node.marks.iter() {
                match mark {
                    Circle => {
                        nb.circle.insert(pt(i, j));
                    }
                    Square => {
                        nb.square.insert(pt(i, j));
                    }
                    Triangle => {
                        nb.triangle.insert(pt(i, j));
                    }
                    Cross => {
                        nb.cross.insert(pt(i, j));
                    }
                    BlackTerritory => {
                        nb.black_territory.insert(pt(i, j));
                    }
                    WhiteTerritory => {
                        nb.white_territory.insert(pt(i, j));
                    }
                    Label(str) => {
                        nb.label
                            .insert((pt(i, j), SimpleText { text: str.clone() }));
                    }
                }
            }
            node_table[i][j] = Some(nb.finalize(false));
        }
    }

    let m = error_on_none(node_table.iter().map(|line| line.len()).max())?;

    for j in (1..m).rev() {
        for i in 0..node_table.len() {
            if node_table[i].len() <= j {
                continue;
            }
            if node_table[i][j].is_some() {
                let (mut p_i, p_j) = (i, j - 1);
                while node_table[p_i][p_j].is_none() {
                    p_i -= 1;
                }
                let (parent, child) = if p_i == i {
                    let (left, right) = node_table[i].split_at_mut(j);
                    (&mut left[p_j], &mut right[0])
                } else {
                    let (top, bottom) = node_table.split_at_mut(i);
                    (&mut top[p_i][p_j], &mut bottom[0][j])
                };
                error_on_none(parent.as_mut())?
                    .children
                    .push(error_on_none(child.take())?);
            }
        }
    }

    error_on_none(node_table[0][0].take())
}
