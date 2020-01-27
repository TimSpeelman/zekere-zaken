import { UserCommand } from "../../../commands/Command";
import { Me } from "../../../shared/Agent";
import { Profile } from "../../../types/State";
import { Hook } from "../../../util/Hook";

export interface IdentityGatewayInterface {

    me?: Me;

    connect(): Promise<Me>;

    verifiedProfileHook: Hook<{ peerId: string, profile: Profile }>;

    dispatch(command: UserCommand): void;
}
