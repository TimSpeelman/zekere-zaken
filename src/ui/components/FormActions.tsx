import { Box } from "@material-ui/core";
import { default as React, PropsWithChildren } from "react";

export function FormActions({ children }: PropsWithChildren<{}>) {

    return (
        <Box pb={2} pt={2} style={{ display: "flex", justifyContent: "space-between" }}>
            {children}
        </Box>
    );
}

