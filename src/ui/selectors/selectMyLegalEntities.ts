import { IState, LegalEntityAttestation } from "../../types/State";

export function selectMyLegalEntities(state: IState): LegalEntityAttestation[] {
    return state.myLegalEntities;
}

export function selectMyLegalEntityById(id: string) {
    return (state: IState) => selectMyLegalEntities(state).find(a => a.id === id);
}
