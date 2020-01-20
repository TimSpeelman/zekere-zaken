import { Divider } from "@material-ui/core";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { default as React, Fragment } from "react";
import { BottomTools } from "../components/BottomTools";

export function Home() {

    const items = [
        { path: "#/verifs/new", label: "Verifiëren", sub: "Controleer iemand anders" },
        { path: "#/authreqs/outbox", label: "Mijn Bevoegdheden", sub: "Beheer, deel, vraag aan." },
        { path: "#/authreqs/inbox", label: "Machtigingen", sub: "Machtig derden namens uw organisatie(s)." },
    ]

    return (
        <div>
            <List component="nav" >
                {items.map(item => (
                    <Fragment key={item.path}>
                        <ListItem button component="a" href={item.path}>
                            <ListItemText primary={item.label} secondary={item.sub} />
                        </ListItem>
                        <Divider />
                    </Fragment>
                ))}
            </List>

            <BottomTools showQR />
        </div>
    );
}
