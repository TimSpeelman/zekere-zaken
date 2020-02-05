import { IconButton } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Paper from '@material-ui/core/Paper';
import DeleteIcon from '@material-ui/icons/Delete';
import QRCode from "qrcode.react";
import { default as React } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useParams } from "react-router-dom";
import { RemoveVReqTemplate } from "../../../commands/Command";
import { useStyles } from "../../../styles";
import { last } from "../../../util/last";
import { AspectRatio } from "../../components/AspectRatio";
import { AuthorityCard } from "../../components/AuthorityCard";
import { FormActions } from "../../components/FormActions";
import { PageTitle } from "../../components/PageTitle";
import { useCommand } from "../../hooks/useCommand";
import { useLocalState } from "../../hooks/useLocalState";
import { useSelector } from "../../hooks/useSelector";
import { selectOutVerReqByTemplateId } from "../../selectors/selectOutVerReqs";
import { selectProfileById } from "../../selectors/selectProfile";

export function OutgoingVerifReq() {
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

    const qrValue = !req ? "" : JSON.stringify({ reference: req.id, senderId: myId });

    const deleteItem = () => {
        if (req) {
            dispatch(RemoveVReqTemplate({ templateId: req.id }))
            window.location.assign("#/verifs/outbox");
        }
    }

    return !req ? <div>Dit verzoek bestaat niet. </div> : (
        <div>
            <PageTitle
                title={"Verifiëren"}
                sub={"Toon de QR aan de persoon die u wilt controleren"}
                onQuit={() => window.location.assign("#/home")}
            />

            <Paper className={classes.paper} style={{ marginBottom: 12 }}>
                <CopyToClipboard text={qrValue} onCopy={() => console.log("Copied to clipboard:", qrValue)}>
                    <AspectRatio heightOverWidth={1}>
                        <QRCode value={qrValue} size={256} level={"M"} style={{ width: "100%", height: "100%" }} />
                    </AspectRatio>
                </CopyToClipboard>
            </Paper>

            <AuthorityCard legalEntity={lastCompleted ? lastCompleted.spec.legalEntity : req.legalEntity}
                authority={lastCompleted ? lastCompleted.spec.authority : req.authority} authType="verification" />

            <FormActions>
                <IconButton onClick={deleteItem} color="inherit"><DeleteIcon /></IconButton>

                <Button color="inherit" component="a" href="#/home">Sluiten</Button>
            </FormActions>
        </div>
    );
}
