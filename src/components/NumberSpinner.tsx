// Copied (as suggested) from https://mui.com/material-ui/react-number-field/
// with minimal changes
// Accessed on 7/11/2026
const React = (await import("react")).default;

//import { NumberField as BaseNumberField } from '@base-ui/react/number-field';
const { NumberField: BaseNumberField } =
  await import("@base-ui/react/number-field");
const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const FormControl = (await import("@mui/material/FormControl")).default;
const AddIcon = (await import("@mui/icons-material/Add")).default;
const RemoveIcon = (await import("@mui/icons-material/Remove")).default;
const OutlinedInput = (await import("@mui/material/OutlinedInput")).default;
const InputAdornment = (await import("@mui/material/InputAdornment")).default;

import type { NumberField as NF } from "@base-ui/react/number-field";

export default function NumberSpinner({
  id: idProp,
  /* label, */
  error,
  size = "medium",
  ...other
}: NF.Root.Props & {
  /*  label?: React.ReactNode; */
  size?: "small" | "medium";
  error?: boolean;
}) {
  let id = React.useId();
  if (idProp) {
    id = idProp;
  }
  return (
    <BaseNumberField.Root
      {...other}
      render={(props, state) => (
        <FormControl
          size={size}
          ref={props.ref}
          disabled={state.disabled}
          required={state.required}
          error={error}
          variant="outlined"
          sx={{
            "& .MuiButton-root": {
              borderColor: "divider",
              minWidth: 0,
              bgcolor: "action.hover",
              "&:not(.Mui-disabled)": {
                color: "text.primary",
              },
            },
          }}
        >
          {props.children}
        </FormControl>
      )}
    >
      <Box sx={{ display: "flex" }}>
        <BaseNumberField.Decrement
          render={
            <Button
              variant="outlined"
              aria-label="Decrease"
              size={size}
              sx={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRight: "0px",
                "&.Mui-disabled": {
                  borderRight: "0px",
                },
              }}
            />
          }
        >
          <RemoveIcon fontSize={size} />
        </BaseNumberField.Decrement>

        <BaseNumberField.Input
          id={id}
          render={(props, state) => (
            <OutlinedInput
              inputRef={props.ref}
              value={state.inputValue}
              onBlur={props.onBlur}
              onChange={props.onChange}
              onKeyUp={props.onKeyUp}
              onKeyDown={props.onKeyDown}
              onFocus={props.onFocus}
              slotProps={{
                input: {
                  ...props,
                  size:
                    Math.max(
                      (other.min?.toString() || "").length,
                      state.inputValue.length || 1,
                    ) + 1,
                  sx: {
                    textAlign: "center",
                  },
                },
              }}
              endAdornment={
                <InputAdornment position="start" sx={{ marginRight: "23px" }}>
                  {`/ ${new Intl.NumberFormat().format(other.max ?? 1)}`}
                </InputAdornment>
              }
              sx={{ pr: 0, borderRadius: 0, flex: 1 }}
            />
          )}
        />

        <BaseNumberField.Increment
          render={
            <Button
              variant="outlined"
              aria-label="Increase"
              size={size}
              sx={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeft: "0px",
                "&.Mui-disabled": {
                  borderLeft: "0px",
                },
              }}
            />
          }
        >
          <AddIcon fontSize={size} />
        </BaseNumberField.Increment>
      </Box>
    </BaseNumberField.Root>
  );
}
