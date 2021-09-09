import { Client, ClientOptions } from "discord.js"
import { client, prefix } from "./main.js"

/**
 * Generates a map that allows for quick lookup of a specific property
 * @param data An object that has the data that needs to be cached
 * @param options Specifies which properties of the above object should be used as the key and value when creating the cache
 */
export function createCache(
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

export function validNamespacedId(value: string) {
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
export function prefixedCommand(
  command: string,
  args: string[] = [],
  wrap = ""
) {
  const joinedArgs = args.join(" ")
  if (wrap) return wrap + prefix + command + " " + joinedArgs + wrap
  return prefix + command + " " + joinedArgs
}

type postRegisterCallback<T extends anyObject> = (
  registry: Registry<T>,
  items: T[]
) => void
export type anyObject = { [key: string]: any }

export class Registry<T extends anyObject> extends Map<string, T> {
  register: (items: T[] | T, key?: string) => void
  private postRegister?: (registry: Registry<T>, items: T[]) => void
  constructor(postRegister?: postRegisterCallback<T>) {
    super()
    this.postRegister = postRegister
    this.register = (items, key = "id") => {
      if (!Array.isArray(items)) items = [items]

      // Add each command to the registry
      for (const item of items) {
        if (typeof item !== "object") {
          throw new Error("Each item passed to register() must be an object.")
        }

        if (!item.hasOwnProperty(key)) {
          throw new Error(
            "Found item passed to register() that does not contain specified key: " +
              key
          )
        }
        this.set(item[key], item)
      }

      // Run the postRegister callback (if present)
      this.postRegister?.(this, items)
    }
  }
}

export enum characters {
  // ARROWS https://en.wikipedia.org/wiki/Arrow_(symbol)
  ARROW_LEFT = "\u2190",
  ARROW_RIGHT = "\u2192",
  ARROW_UP = "\u2191",
  ARROW_DOWN = "\u2193",
}

interface discordBotOptions {
  /**
   * The prefix that the bot will have when joining a new server.
   * If not specified, the bot will only be usable by mentioning the bot.
   * This can be overridden using a server config command
   *
   * NOTE: At the moment the bot prefix is global and cannot be configured per-server
   */
  defaultPrefix?: string
}

interface prismarineClientOptions extends ClientOptions {
  botOptions: discordBotOptions
}

export class PrismarineClient extends Client {
  /** Contains configuration for this specific instance of Prismarine Bot */
  botOptions: discordBotOptions

  constructor(options: prismarineClientOptions) {
    super(options)

    this.botOptions = options.botOptions
  }
}
