import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@material-ui/core";
import { default as React } from "react";
import { KVKAuthorityType } from "../../types/State";

interface Props {
    value: KVKAuthorityType | null,
    onChange: (entity: KVKAuthorityType | null) => void;
    helperText?: string;
}

export function KVKAuthorityTypeSelect({ value, onChange, helperText }: Props) {
    return (
        <FormControl fullWidth>
            <InputLabel>Type Handeling</InputLabel>
            <Select
                value={value}
                fullWidth
                onChange={e => onChange(e.target.value as KVKAuthorityType)}
            >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                <MenuItem value={KVKAuthorityType.Inkoop}>Inkoop</MenuItem>
                <MenuItem value={KVKAuthorityType.Verkoop}>Verkoop</MenuItem>
                <MenuItem value={KVKAuthorityType.Garantie}>Garantie</MenuItem>
                <MenuItem value={KVKAuthorityType.Lease}>Lease</MenuItem>
                <MenuItem value={KVKAuthorityType.Financiering}>Financiering</MenuItem>
                <MenuItem value={KVKAuthorityType.Onderhoud}>Onderhoud</MenuItem>
                <MenuItem value={KVKAuthorityType.Software}>Software</MenuItem>
            </Select>
            {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );
}
