import { plugin, Command, registerCommands } from "../index"

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
          handler: (e) => {
            e.message.reply("Pong!")
          },
        }),
      ])
    },
  },
}

export default ping
