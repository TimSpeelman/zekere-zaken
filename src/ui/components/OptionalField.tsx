import Button from "@material-ui/core/Button";
import AddIcon from '@material-ui/icons/Add';
import { default as React, Fragment, PropsWithChildren, useState } from "react";

interface Props {
    label: string;
    open?: boolean;
}

export function OptionalField({ children, label, open }: PropsWithChildren<Props>) {
    const [isOpen, setOpen] = useState(open === true);
    return isOpen ? <Fragment>{children}</Fragment> : <Button startIcon={<AddIcon />} onClick={() => setOpen(true)}>{label}</Button>
}
