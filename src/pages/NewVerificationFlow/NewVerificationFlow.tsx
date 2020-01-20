import { default as React, useState } from "react";
import uuid from "uuid/v4";
import { useLocalState } from "../../hooks/useLocalState";
import { Authority, LegalEntity } from "../../types/State";
import { SelectAuthority } from "./SelectAuthority";
import { SelectBusiness } from "./SelectBusiness";

export function NewVerificationFlow() {
    const [step, setStep] = useState(0);
    const [entity, setEntity] = useState<LegalEntity | null>(null);
    const { manager } = useLocalState();

    const handleSelectBusiness = (entity: LegalEntity) => {
        setEntity(entity);
        setStep(1);
    }

    const handleSelectAuth = (authority: Authority) => {
        if (entity) {
            console.log("Adding verification")
            const id = uuid();
            manager.addOutVerifReq({
                authority,
                datetime: new Date(),
                id: id,
                legalEntity: entity,
            });
            window.location.assign(`#/verifs/outbox/${id}`);
        }
    }

    const handleCancel = () => {
        window.location.assign("#/");
    }

    switch (step) {
        case 0: return (
            <SelectBusiness onSucceed={handleSelectBusiness} onCancel={handleCancel} />
        );

        case 1: return (
            <SelectAuthority onSucceed={handleSelectAuth} onCancel={handleCancel} />
        );

        default: return (
            <div>This should not happen.</div>
        )
    }
}
