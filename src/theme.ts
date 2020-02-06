import { createMuiTheme } from "@material-ui/core";

const primaryColor = "#2E3192";
export const theme = createMuiTheme({
    palette: {
        primary: {
            contrastText: "#fff",
            dark: primaryColor,
            light: primaryColor,
            main: primaryColor,
        },
        background: {
            default: "#fff",
        }
    }
});
