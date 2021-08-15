/* IMPORTS */

// Builtins
import fs from "fs"
import path from "path"

// Discord.js + extra typings
import Discord, { Intents, Client, Message } from "discord.js"

// Template literal utils
import { stripIndent as $ } from "common-tags"

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
})

/* TYPESCRIPT STUFF */

interface registry {
  commands: Map<string, Command>
}

export interface commandOptions {
  /** The name of the command. This is what the user types to execute the command. */
  name: string
  /** A unique namespaced ID for the command. */
  id: string
  /** The function to be run when a user executes the command. */
  handler: commandCallback | StubCommand[]
  /** The parameters, if any, that the command should take. */
  params?: commandParam[]
  /** A brief description to go in the command's line in the help menu. */
  shortDesc?: string
  /** All information about the command, to be used when the user asks for specific help on this command. */
  desc?: string
  parent?: string
}

interface commandEvent {
  message: Message
  params: string[]
  command: Command
}

interface commandParam {
  name: string
  optional?: boolean
  // TODO: Validation options
}

export interface plugin {
  metadata: pluginMetadata
  events?: {
    load?: () => void
    unload?: () => void
    firstLoad?: () => void
    upgrade?: (from: string, to: string) => void
  }
}

type pluginScope = "command" | "script"

interface pluginMetadata {
  enabledByDefault: boolean
  scopes: pluginScope[]
  pluginFormat: 1
  searchTags?: string[]
  friendlyName?: string
  description?: string
  version?: string
}

interface registeredPlugin {
  enabled: boolean
  data: plugin
}

type commandCallback = (e: commandEvent) => void

/* CONSTANTS */

const prefix = "p!"
const prefixRegex = new RegExp(`^${prefix}`)
const pluginsFolder = path.resolve("plugins")
const verbose = false
const arrowRight = "**\u2192**"

const registry: registry = {
  commands: new Map(),
}
const plugins: Map<string, registeredPlugin> = new Map()

/** A map of command names to command IDs. Used for quick lookup of which command a user has entered. */
let commandNameCache: Map<string, string> = new Map()

/* UTILITY FUNCTIONS */

/**
 * Generates a map that allows for quick lookup of a specific property
 * @param data An object that has the data that needs to be cached
 * @param options Specifies which properties of the above object should be used as the key and value when creating the cache
 */
function createCache(
  data: any[],
  options: {
    key: string
    value: string
  }
) {
  const cache = new Map()

  let index = 0
  for (const item of data) {
    // If the item does not contain the specified properties,
    // raise an error.
    if (!item[options.key] || !item[options.value]) {
      throw new Error(
        `Found an object (index ${index}) that does not have a property that can be used as a key/value`
      )
    }

    // Add this item to the cache
    cache.set(item[options.key], item[options.value])

    index++
  }

  return cache
}

function validNamespacedId(value: string) {
  const validChars = /[a-z0-9_:]/g

  // Removes every valid character form the string,
  // then checks if the string is empty.
  // There must be a better way to do this.
  if (value.replace(validChars, "") === "") {
    return true
  }

  return false
}

/**
 * Combines the server's current prefix, a given command and optionally arguments
 * to create a pastable example command that can be given to the user.
 * Useful for help/error messages.
 * @param command The name of the command to be used
 * @param args An optional array of any arguments to add to the command
 * @param wrap An optional string to add to the beginning and end of the output
 * @returns A string that combines the given arguments and the prefix
 *
 * @example
 * prefixedCommand("balance")          // p!balance
 * @example
 * prefixedCommand("buy",["computer"]) // p!buy computer
 * @example
 * prefixedCommand(
 *  "connect",
 *  ["localhost", "8080"],
 *  "**"
 * )
 * // **p!connect localhost 8080**
 */
function prefixedCommand(command: string, args: string[] = [], wrap = "") {
  const joinedArgs = args.join(" ")
  if (wrap) return wrap + prefix + command + " " + joinedArgs + wrap
  return prefix + command + " " + joinedArgs
}

/* COMMAND MANAGEMENT */

function handleOverloadedCommand(e: commandEvent) {
  if (typeof e.command.handler === "function") {
    e.command.callback(e)
    console.error(
      "handleOverloadedCommand() was called on a non-overloaded command - something must have gone wrong"
    )
    return
  }

  e.command.handler.forEach((stub) => {
    if (stub.params.length === e.params.length) {
      stub.callback(e)
    }
  })
}

export class Command {
  // Properties
  name
  params: commandParam[]
  id
  handler
  parent
  shortDesc
  desc
  callback: commandCallback

