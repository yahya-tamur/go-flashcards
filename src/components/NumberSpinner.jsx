// Copied (as suggested) from https://mui.com/material-ui/react-number-field/
// with minimal changes
// Accessed on 5/4/2026

const React = (await import("react")).default;
const PropTypes = (await import("prop-types")).default;
const BaseNumberField = {
  ...(await import("@base-ui/react/number-field")).NumberField,
};
const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const FormControl = (await import("@mui/material/FormControl")).default;
const FormLabel = (await import("@mui/material/FormLabel")).default;
const AddIcon = (await import("@mui/icons-material/Add")).default;
const RemoveIcon = (await import("@mui/icons-material/Remove")).default;
const OutlinedInput = (await import("@mui/material/OutlinedInput")).default;
const OpenInFullIcon = (await import("@mui/icons-material/OpenInFull")).default;

const { inputBaseClasses } = await import("@mui/material/InputBase");
const InputAdornment = (await import("@mui/material/InputAdornment")).default;

function NumberSpinner({
  id: idProp,
  label,
  error,
  size = "medium",
  ...other
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
      <BaseNumberField.ScrubArea
        render={
          <Box
            component="span"
            sx={{ userSelect: "none", width: "max-content" }}
          />
        }
      >
        {/*<FormLabel
          htmlFor={id}
          sx={{
            display: "inline-block",
            cursor: "ew-resize",
            fontSize: "0.875rem",
            color: "text.primary",
            fontWeight: 500,
            lineHeight: 1.5,
            mb: 0.5,
          }}
        >
          {label}
        </FormLabel>*/}
        <BaseNumberField.ScrubAreaCursor>
          <OpenInFullIcon
            fontSize="small"
            sx={{ transform: "translateY(12.5%) rotate(45deg)" }}
          />
        </BaseNumberField.ScrubAreaCursor>
      </BaseNumberField.ScrubArea>
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
                <InputAdornment sx={{ marginRight: "23px" }}>
                  {`/ ${new Intl.NumberFormat().format(other.max)}`}
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

NumberSpinner.propTypes = {
  error: PropTypes.bool,
  /**
   * The id of the input element.
   */
  id: PropTypes.string,
  label: PropTypes.node,
  /**
   * The minimum value of the input element.
   */
  min: PropTypes.number,
  size: PropTypes.oneOf(["medium", "small"]),
};

export default NumberSpinner;
