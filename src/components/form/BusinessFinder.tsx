import TextField from '@material-ui/core/TextField';
import Autocomplete from "@material-ui/lab/Autocomplete";
import { default as React, useState } from "react";
import { businesses } from "../../dummy";
import { LegalEntity } from "../../types/State";

interface Props {
    onSelect: (entity: LegalEntity) => void;
}

export function BusinessFinder({ onSelect }: Props) {
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
                    helperText={"Namens welke organisatie moet de persoon bevoegd zijn?"}
                    fullWidth />
            )}
            value={selectedBusiness}
            options={businesses}
            onChange={handleSelect}
            noOptionsText={"Typ om te zoeken"}
        />
    );
}
