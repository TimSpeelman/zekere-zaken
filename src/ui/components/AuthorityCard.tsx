import { List, ListItem, ListItemText, Paper, Typography } from "@material-ui/core";
import { default as React } from "react";
import { useStyles } from "../../styles";
import { Authority, LegalEntity } from "../../types/State";
import { eur } from "../../util/eur";

interface Props {
    legalEntity?: LegalEntity;
    authority: Authority;
    title?: string;
}

export function AuthorityCard({ legalEntity, authority, title }: Props) {
    const classes = useStyles({});

    return (
        <Paper className={classes.paper} >
            {title &&
                <div className={classes.paperTitle}>
                    <Typography component="h2" variant="h6" color="inherit" noWrap>
                        {title}
                    </Typography>
                </div>
            }
            <List dense >

                <ListItem>
                    <ListItemText
                        primary={authority.type}
                        secondary={"Type Handeling"} />
                </ListItem>
                <ListItem >
                    <ListItemText
                        primary={eur(authority.amount)}
                        secondary={"Financiële Beperking"} />
                </ListItem>
            </List>

            {legalEntity && (
                <p>Namens <strong>{legalEntity.name}</strong> (KVK-nummer: <strong>{legalEntity.kvknr}</strong>),
        gevestigd te <strong>{legalEntity.address}</strong>.</p>
            )}
        </Paper>
    );
}