  /**
   * Creates a new `Command` object.
   * Note that this doesn't automatically register the command:
   * you have to call {@link registerCommands} for the command to be usable.
   */
  constructor(options: commandOptions) {
    this.name = options.name
    this.params = options.params || []
    this.id = options.id
    this.handler = options.handler
    this.desc = options.desc
    this.shortDesc = options.shortDesc
    this.parent = options.parent
    this.callback =
      typeof options.handler === "function"
        ? options.handler
        : handleOverloadedCommand

    if (options.name.length > 16) {
      // This is meant to be far above what anyone would need
      throw new Error("Command name lengths must be below 16 characters")
    }
    if (!validNamespacedId(options.id)) {
      throw new Error(
        "Namespaced IDs must only contain characters a-z, 0-9, _ or :"
      )
    }
    if (typeof options.handler === "function" && options.handler.length > 1) {
      throw new Error("Command callbacks should only take one parameter")
    }
    if (options.shortDesc && /\n/.test(options.shortDesc)) {
      throw new Error(
        "Short descriptions cannot contain line breaks. Move details to the extended description."
      )
    }
    if (options.name.toLowerCase() !== options.name) {
      throw new Error("Command names should be lowercase")
    }

    if (typeof options.handler !== "function") {
      let parameterCounts: number[] = []
      options.handler.forEach((stub) => {
        if (parameterCounts.includes(stub.params.length)) {
          throw new Error(
            "Two or more stub commands with the same parameter count cannot be attached to a single command."
          )
        }
        parameterCounts.push(stub.params.length)
      })
    }
  }
}

class StubCommand extends Command {
  constructor(
    id: string,
    handler: commandCallback,
    params: commandParam[] = [],
    desc?: string
  ) {
    super({
      name: "",
      id,
      handler,
      params,
      desc,
    })
  }
}

class HelpCommand extends Command {
  constructor() {
    super({
      name: "help",
      id: "_help",
      params: [
        {
          name: "command",
          optional: true,
        },
      ],
      handler: ({ message }) => {
        let longestCmd = 0
        registry.commands.forEach((cmd) => {
          if (cmd.name.length > longestCmd) longestCmd = cmd.name.length
        })

        let output = "**Commands:**\n```yaml\n"

        registry.commands.forEach((cmd) => {
          const extraSpaces = " ".repeat(longestCmd - cmd.name.length)

          if (!cmd.shortDesc && cmd.desc) {
            output += `${cmd.name}${extraSpaces} # Type ${prefixedCommand(
              "help",
              [cmd.name]
            )}\n`
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
  }
}

/**
 * Registers an array of commands.
 * This lets you add new commands without restarting the bot :D
 */
export function registerCommands(commands: Command[]) {
  // Add each command to the registry
  for (const command of commands) {
    registry.commands.set(command.id, command)
  }

  // Update the cache
  let newCommands: Command[] = []
  registry.commands.forEach((command) => {
    newCommands.push(command)
  })
  commandNameCache = createCache(newCommands, {
    key: "name",
    value: "id",
  })
}

registerCommands([new HelpCommand()])

/* PLUGIN MANAGEMENT */

function registerPlugin(filename: string) {
  return import(path.join(pluginsFolder, filename))
    .catch(console.error)
    .then(({ default: plugin }: { default: plugin }) => {
      if (!plugin.metadata)
        return console.error($`
          Could not find exported metadata in plugin file "${filename}".
        `)
      const metadata = plugin.metadata
      return plugins
        .set(filename, {
          enabled: false,
          data: plugin,
        })
        .get(filename)
    })
}

function loadPlugin(plugin: registeredPlugin) {
  if (plugin.enabled) return

  // Execute the `events.load` callback (if present)
  if (plugin.data.events?.load) {
    const cb = eval(plugin.data.events.load.toString())
    cb()
  }

  // Mark the plugin as enabled
  plugin.enabled = true
}

// Check for new plugins
fs.readdir(pluginsFolder, (err, files) => {
  files.forEach((file) => {
    const extension = path.extname(file)
    if (extension !== ".js") return
    if (plugins.has(path.basename(file, extension))) return

    registerPlugin(file).then((plugin) => {
      // Load any plugins that should be loaded
      if (!plugin?.data.metadata.enabledByDefault) return
      loadPlugin(plugin)
    })
  })
})

/* D.JS EVENT LISTENERS */

if (verbose) client.on("debug", console.log)

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

  const command = registry.commands.get(commandId)

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
