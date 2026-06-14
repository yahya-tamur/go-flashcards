/*
// 21 x 21 board (empty border) -> 19 x 19 board.
pub fn send(r : usize, c : usize, transform : usize) -> (usize, usize) {
    match transform {
        0 => ( r - 1,  c - 1),
        1 => (19 - r,  c - 1),
        2 => ( r + 1, 19 - c),
        3 => (19 - r, 19 - c),
        4 => ( c - 1,  r - 1),
        5 => (19 - c,  r - 1),
        6 => ( c - 1, 19 - r),
        7 => (19 - c, 19 - r),
        _ => panic!("invalid transform.")
    }
}*/

use crate::{
    game_state::{other_color, Color},
    move_tree::MoveTree,
};

impl MoveTree {
    // 19 x 19 board-> 21 x 21 board  (empty border) .
    pub fn recv(&self, i: usize, j: usize) -> (usize, usize) {
        match self.orientation {
            0 => (i + 1, j + 1),
            1 => (19 - i, j + 1),
            2 => (i + 1, 19 - j),
            3 => (19 - i, 19 - j),
            4 => (j + 1, i + 1),
            5 => (j + 1, 19 - i),
            6 => (19 - j, i + 1),
            7 => (19 - j, 19 - i),
            _ => panic!("invalid transform."),
        }
    }

    pub fn send(&self, i: usize, j: usize) -> (usize, usize) {
        match self.orientation {
            0 => (i - 1, j - 1),
            1 => (19 - i, j - 1),
            2 => (i - 1, 19 - j),
            3 => (19 - i, 19 - j),
            4 => (j - 1, i - 1),
            5 => (19 - j, i - 1),
            6 => (j - 1, 19 - i),
            7 => (19 - j, 19 - i),
            _ => panic!("invalid transform."),
        }
    }

    pub fn send_recv_color(&self, c: Color) -> Color {
        if self.color_swap {
            other_color(c)
        } else {
            c
        }
    }
}
