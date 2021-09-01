/* IMPORTS */

// Local files
import { commandParam, commandRegistry as commands } from "./commands"
import { Registry } from "./util"

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
import("dotenv").then(({ config }) => {
  // Throw eny errors encountered while loading .env
  const err = config().error
  if (err) throw err

  // Initialize a connection with the Discord gateway
  client.login(process.env.DISCORD_TOKEN)

  // Subscribe to debug messages if `VERBOSE` is set
  if (process.env.VERBOSE) client.on("debug", console.log)
})

/* TYPESCRIPT STUFF */

type interactionSource =
  | "button"
  | "context-menu"
  | "slash-command"
  | "select-menu"
  | "context-menu"

type customInteraction = customButtonInteraction | customOtherInteraction

export interface customButtonInteraction {
  id: string
  type: "button"
  handler: (interaction: ButtonInteraction) => void
}
interface customOtherInteraction {
  id: string
  type: interactionSource
  handler: (interaction: Interaction) => void
}

/* CONSTANTS */

const prefix = "p!"
const prefixRegex = new RegExp(`^${prefix}`)
const arrowRight = "**\u2192**"

// Registries
const customInteractions = new Registry<customInteraction>()

/** A map of command names to command IDs. Used for quick lookup of which command a user has entered. */
let commandNameCache: Map<string, string> = new Map()

// registerCommands([new HelpCommand()])

/* INTERACTION MANAGEMENT */

export function registerCustomInteractions(interactions: customInteraction[]) {
  for (const interaction of interactions) {
    customInteractions.set(interaction.id, interaction)
  }
}

function handleInteraction(i: Interaction) {
  if (i.isButton()) return handleButtonInteraction(i)
}

async function handleButtonInteraction(i: ButtonInteraction) {
  const [actionType, handlerId] = i.customId.split("/")

  if (actionType === "custom") {
    const customInteraction = customInteractions.get(handlerId)

    if (!customInteraction) {
      let interactionSrc = "interaction"
      if (i.isButton()) interactionSrc = "button"
      if (i.isCommand()) interactionSrc = "slash command"
      if (i.isSelectMenu()) interactionSrc = "selection"

      const reason = `Could not find a handler to match this ${interactionSrc}`
      const content = $`
        :x: ${bold("Interaction failed")} (${reason})

        Registered interaction handlers: ${customInteractions.size}
        Interaction ID: ${inlineCode(i.id)}
        Handler ID: ${inlineCode(handlerId)}
      `
      return await i.reply({ content, ephemeral: true })
    }

    // If a handler is present, execute it
    const handler = eval(customInteraction.handler.toString())
    handler(i)
  }
}

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

  // If the command the user entered doesn't exist,
  // ignore it.
  const commandId = commandNameCache.get(commandName)
  if (!commandId) return

  const command = commands.get(commandId)

  // Throw an error if the command isn't in the registry
  if (!command)
    throw new Error("Could not find command with ID of " + commandId)

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

      ${arrowRight} Type ${prefixedCommand("help", [command.name], "`")} \
      to view command help.
    `)

    return
  }

  // Execute the callback for the command
  command.callback({ params, message: msg, command })
})

client.on("interactionCreate", handleInteraction)
