import "@mui/material/styles";

declare module "@mui/material/styles" {
  // Configures the options available inside createTheme()
  interface ThemeOptions {
    palette?: {
      toggle?: {
        light?: string;
        main?: string;
        dark?: string;
        contrastText?: string;
      };
      button?: {
        light?: string;
        main?: string;
        dark?: string;
        contrastText?: string;
      };
    };
  }

  // Configures the structural output returned by useTheme()
  interface Palette {
    toggle: {
      light: string;
      main: string;
      dark: string;
      contrastText: string;
    };
    button: {
      light: string;
      main: string;
      dark: string;
      contrastText: string;
    };
  }
}
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    button: true; // Replace 'custom' with your color name
  }
}

declare module "@mui/material/ToggleButtonGroup" {
  interface ToggleButtonGroupPropsColorOverrides {
    toggle: true; // Replace 'custom' with your color name
  }
}

declare module "@mui/material/ButtonGroup" {
  interface ButtonGroupPropsColorOverrides {
    gray: true; // Replace 'custom' with your color name
  }
}
