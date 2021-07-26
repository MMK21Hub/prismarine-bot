// Initialization
import { config } from "dotenv";
config();
import { Client } from "discord.js";
import Discord from "discord.js";
const client: Client = new Discord.Client();

interface registry {
  commands: Map<string, Command>;
}

type cmdType = "command" | "group" | "help";

const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);

const registry: registry = {
  commands: new Map(),
};

/** A map of command names to command IDs. Used for quick lookup of which command a user has entered. */
let commandNameCache: Map<string, string> = new Map();

/**
 * Generates a map that allows for quick lookup of a specific property
 * @param data An object that has the data that needs to be cached
 * @param options Specifies which properties of the above object should be used as the key and value when creating the cache
 */
function createCache(
  data: any[],
  options: {
    key: string;
    value: string;
  }
) {
  const cache = new Map();

  let index = 0;
  for (const item of data) {
    // If the item does not contain the specified properties,
    // raise an error.
    if (!item[options.key] || !item[options.value]) {
      throw new Error(
        `Found an object (index ${index}) that does not have a property that can be used as a key/value`
      );
    }

    // Add this item to the cache
    cache.set(item[options.key], item[options.value]);

    index++;
  }

  return cache;
}

function validNamespacedId(value: string) {
  const validChars = /[a-z0-9_:]/g;

  // Removes every valid character form the string,
  // then checks if the string is empty.
  // There must be a better way to do this.
  if (value.replace(validChars, "") === "") {
    return true;
  }

  return false;
}

class Command {
  // Properties
  name;
  params;
  id;
  callback;
  type;
  parent;
  shortDesc;
  desc;

  /**
   * Creates a new `Command` object.
   * Note that this doesn't automatically register the command:
   * you have to call {@link registerCommands} for the command to be usable.
   * @param name The name of the command. This is what the user types to execute the command.
   * @param id A unique namespaced ID for the command.
   * @param callback The function to be run when a user executes the command.
   * @param params How many parameters should the command take?
   * @param shortDesc A brief description to go in the command's line in the help menu.
   * @param desc All information about the command, to be used when the user asks for specific help on this command.
   * @param type Set to "group" to create a group that can have child commands. Set to "help" to make this command into a hardcoded help command.
   */
  constructor(
    name: string,
    id: string,
    callback: Function,
    params = 0,
    shortDesc?: string,
    desc?: string,
    type: cmdType = "command",
    parent?: string
  ) {
    this.name = name;
    this.params = params;
    this.id = id;
    this.callback = callback;
    this.desc = desc;
    this.shortDesc = shortDesc;
    this.type = type;
    this.parent = parent;

    if (name.length > 16) {
      // This is meant to be far above what anyone would need
      throw new Error("Command name lengths must be below 16 characters");
    }
    if (!validNamespacedId(id)) {
      throw new Error(
        "Namespaced IDs must only contain characters a-z, 0-9, _ or :"
      );
    }
    if (callback.length > 1) {
      throw new Error("Command callbacks can only take up to one parameter");
    }
    if (shortDesc && shortDesc.search("\n")) {
      throw new Error(
        "Short descriptions cannot contain line breaks. Move details to the extended description."
      );
    }
  }
}

/**
 * Registers an array of commands.
 * This lets you add new commands without restarting the bot :D
 */
function registerCommands(commands: Command[]) {
  // Add each command to the registry
  for (const command of commands) {
    registry.commands.set(command.id, command);
  }

  // Update the cache
  commandNameCache = createCache(commands, {
    key: "name",
    value: "id",
  });
}

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}`);
    return;
  }
  console.error("There is no user!");
});

client.on("message", (msg) => {
  // Not a command
  if (!msg.content.match(prefixRegex)) return;

  // Process the message to get `commandName` and `args` out of it
  const splitCmd = msg.content.split(" ", 1);
  const commandName = splitCmd[0].replace(prefixRegex, "");
  const args = splitCmd[1].split(" ");

  // If the command the user entered doesn't exist,
  // ignore it.
  const commandId = commandNameCache.get(commandName);
  if (!commandId) return;

  const command = registry.commands.get(commandId);

  // Throw an error if he command isn't in the registry
  if (!command)
    throw new Error("Could not find command with ID of " + commandId);

  // Execute the callback for the command
  command.callback();
});

client.login(process.env.DISCORD_TOKEN);
