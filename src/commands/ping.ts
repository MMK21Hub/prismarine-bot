// prettier-ignore
// @ts-nocheck
import { Command, registerCommands, client, registerCustomInteractions, customButtonInteraction } from "../index.ts"
import { MessageButton, MessageActionRow } from "discord.js"

export const refreshButton = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId("custom/ping:refresh")
    .setLabel("Refresh")
    .setStyle("PRIMARY")
    .setEmoji("🔁")
)

const ping = {
  metadata: {
    enabledByDefault: true,
    scopes: ["script"],
    pluginFormat: 1,
  },
  events: {
    load: () => {
      const refreshInteraction: customButtonInteraction = {
        id: "ping:refresh",
        type: "button",
        handler: async (interaction) => {
          const { bold } = await import("@discordjs/builders")
          const { stripIndents: $ } = await import("common-tags")
          const { Message } = await import("discord.js")
          const { refreshButton } = await import("./ping")

          if (!(interaction.message instanceof Message)) {
            const reason = `Received an interaction from a server that the bot is not present in`
            const content = $`
              :x: ${bold("Interaction failed")} (${reason})

              Possible causes:
               - Incorrect scopes specified when inviting the bot
               - Clicking a button from a bot message after the bot has left the server
               - Some Discord API change (create a GH issue to fix the)
            `
            return await interaction.reply({ content, ephemeral: true })
          }

          console.log("Here!")

          interaction.message.edit({
            content: $`
              :ping_pong: ${bold("Pong!")}
              Websocket heartbeat: ${client.ws.ping}ms
            `,
            components: [refreshButton],
          })
        },
      }

      registerCustomInteractions([refreshInteraction])

      registerCommands([
        new Command({
          name: "ping",
          id: "ping",
          handler: async (e) => {
            const { bold } = await import("@discordjs/builders")
            const { stripIndents: $ } = await import("common-tags")
            const { refreshButton } = await import("./ping")

            e.message.reply({
              content: $`
                  :ping_pong: ${bold("Pong!")}
                  Websocket heartbeat: ${client.ws.ping}ms
                `,
              components: [refreshButton],
            })
          },
        }),
      ])
    },
  },
}

export default ping
