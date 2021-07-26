// Initialization
import { config } from "dotenv";
config();
import { Client } from "discord.js";
import Discord from "discord.js";
const client: Client = new Discord.Client();

const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);

class Command {
  name: string;
  params: number;

  constructor(name: string, params: number) {
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
  if (!msg.content.match(prefixRegex)) return;

  const splitCmd = msg.content.split(" ", 1);
  const command = splitCmd[0].replace(prefixRegex, "");

  console.log(`${msg.author.username} sent the ${command} command!`);
});

client.login(process.env.DISCORD_TOKEN);
