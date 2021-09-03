import { MessageActionRow } from "discord.js";
export declare const refreshButton: MessageActionRow;
declare const ping: {
    metadata: {
        enabledByDefault: boolean;
        scopes: string[];
        pluginFormat: number;
    };
    events: {
        load: () => void;
    };
};
export default ping;
