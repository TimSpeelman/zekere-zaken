import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { default as React, PropsWithChildren } from "react";

interface Props {
    heightOverWidth: number,
    style?: CSSProperties
}

export function AspectRatio({ heightOverWidth, style, children }: PropsWithChildren<Props>) {
    const containerStyle: CSSProperties = {
        width: "100%",
        paddingTop: heightOverWidth * 100 + "%",
        position: "relative",
        ...style,
    }

    const contentStyle: CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    }


    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                {children}
            </div>
        </div>
    );
}

