import { PrismarineClient } from "./util.js";
import { Intents } from "discord.js";
import { commands } from "./command.js";
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS);
export const client = new PrismarineClient({
    intents,
    partials: ["CHANNEL"],
    allowedMentions: {
        repliedUser: false,
    },
    botOptions: {
        defaultPrefix: "p!",
    },
});
import("dotenv").then(async ({ config }) => {
    const err = config().error;
    if (err)
        throw err;
    client.login(process.env.DISCORD_TOKEN);
    const { default: importedCommands } = await import("./commands/index.js");
    commands.register(importedCommands);
});
export const prefix = "p!";
client.on("ready", () => {
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}`);
        return;
    }
    console.error("There is no user!");
});
//# sourceMappingURL=main.js.map