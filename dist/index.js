import { config } from "dotenv";
config();
import Discord from "discord.js";
const client = new Discord.Client();
import https from "https";
import hash from "murmurhash";
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
class Command {
    constructor(name, id, handler, params = [], shortDesc, desc, type = "command", parent) {
        this.name = name;
        this.params = params;
        this.id = id;
        this.handler = handler;
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
        if (handler.length > 1) {
            throw new Error("Command callbacks should only take one parameter");
        }
        if (shortDesc && /\n/.test(shortDesc)) {
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
    let newCommands = [];
    registry.commands.forEach((command) => {
        newCommands.push(command);
    });
    commandNameCache = createCache(newCommands, {
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
    }, [
        {
            name: "command",
            optional: true,
        },
    ], "Displays a list of all available commands", undefined, "help"),
]);
{
    const threadRolloutStatus = new Command("threads", "thread_rollout_status", (e) => {
        if (e.params) {
            const server = e.params[0];
            const threadRolloutPercentage = 25;
            if (!/\d{18}/.test(server)) {
                e.message.reply(`:x: "${server}" doesn't look like a server ID.`);
            }
            const result = hash(`2020-09_threads:${server}`) % 1e4 <
                threadRolloutPercentage * 100;
            return e.message.reply(result
                ? "That server has access to threads :tada:"
                : "That server does not access to threads :pensive:");
        }
        https.get("https://threads-rollout.advaith.workers.dev/", (res) => {
            res.on("data", (data) => {
                e.message.reply(`Threads have been rolled out to ${data} of servers!`);
            });
        });
    }, [
        {
            name: "server",
            optional: true,
        },
    ], "Gets the percentage of servers that have access to threads", `\
Gets the percentage of servers that have access to threads.
Threads are currently (as of 27 July) in early-access mode for selected servers.
If they have community options enabled, they can opt-in to enable threads before they roll out fully on 17 August.
This command lets you easily see how many servers are part of the rollout so far.

**Usage:**
Get rollout percentage: ${prefixedCommand("threads", [], "`")}
Check if a server is enrolled: \
${prefixedCommand("threads", ["<Server ID>"], "`")}

**Credits:**
Thanks to advaith for providing a thread rollout API for us all to use, \
and for cracking the formula to check if a server has been enrolled yet.
${arrowRight} https://advaith.io/`);
    registerCommands([threadRolloutStatus]);
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
    if (params.length < minParams) {
        msg.channel.send(`\
:x: **Missing one or more required parameters**
Expected ${minParams} parameter(s) but got ${params.length}.

${arrowRight} Type ${prefixedCommand("help", [command.name], "`")} \
to view command help.`);
        return;
    }
    command.handler({ params, message: msg });
});
client.login(process.env.DISCORD_TOKEN);
//# sourceMappingURL=index.js.map