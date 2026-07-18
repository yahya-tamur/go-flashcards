use rand::{
    distr::{Distribution, StandardUniform},
    Rng, RngExt,
};

use crate::game::{other_color, Color, MoveTree};

#[derive(Clone, Debug)]
pub enum Transform {
    Id,
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
}

impl Distribution<Transform> for StandardUniform {
    fn sample<R: Rng + ?Sized>(&self, rng: &mut R) -> Transform {
        match rng.random_range(0..8) {
            0 => Transform::Id,
            1 => Transform::T1,
            2 => Transform::T2,
            3 => Transform::T3,
            4 => Transform::T4,
            5 => Transform::T5,
            6 => Transform::T6,
            7 => Transform::T7,
            _ => unreachable!(),
        }
    }
}

impl MoveTree {
    // 19 x 19 board-> 21 x 21 board  (empty border) .
    pub fn recv(&self, i: usize, j: usize) -> (usize, usize) {
        match self.orientation {
            Transform::Id => (i + 1, j + 1),
            Transform::T1 => (19 - i, j + 1),
            Transform::T2 => (i + 1, 19 - j),
            Transform::T3 => (19 - i, 19 - j),
            Transform::T4 => (j + 1, i + 1),
            Transform::T5 => (j + 1, 19 - i),
            Transform::T6 => (19 - j, i + 1),
            Transform::T7 => (19 - j, 19 - i),
        }
    }

    pub fn send(&self, i: usize, j: usize) -> (usize, usize) {
        match self.orientation {
            Transform::Id => (i - 1, j - 1),
            Transform::T1 => (19 - i, j - 1),
            Transform::T2 => (i - 1, 19 - j),
            Transform::T3 => (19 - i, 19 - j),
            Transform::T4 => (j - 1, i - 1),
            Transform::T5 => (19 - j, i - 1),
            Transform::T6 => (j - 1, 19 - i),
            Transform::T7 => (19 - j, 19 - i),
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
