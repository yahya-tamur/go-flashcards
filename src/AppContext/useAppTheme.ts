import type { Dispatch } from "react";

import { startTransition, useActionState, useCallback, useEffect } from "react";

import {
  PaletteMode,
  Theme,
  ThemeOptions,
  createTheme,
} from "@mui/material/styles";

import mime from "mime";

import { commands } from "@/bindings";

import { APP_IMAGES, type AppImage, type ThemeConfig } from "./types";

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

const assets = new Map<string, Asset>();

type Asset = {
  src: string;
  found: boolean;
};

// can throw! (probably replace this with eslint ignore)
const getAsset = async (name: string): Promise<Asset> => {
  try {
    const map_asset = assets.get(name);
    if (map_asset != undefined) {
      return map_asset;
    }
    const binary = await commands.getAsset(name);
    const type = mime.getType(name) ?? "application/octet-stream";
    const blob = new Blob([binary], { type });
    const url = URL.createObjectURL(blob);
    const asset = { src: url, found: true };

    assets.set(name, asset);

    return asset;
  } catch {
    return { src: "./placeholder", found: false };
  }
};

export type AppTheme = {
  name: string;
  images: Record<AppImage, string>;
  theme: Theme;
  error: null | string;
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
    const images = new Object() as Record<AppImage, string>;

    const errors = [];

    for (const name of APP_IMAGES) {
      const asset = await getAsset(theme_config.images[name]);
      if (!asset.found) {
        errors.push(theme_config.images[name]);
      }
      images[name] = asset.src;
    }

    const error =
      errors.length == 0
        ? null
        : "could not find image" +
          (errors.length === 1 ? "" : "s") +
          ": " +
          errors.join(", ");

    return {
      name: newTheme,
      theme,
      images,
      error,
    };
  } catch {
    return { ...defaultAppTheme(), error: "invalid theme." };
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
  setInitialLoad: (e: boolean) => void,
): [Theme, Record<AppImage, string>, Dispatch<string>, boolean] => {
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
    commands
      .getConfig()
      .then((config) => {
        setTheme(config.theme);
      })
      .catch((e) => handleError(e));
  }, [setTheme, handleError]);

  //maybe reconsider, but can't put this inside themeAction, so idk.
  useEffect(() => {
    if (theme.error !== null) {
      handleError(theme.error);
    }
  }, [theme, handleError]);

  useEffect(() => {
    if (!themePending) {
      setInitialLoad(false);
    }
  }, [setInitialLoad, themePending]);

  return [theme.theme, theme.images, setTheme, themePending];
};

export default useAppTheme;
