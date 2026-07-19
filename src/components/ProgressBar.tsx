//import type { Color, Variant } from "../bindings";
const { useEffect, /*useState, useRef, */ useContext, useReducer } =
  await import("react");

const Box = (await import("@mui/material/Box")).default;
//const { useTheme } = await import("@mui/material/styles");

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
//const { commands } = await import("../bindings");
//const { handleError } = await import("../utils");

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type PictureData = {
  rects: Rect[];
  numbers: number[];
};

const pictureReducer = (
  pd: PictureData,
  progress: number[] | null,
): PictureData => {
  if (progress === null) {
    return { rects: [], numbers: [] };
  }
  if (
    progress.length === pd.numbers.length &&
    progress.every((n, i) => n === pd.numbers[i])
  ) {
    return pd;
  }
  const partialSums = [0];
  for (const n of progress) {
    partialSums.push(n + (partialSums.at(-1) ?? 0));
  }

  const total = partialSums.at(-1) ?? 0;
  if (total === 0) {
    return { rects: [], numbers: [] };
  }

  const rects = progress
    .map((n, i) => ({
      x: (100 * partialSums[i]) / total,
      y: 0,
      width: (100 * n) / total,
      height: 10,
    }))
    .filter((r) => r.width !== 0);
  return { numbers: [...progress], rects };
};

export type NumberAction = {
  numbers: [number][];
};

const ProgressBar = () => {
  const { c_data } = useContext(AppContext);

  const [pictureData, setPictureData] = useReducer(pictureReducer, {
    rects: [],
    numbers: [],
  });

  useEffect(() => {
    setPictureData(c_data?.progress ?? null);
  }, [c_data, setPictureData]);

  /*const variantColorDict = {
    Correct: theme.palette.success.dark,
    Incorrect: theme.palette.error.dark,
    New: theme.palette.primary.light,
    None: null,
  };*/
  const colors = ["#000000", "#333333", "#666666", "#999999", "#cccccc"];

  return (
    <Box sx={{ width: "300px", height: "30px" }}>
      <svg
        viewBox={`0 0 100 10`}
        style={{
          width: `300px`,
          height: `30px`,
        }}
      >
        <g>
          {pictureData.rects.map((p, i) => (
            <rect
              x={p.x}
              y={p.y}
              width={p.width}
              height={p.height}
              stroke="none"
              strokeWidth={0}
              fill={colors[i]}
              key={JSON.stringify(p)}
            />
          ))}
        </g>
      </svg>
    </Box>
  );
};

export default ProgressBar;
