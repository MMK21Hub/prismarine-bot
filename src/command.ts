import { Message } from "discord.js"
import { createCache, Registry, validNamespacedId } from "./util.js"

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

export interface commandEvent {
  message: Message
  params: string[]
  command: Command
}

export interface commandParam {
  name: string
  optional?: boolean
  // TODO: Validation options
}

export type commandCallback = (e: commandEvent) => void

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

export const commands: Registry<Command> = new Registry((reg, items) => {
  // Update the command name cache when a new command is registered
  let allCommands: Command[] = []
  reg.forEach((command) => {
    allCommands.push(command)
  })
  return createCache(allCommands, {
    key: "name",
    value: "id",
  })
})

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

// class HelpCommand extends Command {
//   constructor() {
//     super({
//       name: "help",
//       id: "_help",
//       params: [
//         {
//           name: "command",
//           optional: true,
//         },
//       ],
//       handler: ({ message }) => {
//         let longestCmd = 0
//         registry.commands.forEach((cmd) => {
//           if (cmd.name.length > longestCmd) longestCmd = cmd.name.length
//         })

//         let output = "**Commands:**\n```yaml\n"

//         registry.commands.forEach((cmd) => {
//           const extraSpaces = " ".repeat(longestCmd - cmd.name.length)

//           if (!cmd.shortDesc && cmd.desc) {
//             output += `${cmd.name}${extraSpaces} # Type ${prefixedCommand(
//               "help",
//               [cmd.name]
//             )}\n`
//           }
//           if (!cmd.shortDesc) {
//             output += `${cmd.name}${extraSpaces} # No description\n`
//             return
//           }
//           output += `${cmd.name}${extraSpaces} - ${cmd.shortDesc}\n`
//         })

//         output += "```"

//         message.reply(output)
//       },
//     })
//   }
// }
