import { Box, IconButton, Typography } from "@material-ui/core";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import CloseIcon from "@material-ui/icons/Close";
import { default as React, ReactElement } from "react";

interface Props {
    title: string;
    sub?: string;
    icon?: ReactElement;
    backURL?: string;
    onQuit?: () => void;
}

export function PageTitle({ title, sub, icon, backURL, onQuit }: Props) {

    return (
        <Box className="page-title">
            {backURL &&
                <IconButton
                    className="start-icon"
                    edge="start"
                    color="inherit"
                    onClick={() => window.location.assign(backURL)}
                >
                    <ArrowBackIos />
                </IconButton>
            }

            <Box p={1}>
                {icon}
                <Typography component="h2" variant="h6">
                    {title}
                </Typography>
                {sub && <span className="sub">{sub}</span>}
            </Box>

            {onQuit && (
                <IconButton
                    className="close-icon"
                    edge="end"
                    color="inherit"
                    onClick={onQuit}
                >
                    <CloseIcon />
                </IconButton>
            )}
        </Box>
    )
}
