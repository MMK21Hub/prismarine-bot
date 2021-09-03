import { createCache, Registry, validNamespacedId } from "./util.js";
function handleOverloadedCommand(e) {
    if (typeof e.command.handler === "function") {
        e.command.callback(e);
        console.error("handleOverloadedCommand() was called on a non-overloaded command - something must have gone wrong");
        return;
    }
    e.command.handler.forEach((stub) => {
        if (stub.params.length === e.params.length) {
            stub.callback(e);
        }
    });
}
export const commands = new Registry((reg, items) => {
    let allCommands = [];
    reg.forEach((command) => {
        allCommands.push(command);
    });
    return createCache(allCommands, {
        key: "name",
        value: "id",
    });
});
export class Command {
    constructor(options) {
        this.name = options.name;
        this.params = options.params || [];
        this.id = options.id;
        this.handler = options.handler;
        this.desc = options.desc;
        this.shortDesc = options.shortDesc;
        this.parent = options.parent;
        this.callback =
            typeof options.handler === "function"
                ? options.handler
                : handleOverloadedCommand;
        if (options.name.length > 16) {
            throw new Error("Command name lengths must be below 16 characters");
        }
        if (!validNamespacedId(options.id)) {
            throw new Error("Namespaced IDs must only contain characters a-z, 0-9, _ or :");
        }
        if (typeof options.handler === "function" && options.handler.length > 1) {
            throw new Error("Command callbacks should only take one parameter");
        }
        if (options.shortDesc && /\n/.test(options.shortDesc)) {
            throw new Error("Short descriptions cannot contain line breaks. Move details to the extended description.");
        }
        if (options.name.toLowerCase() !== options.name) {
            throw new Error("Command names should be lowercase");
        }
        if (typeof options.handler !== "function") {
            let parameterCounts = [];
            options.handler.forEach((stub) => {
                if (parameterCounts.includes(stub.params.length)) {
                    throw new Error("Two or more stub commands with the same parameter count cannot be attached to a single command.");
                }
                parameterCounts.push(stub.params.length);
            });
        }
    }
}
class StubCommand extends Command {
    constructor(id, handler, params = [], desc) {
        super({
            name: "",
            id,
            handler,
            params,
            desc,
        });
    }
}
//# sourceMappingURL=command.js.map