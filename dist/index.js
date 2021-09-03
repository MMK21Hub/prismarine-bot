import { commands } from "./command.js";
import Discord, { Intents, } from "discord.js";
import { stripIndents as $ } from "common-tags";
import { bold, inlineCode } from "@discordjs/builders";
const intents = new Intents();
intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS);
export const client = new Discord.Client({
    intents,
    partials: ["CHANNEL"],
    allowedMentions: {
        repliedUser: false,
    },
});
import("dotenv").then(({ config }) => {
    const err = config().error;
    if (err)
        throw err;
    client.login(process.env.DISCORD_TOKEN);
});
const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);
const arrowRight = "**\u2192**";
const customInteractions = new Map();
let commandNameCache = new Map();
const contextHelper = {
    client: () => client,
    commandRegistry: () => commands,
    customInteractionRegistry: () => customInteractions,
    prefix: () => prefix,
};
export function registerCustomInteractions(interactions) {
    for (const interaction of interactions) {
        customInteractions.set(interaction.id, interaction);
    }
}
function handleInteraction(i) {
    if (i.isButton())
        return handleButtonInteraction(i);
}
async function handleButtonInteraction(i) {
    const [actionType, handlerId] = i.customId.split("/");
    if (actionType === "custom") {
        const customInteraction = customInteractions.get(handlerId);
        if (!customInteraction) {
            let interactionSrc = "interaction";
            if (i.isButton())
                interactionSrc = "button";
            if (i.isCommand())
                interactionSrc = "slash command";
            if (i.isSelectMenu())
                interactionSrc = "selection";
            const reason = `Could not find a handler to match this ${interactionSrc}`;
            const content = $ `
        :x: ${bold("Interaction failed")} (${reason})

        Registered interaction handlers: ${customInteractions.size}
        Interaction ID: ${inlineCode(i.id)}
        Handler ID: ${inlineCode(handlerId)}
      `;
            return await i.reply({ content, ephemeral: true });
        }
        const handler = eval(customInteraction.handler.toString());
        handler(i);
    }
}
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
    const commandId = commandNameCache.get(commandName);
    if (!commandId)
        return;
    const command = commands.get(commandId);
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
client.on("interactionCreate", handleInteraction);
//# sourceMappingURL=index.js.map