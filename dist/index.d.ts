import { Client, Message, Interaction, ButtonInteraction } from "discord.js";
export declare const client: Client;
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
declare type commandCallback = (e: commandEvent) => void;
export interface plugin {
    metadata: pluginMetadata;
    events?: {
        load?: () => void;
        unload?: () => void;
        firstLoad?: () => void;
        upgrade?: (from: string, to: string) => void;
    };
}
declare type pluginScope = "command" | "custom-interaction" | "script";
interface pluginMetadata {
    enabledByDefault: boolean;
    scopes: pluginScope[];
    pluginFormat: 1;
    searchTags?: string[];
    friendlyName?: string;
    description?: string;
    version?: string;
}
declare type interactionSource = "button" | "context-menu" | "slash-command" | "select-menu" | "context-menu";
declare type customInteraction = customButtonInteraction | customOtherInteraction;
export interface customButtonInteraction {
    id: string;
    type: "button";
    handler: (interaction: ButtonInteraction) => void;
}
interface customOtherInteraction {
    id: string;
    type: interactionSource;
    handler: (interaction: Interaction) => void;
}
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
export declare function registerCustomInteractions(interactions: customInteraction[]): void;
export {};
