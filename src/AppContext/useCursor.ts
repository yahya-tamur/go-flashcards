import type { Color, MarkPaint, RectangleMark, StonePaint } from "@/bindings";

import { useReducer } from "react";

export type ClickTool =
  { value: "Black"; layer: "stone" } | { value: "White"; layer: "stone" };

export type PaintTool =
  | { value: "Triangle"; layer: "mark" }
  | { value: "Cross"; layer: "mark" }
  | { value: "Square"; layer: "mark" }
  | { value: "Circle"; layer: "mark" }
  | { value: "Label"; layer: "mark" }
  | { value: "DeleteMark"; layer: "mark" }
  | { value: "Black"; layer: "stone" }
  | { value: "White"; layer: "stone" }
  | { value: "Delete"; layer: "stone" };

export type RectangleTool =
  | { value: "BlackTerritory"; layer: "mark" }
  | { value: "WhiteTerritory"; layer: "mark" }
  | { value: "DeleteMark"; layer: "mark" };

export type Tool = ClickTool | PaintTool | RectangleTool;

export type ClickCursor = {
  type: "click";
  tool: ClickTool;
  ghosts: [number, number][];
};

export type PaintCursor = {
  type: "paint";
  tool: PaintTool;
  ghosts: [number, number][];
  dragging: [number, number][] | null;
  leftMode: MarkPaint | StonePaint | null;
};
export type RectangleCursor = {
  type: "rectangle";
  tool: RectangleTool;
  ghosts: [number, number][];
  start: [number, number] | null;
  end: [number, number] | null;
  leftMode: RectangleMark | null;
};

export type Cursor = ClickCursor | PaintCursor | RectangleCursor;

export type CursorAction =
  | {
      type: "set_click";
      value: "Black" | "White";
    }
  | {
      type: "set_paint";
      value: MarkPaint | StonePaint;
    }
  | {
      type: "set_rectangle";
      value: RectangleMark;
    }
  | {
      type: "down";
      w: [number, number] | null;
    }
  | {
      type: "rightdown";
      w: [number, number] | null;
    }
  | {
      type: "move";
      w: [number, number] | null;
    }
  | {
      type: "up";
    };

const defaultClickCursor = (color: Color): ClickCursor => ({
  ghosts: [],
  type: "click",
  tool: {
    value: color,
    layer: "stone",
  },
});

const defaultPaintCursor = (value: MarkPaint | StonePaint): PaintCursor =>
  value === "Black" || value === "White" || value === "Delete"
    ? {
        type: "paint",
        ghosts: [],
        dragging: null,
        tool: {
          value: value,
          layer: "stone",
        },
        leftMode: null,
      }
    : {
        type: "paint",
        ghosts: [],
        dragging: null,
        tool: {
          value: value,
          layer: "mark",
        },
        leftMode: null,
      };

const defaultRectangleCursor = (value: RectangleMark): RectangleCursor => ({
  type: "rectangle",
  tool: {
    value: value,
    layer: "mark",
  },
  ghosts: [],
  start: null,
  end: null,
  leftMode: null,
});

// 2. Transform the union into an object indexed by that key
type CursorReducerMapType = {
  [A in CursorAction["type"]]: {
    [C in Cursor["type"]]: (
      cursor: Extract<Cursor, { type: C }>,
      action: Extract<CursorAction, { type: A }>,
    ) => Cursor;
  };
};

const wEquals = (
  a: [number, number] | null,
  b: [number, number] | null,
): boolean =>
  a === null || b === null ? a === b : a[0] === b[0] && a[1] === b[1];

