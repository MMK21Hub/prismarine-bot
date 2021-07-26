import { config } from "dotenv";
config();
import Discord from "discord.js";
const client = new Discord.Client();
const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);
class Command {
    constructor(name, params) {
        this.name = name;
        this.params = params;
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