import { Client, Message } from "discord.js";
import { customInteraction } from "./interaction.js";
import { Registry } from "./util.js";
export interface commandOptions {
    name: string;
    id: string;
    handler: commandCallback | StubCommand[];
    params?: commandParam[];
    shortDesc?: string;
    desc?: string;
    parent?: string;
}
export interface commandEvent {
    message: Message;
    params: string[];
    command: Command;
    context: contextHelper;
}
export interface commandParam {
    name: string;
    optional?: boolean;
}
export declare type commandCallback = (e: commandEvent) => void;
export interface contextHelper {
    commandRegistry: () => Registry<Command>;
    customInteractionRegistry: () => Registry<customInteraction>;
    prefix: () => string;
    client: () => Client;
}
export declare const commands: Registry<Command>;
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
export declare function lookupCommandName(name: string): null | Command;
export {};
