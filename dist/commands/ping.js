import { client, registerCustomInteractions, } from "../index.js";
import { MessageButton, MessageActionRow, Message, } from "discord.js";
import { Command } from "../command.js";
import { stripIndents as $ } from "common-tags";
import { bold } from "@discordjs/builders";
const refreshButton = new MessageActionRow().addComponents(new MessageButton()
    .setCustomId("custom/ping:refresh")
    .setLabel("Refresh")
    .setStyle("PRIMARY")
    .setEmoji("🔁"));
function ping(e) {
    e.message.reply({
        content: $ `
      :ping_pong: ${bold("Pong!")}
      Websocket heartbeat: ${client.ws.ping}ms
    `,
        components: [refreshButton],
    });
}
async function refreshInteractionHandler(interaction) {
    if (!(interaction.message instanceof Message)) {
        const reason = `Received an interaction from a server that the bot is not present in`;
        const content = $ `
      :x: ${bold("Interaction failed")} (${reason})

      Possible causes:
        - Incorrect scopes specified when inviting the bot
        - Clicking a button from a bot message after the bot has left the server
        - Some Discord API change (create a GH issue to fix the)
    `;
        return await interaction.reply({ content, ephemeral: true });
    }
    interaction.message.edit({
        content: $ `
              :ping_pong: ${bold("Pong!")}
              Websocket heartbeat: ${client.ws.ping}ms
            `,
        components: [refreshButton],
    });
}
const refreshInteraction = {
    id: "ping:refresh",
    type: "button",
    handler: refreshInteractionHandler,
};
registerCustomInteractions([refreshInteraction]);
export default new Command({
    name: "ping",
    id: "ping",
    handler: ping,
});
//# sourceMappingURL=ping.js.map