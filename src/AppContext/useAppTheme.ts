import type { Dispatch } from "react";

import type { ImageVariant, ThemeConfig } from "./types";

import { startTransition, useActionState, useCallback, useEffect } from "react";

import {
  PaletteMode,
  Theme,
  ThemeOptions,
  createTheme,
} from "@mui/material/styles";

import mime from "mime";

import { commands } from "@/bindings";

const theme_from_import = (theme_import: ThemeOptions): Theme => {
  const theme = createTheme({
    ...theme_import,
    palette: {
      ...theme_import.palette,
      mode: (theme_import.palette?.mode ?? "dark") as PaletteMode,
    },
  });

  return createTheme(theme, {
    components: {
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            backgroundColor: theme.palette.toggle.light,
          },
        },
      },
      MuiFormLabel: {
        styleOverrides: {
          root: {
            "&.Mui-focused": {
              color: theme.palette.primary.contrastText,
            },
          },
        },
      },
    },
  });
};

const assets = new Map();

// can throw! (probably replace this with eslint ignore)
const getAsset = async (asset: string): Promise<string> => {
  if (assets.has(asset)) {
    return assets.get(asset);
  }
  const binary = await commands.getAsset(asset);
  const type = mime.getType(asset) ?? "application/octet-stream";
  const blob = new Blob([binary], { type });
  const url = URL.createObjectURL(blob);
  assets.set(asset, url);
  return url;
};

export type AppTheme = {
  name: string;
  images: Record<ImageVariant, string>;
  theme: Theme;
  error: null | unknown;
};

const themeReducer = async (
  appTheme: AppTheme,
  newTheme: string,
): Promise<AppTheme> => {
  if (newTheme === appTheme.name) {
    return appTheme;
  }
  try {
    const theme_binary = await commands.getAsset(newTheme);
    const theme_config: ThemeConfig = JSON.parse(
      await new Blob([theme_binary], { type: "application/json" }).text(),
    );

    const theme = theme_from_import(theme_config.themeOptions);
    const images = {
      Delete: await getAsset(theme_config.images.Delete),
      DeleteMark: await getAsset(theme_config.images.DeleteMark),
      Black: await getAsset(theme_config.images.Black),
      White: await getAsset(theme_config.images.White),
      Triangle: await getAsset(theme_config.images.Triangle),
      Circle: await getAsset(theme_config.images.Circle),
      Cross: await getAsset(theme_config.images.Cross),
      Square: await getAsset(theme_config.images.Square),
      BlackTerritory: await getAsset(theme_config.images.BlackTerritory),
      WhiteTerritory: await getAsset(theme_config.images.WhiteTerritory),
      Board: await getAsset(theme_config.images.Board),
    };

    return {
      name: newTheme,
      theme,
      images,
      error: null,
    };
  } catch (e) {
    return { ...defaultAppTheme(), error: e };
  }
};

// maybe make this the dark theme later
const defaultAppTheme = () => ({
  name: "none_" + Math.random().toString(36).substring(2),
  images: {
    Delete: "./placeholder.png",
    DeleteMark: "./placeholder.png",
    Black: "./placeholder.png",
    White: "./placeholder.png",
    Triangle: "./placeholder.png",
    Circle: "./placeholder.png",
    Cross: "./placeholder.png",
    Square: "./placeholder.png",
    BlackTerritory: "./placeholder.png",
    WhiteTerritory: "./placeholder.png",
    Board: "./placeholder.png",
  },
  theme: createTheme(),
  error: null,
});

const useAppTheme = (
  handleError: (e: unknown) => void,
): [Theme, Record<ImageVariant, string>, Dispatch<string>, boolean] => {
  const [theme, themeAction, themePending] = useActionState(
    themeReducer,
    defaultAppTheme(),
  );
  const setTheme = useCallback(
    (s: string) => {
      startTransition(() => {
        themeAction(s);
      });
    },
    [themeAction],
  );

  useEffect(() => {
    commands.getConfig().then((config) => {
      setTheme(config.theme);
    }).catch(e => handleError(e));
  }, [setTheme, handleError]);

  //maybe reconsider, but can't put this inside themeAction, so idk.
  useEffect(() => {
    if (theme.error !== null) {
      handleError(theme.error);
    }
  }, [theme, handleError]);

  return [theme.theme, theme.images, setTheme, themePending];
};

export default useAppTheme;
