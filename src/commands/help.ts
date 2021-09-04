import { prefixedCommand } from "../util.js"
import { Command, commands } from "../command.js"

export default new Command({
  name: "help",
  id: "help",
  shortDesc: "Displays a list of all available commands",
  params: [
    {
      name: "command",
      optional: true,
    },
  ],
  handler: ({ message }) => {
    const reg = commands

    let longestCmd = 0
    reg.forEach((cmd) => {
      if (cmd.name.length > longestCmd) longestCmd = cmd.name.length
    })

    let output = "**Commands:**\n```yaml\n"

    reg.forEach((cmd) => {
      const extraSpaces = " ".repeat(longestCmd - cmd.name.length)

      if (!cmd.shortDesc && cmd.desc) {
        const helpRef = prefixedCommand("help", [cmd.name])
        output += `${cmd.name}${extraSpaces} # Type ${helpRef}\n`
        return
      }
      if (!cmd.shortDesc) {
        output += `${cmd.name}${extraSpaces} # No description\n`
        return
      }
      output += `${cmd.name}${extraSpaces} - ${cmd.shortDesc}\n`
    })

    output += "```"

    message.reply(output)
  },
})
