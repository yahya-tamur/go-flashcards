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

    pub fn send_window(
        &self,
        window: (usize, usize, usize, usize),
    ) -> (usize, usize, usize, usize) {
        let (mut row_start, mut row_end, mut col_start, mut col_end) = window;

        (row_start, col_start) = self.send(row_start, col_start);
        (row_end, col_end) = self.send(row_end, col_end);

        if row_start > row_end {
            (row_start, row_end) = (row_end, row_start);
        }
        if col_start > col_end {
            (col_start, col_end) = (col_end, col_start);
        }
        (row_start, row_end, col_start, col_end)
    }

    pub fn recv_window(
        &self,
        window: (usize, usize, usize, usize),
    ) -> (usize, usize, usize, usize) {
        let (mut row_start, mut row_end, mut col_start, mut col_end) = window;

        (row_start, col_start) = self.recv(row_start, col_start);
        (row_end, col_end) = self.recv(row_end, col_end);

        if row_start > row_end {
            (row_start, row_end) = (row_end, row_start);
        }
        if col_start > col_end {
            (col_start, col_end) = (col_end, col_start);
        }

        (row_start, row_end, col_start, col_end)
    }
}
