import { commands, lookupCommandName } from "./command.js";
import { Registry } from "./util.js";
import Discord, { Intents, } from "discord.js";
import { stripIndents as $ } from "common-tags";
import { inlineCode } from "@discordjs/builders";
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS);
export const client = new Discord.Client({
    intents,
    partials: ["CHANNEL"],
    allowedMentions: {
        repliedUser: false,
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
const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);
const arrowRight = "**\u2192**";
export const customInteractions = new Registry();
const contextHelper = {
    client: () => client,
    commandRegistry: () => commands,
    customInteractionRegistry: () => customInteractions,
    prefix: () => prefix,
};
client.on("ready", () => {
    if (client.user) {
        console.log(`Logged in as ${client.user.tag}`);
        return;
    }
    console.error("There is no user!");
});
client.on("messageCreate", async (msg) => {
    if (!msg.content.match(prefixRegex))
        return;
    const splitCmd = msg.content.split(" ");
    const commandName = splitCmd[0].replace(prefixRegex, "").toLowerCase();
    const params = splitCmd.slice(1);
    const command = lookupCommandName(commandName);
    if (!command)
        return;
    let minParams = 0;
    if (command.params) {
        command.params.forEach((param) => {
            if (!param.optional) {
                minParams++;
            }
        });
    }
    if (command.params && params.length < minParams) {
        msg.channel.send($ `
      :x: **Missing one or more required parameters**
      Expected ${minParams} parameter(s) but got ${params.length}.

      ${arrowRight} Type ${inlineCode(`${prefix}help ${command.name}`)} \
      to view command help.
    `);
        return;
    }
    command.callback({ params, message: msg, command, context: contextHelper });
});
//# sourceMappingURL=index.js.map