import { IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import DeleteIcon from '@material-ui/icons/Delete';
import QRCode from "qrcode.react";
import { default as React, useEffect, useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import { RemoveVReqTemplate } from "../../../commands/Command";
import { useStyles } from "../../../styles";
import { authorityShort } from "../../../util/intl";
import { last } from "../../../util/last";
import { AspectRatio } from "../../components/AspectRatio";
import { AuthorityCard } from "../../components/AuthorityCard";
import { Badge } from "../../components/Badge";
import { FormActions } from "../../components/FormActions";
import { PageTitle } from "../../components/PageTitle";
import { useCommand } from "../../hooks/useCommand";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { selectOutVerReqByTemplateId } from "../../selectors/selectOutVerReqs";
import { selectProfileById } from "../../selectors/selectProfile";

type Mode = "idle" | "pending" | "succeeded" | "failed";

interface Props {
    onMoodChange: (val: Mode) => void; // Ugly way of changing the background
}

export function OutgoingVerifReq({ onMoodChange }: Props) {
    const classes = useStyles({});
    const { reqId: id } = useParams();
    const { dispatch } = useCommand();
    const { state } = useLocalState();
    const myId = state.myId;

    const outReq = useSelector(id ? selectOutVerReqByTemplateId(id) : undefined);
    const req = outReq?.template;
    const completedTransactions = outReq?.transactions;
    const lastCompleted = last(completedTransactions);
    const lastVerifiee = useSelector(lastCompleted ? selectProfileById(lastCompleted.subjectId) : undefined);
    const getProfile = (subjectId: string) => {
        const p = state.profiles[subjectId];
        return (p && p.status === "Verified") ? p.profile : undefined;
    }

    const qrValue = !req ? "" : JSON.stringify({ reference: req.id, senderId: myId });

    useEffect(() => { if (!!lastCompleted) { setMode("succeeded") } }, [lastCompleted]);

    const deleteItem = () => {
        if (req) {
            dispatch(RemoveVReqTemplate({ templateId: req.id }))
            window.location.assign("#/verifs/outbox");
        }
    }

    const [mode, setMode] = useState<Mode>("idle");
    useEffect(() => onMoodChange(mode), [mode]);

    const subtitles: { [k in Mode]: string } = {
        idle: "Toon de QR aan de persoon die u wilt controleren",
        pending: "Bezig met bewijs controleren..",
        succeeded: "Geslaagd!",
        failed: "Er ging iets fout..",
    }

    const isIdle = mode === "idle";
    const isPending = mode === "pending";
    const isSucceeded = mode === "succeeded";
    const isFailed = mode === "failed";

    return !req ? <div>Dit verzoek bestaat niet. </div> : (
        <CSSTransition
            in={true}
            appear={true}
            timeout={{ appear: 1000, enter: 100, exit: 1 }}
            classNames={"items"}
        >
            <div>
                <PageTitle
                    title={"Verifiëren"}
                    sub={subtitles[mode]}
                    onQuit={() => window.location.assign("#/home")}
                />

                {isIdle && (
                    <div>
                        <div className={"enter-item delay-2"}>
                            <Paper className={classes.paper} style={{ marginBottom: 12 }}>
                                <AspectRatio heightOverWidth={1}>
                                    <QRCode value={qrValue} size={256} level={"M"} style={{ width: "100%", height: "100%" }} />
                                </AspectRatio>
                            </Paper>
                        </div>

                        <CopyToClipboard text={qrValue} onCopy={() => console.log("Copied to clipboard:", qrValue)}>
                            <div className={"enter-item delay-4"}>
                                <AuthorityCard legalEntity={req.legalEntity}
                                    authority={req.authority} authType="verification" />
                            </div>
                        </CopyToClipboard>

                        <FormActions>
                            <IconButton onClick={deleteItem} color="inherit"><DeleteIcon /></IconButton>

                            <Button color="inherit" component="a" href="#/home">Sluiten</Button>
                        </FormActions>
                    </div>
                )}

                {isSucceeded && lastCompleted && (

                    <div>
                        <Badge
                            profile={getProfile(lastCompleted.subjectId)!}
                            body={
                                <div>
                                    <p>Bevoegd voor:</p>
                                    <p className="primary">{authorityShort(lastCompleted.spec.authority)}</p>
                                    <p className="">namens {lastCompleted.spec.legalEntity.name}</p>
                                </div>
                            }
                        />

                        <FormActions>

                            <Button color="inherit" component="a" href="#/home">Sluiten</Button>
                        </FormActions>
                    </div>

                )}

            </div>
        </CSSTransition>
    );
}
