import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import { default as React } from "react";
import { BottomTools } from "../../components/BottomTools";
import { useStyles } from "../../styles";
import { AuthReqOutbox } from "../Authorizee/AuthReqOutbox";
import { AuthReqInbox } from "../Authorizer/AuthReqInbox";

interface Props {
    tab: "inbox" | "outbox"
}
const tabs = ["inbox", "outbox"];

export function Authorizations({ tab }: Props) {

    const classes = useStyles({});

    const tabIndex = tabs.indexOf(tab);

    const content = (tab === "inbox") ? <AuthReqInbox /> : <AuthReqOutbox />;

    const navTo = (index: number) => {
        window.location.assign(`#/authreqs/${tabs[index]}`);
    }

    return (
        <div>
            <Tabs value={tabIndex} onChange={(e, val) => navTo(val)} aria-label="simple tabs example">
                <Tab label="Inkomend" />
                <Tab label="Uitgaand" />
            </Tabs>
            {content}

            <BottomTools showQR plusURL={"#/authreqs/new"} />
        </div>
    );
}
