import { AppBar, Badge, IconButton, Toolbar } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import clsx from "clsx";
import { default as React } from "react";
import { useStyles } from "../styles";

interface Props {
    title: string;
}

export default function TopBar({ title }: Props) {
    const classes = useStyles({});

    return (
        <AppBar position="absolute" className={clsx(classes.appBar)}>
            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={() => window.location.assign("#/home")}
                >
                    <MenuIcon />
                </IconButton>
                <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                    {title}
                </Typography>
                {false &&
                    <IconButton color="inherit">
                        <Badge badgeContent={4} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                }
            </Toolbar>
        </AppBar>
    );
}
