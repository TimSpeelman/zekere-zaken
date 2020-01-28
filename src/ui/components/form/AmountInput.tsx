import { InputAdornment, TextField } from "@material-ui/core";
import { default as React } from "react";

interface Props {
    value: number,
    onChange: (entity: number) => void;
    helperText?: string;
}

export function AmountInput({ value, onChange, helperText }: Props) {
    return (
        <TextField
            label={"Bedrag"}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            helperText={helperText}
            type={"number"}
            InputProps={{
                startAdornment: <InputAdornment position="start">€</InputAdornment>
            }}
            fullWidth />
    );
}
