import { Client, ClientOptions } from "discord.js";
export declare function createCache(data: any[], options: {
    key: string;
    value: string;
}): Map<any, any>;
export declare function validNamespacedId(value: string): boolean;
export declare function prefixedCommand(command: string, args?: string[], wrap?: string): string;
declare type postRegisterCallback<T extends anyObject> = (registry: Registry<T>, items: T[]) => void;
export declare type anyObject = {
    [key: string]: any;
};
export declare class Registry<T extends anyObject> extends Map<string, T> {
    register: (items: T[] | T, key?: string) => void;
    private postRegister?;
    constructor(postRegister?: postRegisterCallback<T>);
}
export declare enum characters {
    ARROW_LEFT = "\u2190",
    ARROW_RIGHT = "\u2192",
    ARROW_UP = "\u2191",
    ARROW_DOWN = "\u2193"
}
interface discordBotOptions {
    defaultPrefix?: string;
}
interface prismarineClientOptions extends ClientOptions {
    botOptions: discordBotOptions;
}
export declare class PrismarineClient extends Client {
    botOptions: discordBotOptions;
    constructor(options: prismarineClientOptions);
}
export {};
