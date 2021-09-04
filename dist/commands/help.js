import { Command } from "../command.js";
export default new Command({
    name: "help",
    id: "help",
    params: [
        {
            name: "command",
            optional: true,
        },
    ],
    handler: ({ message, context }) => {
        const reg = context.commandRegistry();
        let longestCmd = 0;
        reg.forEach((cmd) => {
            if (cmd.name.length > longestCmd)
                longestCmd = cmd.name.length;
        });
        let output = "**Commands:**\n```yaml\n";
        reg.forEach((cmd) => {
            const extraSpaces = " ".repeat(longestCmd - cmd.name.length);
            if (!cmd.shortDesc && cmd.desc) {
                const helpRef = `${context.prefix()}help ${cmd.name}`;
                output += `${cmd.name}${extraSpaces} # Type ${helpRef}\n`;
            }
            if (!cmd.shortDesc) {
                output += `${cmd.name}${extraSpaces} # No description\n`;
            }
            output += `${cmd.name}${extraSpaces} - ${cmd.shortDesc}\n`;
        });
        output += "```";
        message.reply(output);
    },
});
//# sourceMappingURL=help.js.map