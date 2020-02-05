import { Box, IconButton, Typography } from "@material-ui/core";
import ArrowBackIos from "@material-ui/icons/ArrowBackIos";
import { default as React } from "react";

interface Props {
    title: string;
    sub?: string;
    backURL?: string;
}

export function PageTitle({ title, sub, backURL }: Props) {

    return (
        <Box pt={3} pb={3} className="page-title">
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
                <Typography component="h2" variant="h6">
                    {title}
                </Typography>
                {sub && <span className="sub">{sub}</span>}
            </Box>
        </Box>
    )
}
