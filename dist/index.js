import { config } from "dotenv";
config();
import Discord from "discord.js";
const client = new Discord.Client();
const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);
const registry = {
    commands: new Map(),
};
const commandNameCache = new Map();
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
    constructor(name, id, callback, params = 0) {
        this.name = name;
        this.params = params;
        this.id = id;
        this.callback = callback;
        if (name.length > 16) {
            throw new Error("Command name lengths must be below 16 characters");
        }
        if (!validNamespacedId(id)) {
            throw new Error("Namespaced IDs must only contain characters a-z, 0-9, _ or :");
        }
        if (callback.length > 1) {
            throw new Error("Command callbacks can only take up to one parameter");
        }
    }
}
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
    const splitCmd = msg.content.split(" ", 1);
    const command = splitCmd[0].replace(prefixRegex, "");
    console.log(`${msg.author.username} sent the ${command} command!`);
});
client.login(process.env.DISCORD_TOKEN);
//# sourceMappingURL=index.js.map