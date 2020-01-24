import { createMuiTheme } from "@material-ui/core";

const kvkBlue = "#00526e";
export const theme = createMuiTheme({
    palette: {
        primary: {
            contrastText: "#fff",
            dark: kvkBlue,
            light: kvkBlue,
            main: kvkBlue,
        },
        background: {
            default: "#fff",
        }
    }
});
