import { config } from "dotenv";
config();
import Discord from "discord.js";
const client = new Discord.Client();
const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);
const arrowRight = "**\u2192**";
const registry = {
    commands: new Map(),
};
let commandNameCache = new Map();
function createCache(data, options) {
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
function validNamespacedId(value) {
    const validChars = /[a-z0-9_:]/g;
    if (value.replace(validChars, "") === "") {
        return true;
    }
    return false;
}
function prefixedCommand(command, args = [], wrap = "") {
    const joinedArgs = args.join(" ");
    if (wrap)
        return wrap + prefix + command + " " + joinedArgs + wrap;
    return prefix + command + " " + joinedArgs;
}
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
class Command {
    constructor(name, id, handler, params = [], shortDesc, desc, parent) {
        this.name = name;
        this.params = params;
        this.id = id;
        this.handler = handler;
        this.desc = desc;
        this.shortDesc = shortDesc;
        this.parent = parent;
        this.callback =
            typeof handler === "function" ? handler : handleOverloadedCommand;
        if (name.length > 16) {
            throw new Error("Command name lengths must be below 16 characters");
        }
        if (!validNamespacedId(id)) {
            throw new Error("Namespaced IDs must only contain characters a-z, 0-9, _ or :");
        }
        if (typeof handler === "function" && handler.length > 1) {
            throw new Error("Command callbacks should only take one parameter");
        }
        if (shortDesc && /\n/.test(shortDesc)) {
            throw new Error("Short descriptions cannot contain line breaks. Move details to the extended description.");
        }
        if (name.toLowerCase() !== name) {
            throw new Error("Command names should be lowercase");
        }
        if (typeof handler !== "function") {
            let parameterCounts = [];
            handler.forEach((stub) => {
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
        super("", id, handler, params, undefined, desc);
    }
}
class HelpCommand extends Command {
    constructor() {
        super("help", "_help", ({ message }) => {
            let longestCmd = 0;
            registry.commands.forEach((cmd) => {
                if (cmd.name.length > longestCmd)
                    longestCmd = cmd.name.length;
            });
            let output = "**Commands:**\n```yaml\n";
            registry.commands.forEach((cmd) => {
                const extraSpaces = " ".repeat(longestCmd - cmd.name.length);
                if (!cmd.shortDesc && cmd.desc) {
                    output += `${cmd.name}${extraSpaces} # Type ${prefixedCommand("help", [cmd.name])}\n`;
                }
                if (!cmd.shortDesc) {
                    output += `${cmd.name}${extraSpaces} # No description\n`;
                    return;
                }
                output += `${cmd.name}${extraSpaces} - ${cmd.shortDesc}\n`;
            });
            output += "```";
            message.reply(output);
        }, [
            {
                name: "command",
                optional: true,
            },
        ], "Displays a list of all available commands");
    }
}
function registerCommands(commands) {
    for (const command of commands) {
        registry.commands.set(command.id, command);
    }
    let newCommands = [];
    registry.commands.forEach((command) => {
        newCommands.push(command);
    });
    commandNameCache = createCache(newCommands, {
        key: "name",
        value: "id",
    });
}
registerCommands([new HelpCommand()]);
{
    registerCommands([]);
}
client.on("ready", () => {
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}`);
        return;
    }
    console.error("There is no user!");
});
client.on("message", async (msg) => {
    if (!msg.content.match(prefixRegex))
        return;
    const splitCmd = msg.content.split(" ");
    const commandName = splitCmd[0].replace(prefixRegex, "").toLowerCase();
    const params = splitCmd.slice(1);
    const commandId = commandNameCache.get(commandName);
    if (!commandId)
        return;
    const command = registry.commands.get(commandId);
    if (!command)
        throw new Error("Could not find command with ID of " + commandId);
    let minParams = 0;
    if (command.params) {
        command.params.forEach((param) => {
            if (!param.optional) {
                minParams++;
            }
        });
    }
    if (command.params && params.length < minParams) {
        msg.channel.send(`\
:x: **Missing one or more required parameters**
Expected ${minParams} parameter(s) but got ${params.length}.

${arrowRight} Type ${prefixedCommand("help", [command.name], "`")} \
to view command help.`);
        return;
    }
    command.callback({ params, message: msg, command });
});
client.login(process.env.DISCORD_TOKEN);
//# sourceMappingURL=index.js.map