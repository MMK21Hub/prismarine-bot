import { Client } from "discord.js";
import { prefix } from "./main.js";
export function createCache(data, options) {
    const cache = new Map();
    let index = 0;
    for (const item of data) {
        if (!item[options.key] || !item[options.value]) {
            throw new Error(`Found an object (index ${index}) that does not have a property that can be used as a key/value`);
        }
        cache.set(item[options.key], item[options.value]);
        index++;
    }
    return cache;
}
export function validNamespacedId(value) {
    const validChars = /[a-z0-9_:]/g;
    if (value.replace(validChars, "") === "") {
        return true;
    }
    return false;
}
export function prefixedCommand(command, args = [], wrap = "") {
    const joinedArgs = args.join(" ");
    if (wrap)
        return wrap + prefix + command + " " + joinedArgs + wrap;
    return prefix + command + " " + joinedArgs;
}
export class Registry extends Map {
    constructor(postRegister) {
        super();
        this.postRegister = postRegister;
        this.register = (items, key = "id") => {
            if (!Array.isArray(items))
                items = [items];
            for (const item of items) {
                if (typeof item !== "object") {
                    throw new Error("Each item passed to register() must be an object.");
                }
                if (!item.hasOwnProperty(key)) {
                    throw new Error("Found item passed to register() that does not contain specified key: " +
                        key);
                }
                this.set(item[key], item);
            }
            this.postRegister?.(this, items);
        };
    }
}
export var characters;
(function (characters) {
    characters["ARROW_LEFT"] = "\u2190";
    characters["ARROW_RIGHT"] = "\u2192";
    characters["ARROW_UP"] = "\u2191";
    characters["ARROW_DOWN"] = "\u2193";
})(characters || (characters = {}));
export class PrismarineClient extends Client {
    constructor(options) {
        super(options);
        this.botOptions = options.botOptions;
    }
}
//# sourceMappingURL=util.js.map