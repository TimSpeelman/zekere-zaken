import TextField from '@material-ui/core/TextField';
import Autocomplete from "@material-ui/lab/Autocomplete";
import { default as React, useState } from "react";
import { businesses } from "../../dummy";
import { LegalEntity } from "../../types/State";

interface Props {
    onSelect: (entity: LegalEntity) => void;
    helperText?: string;
}

export function BusinessFinder({ onSelect, helperText }: Props) {
    const [selectedBusiness, setSelectedBusiness] = useState<LegalEntity | null>(null);

    const handleSelect = (e: any, val: LegalEntity) => {
        setSelectedBusiness(val);
        onSelect(val);
    }
    return (
        <Autocomplete
            getOptionLabel={(opt) => opt.name}
            renderInput={(params: any) => (
                <TextField
                    {...params}
                    placeholder={"Zoek op bedrijf of KVK-nummer"}
                    InputLabelProps={{ shrink: true }}
                    label={"Organisatie (optioneel)"}
                    helperText={helperText}
                    fullWidth />
            )}
            value={selectedBusiness}
            options={businesses}
            onChange={handleSelect}
            noOptionsText={"Typ om te zoeken"}
        />
    );
}
