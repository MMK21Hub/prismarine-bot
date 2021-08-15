import { plugin, Command, registerCommands, client } from "../index"

const ping: plugin = {
  metadata: {
    enabledByDefault: true,
    scopes: ["script"],
    pluginFormat: 1,
  },
  events: {
    load: () => {
      registerCommands([
        new Command({
          name: "ping",
          id: "ping",
          handler: async (e) => {
            const {
              MessageActionRow,
              MessageButton,
              ApplicationCommandPermissionsManager,
            } = await import("discord.js")
            const { bold } = await import("@discordjs/builders")
            const { stripIndents: $ } = await import("common-tags")

            const button = new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId("custom/ping:refresh")
                .setLabel("Refresh")
                .setStyle("PRIMARY")
                .setEmoji("🔁")
            )

            e.message
              .reply({
                content: $`
                  :ping_pong: ${bold("Pong!")}
                  Websocket heartbeat: ${client.ws.ping}ms
                `,
                components: [button],
              })
              .then((msg) => {
                const roundtrip =
                  msg.createdTimestamp - e.message.createdTimestamp
                msg.edit($`
                    ${msg.content}
                    API roundtrip: ${roundtrip}ms
                  `)
              })
          },
        }),
      ])
    },
  },
}

export default ping
