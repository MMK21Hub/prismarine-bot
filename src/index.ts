/* IMPORTS */

// Local files
import { commands, lookupCommandName } from "./command.js"
import {
  prefixRegex,
  Registry,
  characters as _,
  prefixedCommand,
} from "./util.js"

// Builtins
import fs from "fs"
import path from "path"

// Discord.js + extra typings
import Discord, {
  Intents,
  Client,
  Interaction,
  ButtonInteraction,
} from "discord.js"

// Template literal utils
import { stripIndents as $ } from "common-tags"

// Discord-specific utils
import { bold, inlineCode } from "@discordjs/builders"
import { customInteraction } from "./interaction.js"

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
export const client: Client = new Discord.Client({
  // Specifies the events that the bot receives
  intents,
  // Lets the bot work in DMs
  partials: ["CHANNEL"],
  // Stops replies from pinging the user
  allowedMentions: {
    repliedUser: false,
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

/* CONSTANTS */

// Bot prefix
export const prefix = "p!"

/* D.JS EVENT LISTENERS */

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}`)
    return
  }
  console.error("There is no user!")
})

client.on("messageCreate", async (msg) => {
  // Not a command
  if (!msg.content.match(prefixRegex)) return

  // Process the message to get `commandName` and `params` out of it
  const splitCmd = msg.content.split(" ")
  const commandName = splitCmd[0].replace(prefixRegex, "").toLowerCase()
  const params = splitCmd.slice(1)

  // Get the command from the command name
  const command = lookupCommandName(commandName)
  // Ignore the message if the command does not exist
  if (!command) return

  let minParams = 0
  if (command.params) {
    // Check each param
    command.params.forEach((param) => {
      if (!param.optional) {
        minParams++
      }
    })
  }

  if (command.params && params.length < minParams) {
    msg.channel.send($`
      :x: **Missing one or more required parameters**
      Expected ${minParams} parameter(s) but got ${params.length}.

      ${bold(_.ARROW_RIGHT)} Type ${prefixedCommand("help", [command.name])} \
      to view command help.
    `)

    return
  }

  // Execute the callback for the command
  command.callback({ params, message: msg, command })
})
