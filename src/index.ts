/* IMPORTS */

// Our own custom discord client class, based on the default D.JS one
import { PrismarineClient } from "./util.js"

// Bits from Discord.js that we'll use to initialize the client
import { Intents } from "discord.js"

// Get the command registry so that we can register the imported commands
import { commands } from "./command.js"

/* INITIALIZATION */

// Set up the intents that we need
const intents = new Intents()
intents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
)

// Create a new D.JS client
export const client = new PrismarineClient({
  // Specifies the events that the bot receives
  intents,
  // Lets the bot work in DMs
  partials: ["CHANNEL"],
  // Stops replies from pinging the user
  allowedMentions: {
    repliedUser: false,
  },
  // Specify the prefix for Prismarine Bot to use
  botOptions: {
    defaultPrefix: "p!",
  },
})

// Register environment vars from the .env file
import("dotenv").then(async ({ config }) => {
  // Throw eny errors encountered while loading .env
  const err = config().error
  if (err) throw err

  // Initialize a connection with the Discord gateway
  client.login(process.env.DISCORD_TOKEN)

  // Register all commands
  const { default: importedCommands } = await import("./commands/index.js")
  commands.register(importedCommands)
})

// Hardcode the bot prefix; this will be a server setting at some point
export const prefix = "p!"

// Print to console when the connection is ready
client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}`)
    return
  }
  // This shouldn't happen
  console.error("There is no user!")
})
