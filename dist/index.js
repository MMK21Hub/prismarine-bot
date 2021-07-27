import { config } from "dotenv";
config();
import Discord from "discord.js";
const client = new Discord.Client();
const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);
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
class Command {
    constructor(name, id, callback, params = 0, shortDesc, desc, type = "command", parent) {
        this.name = name;
        this.params = params;
        this.id = id;
        this.callback = callback;
        this.desc = desc;
        this.shortDesc = shortDesc;
        this.type = type;
        this.parent = parent;
        if (name.length > 16) {
            throw new Error("Command name lengths must be below 16 characters");
        }
        if (!validNamespacedId(id)) {
            throw new Error("Namespaced IDs must only contain characters a-z, 0-9, _ or :");
        }
        if (callback.length > 1) {
            throw new Error("Command callbacks should only take one parameter");
        }
        if (shortDesc && shortDesc.search("\n")) {
            throw new Error("Short descriptions cannot contain line breaks. Move details to the extended description.");
        }
        if (name.toLowerCase() !== name) {
            throw new Error("Command names should be lowercase");
        }
    }
}
function registerCommands(commands) {
    for (const command of commands) {
        registry.commands.set(command.id, command);
    }
    commandNameCache = createCache(commands, {
        key: "name",
        value: "id",
    });
}
registerCommands([
    new Command("help", "_help", ({ message }) => {
        let output = "**Commands:**\n```yaml\n";
        registry.commands.forEach((cmd) => {
            if (!cmd.shortDesc && cmd.desc) {
                output += `${cmd.name} # Type "${prefix}help ${cmd.name}"\n`;
            }
            if (!cmd.shortDesc) {
                output += `${cmd.name} # No description\n`;
                return;
            }
            output += `${cmd.name} - ${cmd.shortDesc}\n`;
        });
        output += "```";
        message.reply(output);
    }, 1, "Displays a list of all available commands", undefined, "help"),
]);
client.on("ready", () => {
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}`);
        return;
    }
    console.error("There is no user!");
});
client.on("message", (msg) => {
    if (!msg.content.match(prefixRegex))
        return;
    const splitCmd = msg.content.split(" ");
    const commandName = splitCmd[0].replace(prefixRegex, "").toLowerCase();
    const args = splitCmd.slice(1);
    const commandId = commandNameCache.get(commandName);
    if (!commandId)
        return;
    const command = registry.commands.get(commandId);
    if (!command)
        throw new Error("Could not find command with ID of " + commandId);
    command.callback({ args, message: msg });
});
client.login(process.env.DISCORD_TOKEN);
//# sourceMappingURL=index.js.map