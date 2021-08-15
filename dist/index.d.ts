import { Message } from "discord.js";
export interface commandOptions {
    name: string;
    id: string;
    handler: commandCallback | StubCommand[];
    params?: commandParam[];
    shortDesc?: string;
    desc?: string;
    parent?: string;
}
interface commandEvent {
    message: Message;
    params: string[];
    command: Command;
}
interface commandParam {
    name: string;
    optional?: boolean;
}
export interface plugin {
    metadata: pluginMetadata;
    events?: {
        load?: () => void;
        unload?: () => void;
        firstLoad?: () => void;
        upgrade?: (from: string, to: string) => void;
    };
}
declare type pluginScope = "command" | "script";
interface pluginMetadata {
    enabledByDefault: boolean;
    scopes: pluginScope[];
    pluginFormat: 1;
    searchTags?: string[];
    friendlyName?: string;
    description?: string;
    version?: string;
}
declare type commandCallback = (e: commandEvent) => void;
export declare class Command {
    name: string;
    params: commandParam[];
    id: string;
    handler: commandCallback | StubCommand[];
    parent: string | undefined;
    shortDesc: string | undefined;
    desc: string | undefined;
    callback: commandCallback;
    constructor(options: commandOptions);
}
declare class StubCommand extends Command {
    constructor(id: string, handler: commandCallback, params?: commandParam[], desc?: string);
}
export declare function registerCommands(commands: Command[]): void;
export {};