const cursorMap: CursorReducerMapType = {
  set_click: {
    click: (cursor, action) =>
      cursor.tool.value === action.value
        ? cursor
        : defaultClickCursor(action.value),
    paint: (_cursor, action) => defaultClickCursor(action.value),
    rectangle: (_cursor, action) => defaultClickCursor(action.value),
  },
  set_paint: {
    click: (_cursor, action) => defaultPaintCursor(action.value),
    paint: (cursor, action) =>
      cursor.tool.value === action.value
        ? cursor
        : defaultPaintCursor(action.value),
    rectangle: (_cursor, action) => defaultPaintCursor(action.value),
  },
  set_rectangle: {
    click: (_cursor, action) => defaultRectangleCursor(action.value),
    paint: (_cursor, action) => defaultRectangleCursor(action.value),
    rectangle: (cursor, action) =>
      cursor.tool.value === action.value
        ? cursor
        : defaultRectangleCursor(action.value),
  },
  down: {
    click: (cursor) => cursor,
    paint: (cursor, action) => {
      if (
        cursor.dragging !== null &&
        cursor.dragging.length <= 1 &&
        wEquals(cursor.dragging[0] ?? null, action.w)
      ) {
        return cursor;
      } else {
        const cursor_ = structuredClone(cursor);
        cursor_.dragging = action.w === null ? [] : [action.w];
        if (
          cursor.tool.value === "Delete" ||
          cursor.tool.value === "DeleteMark"
        ) {
          cursor_.ghosts = action.w === null ? [] : [action.w];
        } else {
          cursor_.ghosts = [];
        }
        return cursor_;
      }
    },
    rectangle: (cursor, action) => {
      if (wEquals(cursor.start, action.w) && wEquals(cursor.end, action.w)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.start = action.w;
      cursor_.end = action.w;
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    },
  },
  rightdown: {
    click: (cursor) => cursor,
    paint: (cursor, action) => {
      if (
        cursor.leftMode !== null &&
        cursor.dragging !== null &&
        cursor.dragging.length <= 1 &&
        wEquals(cursor.dragging[0] ?? null, action.w)
      ) {
        return cursor;
      } else {
        const cursor_ = defaultPaintCursor(
          cursor.tool.value === "Black" ||
            cursor.tool.value === "White" ||
            cursor.tool.value === "Delete"
            ? "Delete"
            : "DeleteMark",
        );
        if (cursor.leftMode === null) {
          cursor_.leftMode = cursor.tool.value;
        }
        cursor_.dragging = action.w === null ? [] : [action.w];
        cursor_.ghosts = action.w === null ? [] : [action.w];
        return cursor_;
      }
    },
    rectangle: (cursor, action) => {
      if (
        cursor.leftMode !== null &&
        wEquals(cursor.start, action.w) &&
        wEquals(cursor.end, action.w)
      ) {
        return cursor;
      }
      const cursor_ = defaultRectangleCursor("DeleteMark");
      if (cursor.leftMode === null) {
        cursor_.leftMode = cursor.tool.value;
      }
      cursor_.start = action.w;
      cursor_.end = action.w;
      cursor_.ghosts = action.w === null ? [] : [action.w];

      return cursor_;
    },
  },
  move: {
    click: (cursor, action) => {
      if (wEquals(action.w, cursor.ghosts[0] ?? null)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    },
    paint: (cursor, action) => {
      if (action.w === null) {
        if (cursor.dragging === null && cursor.ghosts.length > 0) {
          const cursor_ = structuredClone(cursor);
          cursor_.ghosts = [];
          return cursor_;
        } else {
          return cursor;
        }
      } else if (cursor.dragging === null) {
        if (wEquals(action.w, cursor.ghosts[0] ?? null)) {
          return cursor;
        } else {
          const cursor_ = structuredClone(cursor);
          cursor_.ghosts = [action.w];
          return cursor_;
        }
      } else {
        if (cursor.dragging.some((w) => wEquals(w, action.w))) {
          return cursor;
        } else {
          return {
            type: "paint",
            tool: structuredClone(cursor.tool),
            ghosts:
              action.w === null ||
              (cursor.tool.value !== "Delete" &&
                cursor.tool.value !== "DeleteMark")
                ? []
                : [action.w],
            dragging: [...cursor.dragging, action.w],
            leftMode: cursor.leftMode,
          };
        }
      }
    },
    rectangle: (cursor, action) => {
      if (wEquals(action.w, cursor.end)) {
        return cursor;
      }
      if (action.w === null) {
        const cursor_ = structuredClone(cursor);
        cursor_.end = null;
        cursor_.ghosts = [];
        return cursor_;
      }
      if (cursor.start === null) {
        const cursor_ = structuredClone(cursor);
        cursor_.end = action.w;
        cursor_.ghosts = [action.w];
        return cursor_;
      }
      const [r, rr] = [cursor.start[0], action.w[0]].toSorted((a, b) => a - b);
      const [c, cc] = [cursor.start[1], action.w[1]].toSorted((a, b) => a - b);
      const ghosts: [number, number][] = [];
      for (let row = r; row <= rr; row++) {
        for (let col = c; col <= cc; col++) {
          ghosts.push([row, col]);
        }
      }
      const cursor_ = structuredClone(cursor);
      cursor_.end = action.w;
      cursor_.ghosts = ghosts;
      return cursor_;
    },
  },
  up: {
    click: (cursor) =>
      cursor.ghosts.length === 0
        ? cursor
        : defaultClickCursor(cursor.tool.value),
    paint: (cursor) => {
      if (cursor.leftMode !== null) {
        return defaultPaintCursor(cursor.leftMode);
      }
      if (cursor.dragging === null && cursor.ghosts.length === 0) {
        return cursor;
      }
      return defaultPaintCursor(cursor.tool.value);
    },
    rectangle: (cursor) => {
      if (cursor.leftMode !== null) {
        return defaultRectangleCursor(cursor.leftMode);
      }
      if (cursor.start === null && cursor.end === null) {
        return cursor;
      }
      return defaultRectangleCursor(cursor.tool.value);
    },
  },
};

const cursorReducer = (cursor: Cursor, action: CursorAction): Cursor =>
  (
    cursorMap[action.type][cursor.type] as (
      cur: Extract<Cursor, { type: (typeof cursor)["type"] }>,
      act: Extract<CursorAction, { type: (typeof action)["type"] }>,
    ) => Cursor
  )(cursor, action);

const useCursor = () => {
  return useReducer(cursorReducer, "Black", defaultPaintCursor);
};

export default useCursor;
