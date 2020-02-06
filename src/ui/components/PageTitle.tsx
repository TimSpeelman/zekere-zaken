import { Box, IconButton, Typography } from "@material-ui/core";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import CloseIcon from "@material-ui/icons/Close";
import { default as React, ReactElement } from "react";
import { useHistory } from "react-router-dom";

interface Props {
    title: string;
    sub?: string;
    icon?: ReactElement;
    showBackButton?: boolean;
    onQuit?: () => void;
}

export function PageTitle({ title, sub, icon, showBackButton, onQuit }: Props) {
    const history = useHistory();

    return (
        <Box className="page-title">
            {showBackButton &&
                <IconButton
                    className="start-icon"
                    edge="start"
                    color="inherit"
                    onClick={() => history.goBack()}
                >
                    <ArrowBackIos />
                </IconButton>
            }

            <Box p={1} className={"enter-item"}>
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
