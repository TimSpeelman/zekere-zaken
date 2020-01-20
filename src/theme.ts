import { createMuiTheme } from "@material-ui/core";

const kvkBlue = "#00526e";
export const theme = createMuiTheme({
    palette: {
        primary: {
            contrastText: "white",
            dark: kvkBlue,
            light: kvkBlue,
            main: kvkBlue,
        }
    }
});
