import { makeStyles } from "@material-ui/core";
import purpleShield from "./ui/assets/images/shield-purple-deep.svg";
import whiteShield from "./ui/assets/images/shield-white.svg";
const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
        height: "100%",
    },
    homeLogo: {
        backgroundImage: `url(${purpleShield})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        marginBottom: 16,
        height: "30%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2em",
        fontWeight: 700,
    },
    toolbarIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 8px",
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: "none",
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: "relative",
        whiteSpace: "nowrap",
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up("sm")]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
        overflow: "auto",
        display: "flex",
    },
    contentContainer: {
        flexGrow: 1,
        zIndex: 10,
    },
    paper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
    },
    paperTitle: {
        padding: theme.spacing(2),
        margin: -theme.spacing(2),
        marginBottom: 0,
        borderBottom: "1px solid #eee",
    },
    fixedHeight: {
        height: 240,
    },
    bottomLeftButton: {
        position: "absolute",
        bottom: 32,
        left: 32,
        color: "#ddd",
    },
    bottomRightButton: {
        position: "absolute",
        bottom: 32,
        right: 32,
    },
    bottomCenterButton: {
        position: "absolute",
        bottom: 32,
        left: "50%",
        marginLeft: -56 / 2,
        // marginBottom: (56 - 70) / 2,

        a: {
            width: 70,
            height: 70,
        }
    },
    cover: {
        background: theme.palette.primary.main,
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: "white",
    },
    warning: {
        color: "red",
        fontWeight: "bold",
    },
    whiteShieldBg: {
        width: "100%",
        height: "100%",
        backgroundImage: `url(${whiteShield})`,
        backgroundPosition: 'center',
        backgroundSize: '50%',
        backgroundRepeat: 'no-repeat',
    }
}));

export { useStyles };

