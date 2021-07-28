// Initialization
import { config } from "dotenv";
config();
import { Client, Message, WebhookClient } from "discord.js";
import Discord from "discord.js";
const client: Client = new Discord.Client();
import https from "https";
import hash from "murmurhash";

interface registry {
  commands: Map<string, Command>;
}

interface commandEvent {
  message: Message;
  params: string[];
  command: Command;
}

interface commandParam {
  name: string;
  optional?: boolean;
  // TODO: Validation options
}

type cmdType = "normal" | "group" | "help" | "stub" | "overloaded";
type commandCallback = (e: commandEvent) => void;

const prefix = "p!";
const prefixRegex = new RegExp(`^${prefix}`);
const arrowRight = "**\u2192**";

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
  const joinedArgs = args.join(" ");
  if (wrap) return wrap + prefix + command + " " + joinedArgs + wrap;
  return prefix + command + " " + joinedArgs;
}

function handleOverloadedFunction(commandEvent: commandEvent) {}

class Command {
  // Properties
  name;
  params;
  id;
  handler;
  type;
  parent;
  shortDesc;
  desc;
  callback: commandCallback;

  /**
   * Creates a new `Command` object.
   * Note that this doesn't automatically register the command:
   * you have to call {@link registerCommands} for the command to be usable.
   * @param name The name of the command. This is what the user types to execute the command.
   * @param id A unique namespaced ID for the command.
   * @param handler The function to be run when a user executes the command.
   * @param params The parameters, if any, that the command should take.
   * @param shortDesc A brief description to go in the command's line in the help menu.
   * @param desc All information about the command, to be used when the user asks for specific help on this command.
   * @param type Set to "group" to create a group that can have child commands. Set to "help" to make this command into a hardcoded help command.
   */
  constructor(
    name: string,
    id: string,
    handler: commandCallback | StubCommand[],
    params: commandParam[] = [],
    shortDesc?: string,
    desc?: string,
    type: cmdType = "normal",
    parent?: string
  ) {
    this.name = name;
    this.params = params;
    this.id = id;
    this.handler = handler;
    this.desc = desc;
    this.shortDesc = shortDesc;
    this.type = type;
    this.parent = parent;
    this.callback =
      typeof handler === "function" ? handler : handleOverloadedFunction;

    if (name.length > 16) {
      // This is meant to be far above what anyone would need
      throw new Error("Command name lengths must be below 16 characters");
    }
    if (!validNamespacedId(id)) {
      throw new Error(
        "Namespaced IDs must only contain characters a-z, 0-9, _ or :"
      );
    }
    if (typeof handler === "function" && handler.length > 1) {
      throw new Error("Command callbacks should only take one parameter");
    }
    if (shortDesc && /\n/.test(shortDesc)) {
      throw new Error(
        "Short descriptions cannot contain line breaks. Move details to the extended description."
      );
    }
    if (name.toLowerCase() !== name) {
      throw new Error("Command names should be lowercase");
    }

    if (typeof handler !== "function") {
      this.type = "overloaded";

      let parameterCounts: number[] = [];
      handler.forEach((stub) => {
        if (parameterCounts.includes(stub.params.length)) {
          throw new Error(
            "Two or more stub commands with the same parameter count cannot be attached to a single command."
          );
        }
        parameterCounts.push(stub.params.length);
      });
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
    super("", id, handler, params, undefined, desc, "stub", undefined);
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
  let newCommands: Command[] = [];
  registry.commands.forEach((command) => {
    newCommands.push(command);
  });
  commandNameCache = createCache(newCommands, {
    key: "name",
    value: "id",
  });
}

registerCommands([
  new Command(
    "help",
    "_help",
    ({ message }) => {
      let output = "**Commands:**\n```yaml\n";

      registry.commands.forEach((cmd) => {
        if (!cmd.shortDesc && cmd.desc) {
          output += `${cmd.name} # Type "${prefix}help ${cmd.name}"\n`;
        }
        if (!cmd.shortDesc) {
          output += `${cmd.name} # No description\n`;
          return;
        }
        output += `${cmd.name} - ${cmd.shortDesc}\n`;
      });

      output += "```";

      message.reply(output);
    },
    [
      {
        name: "command",
        optional: true,
      },
    ],
    "Displays a list of all available commands",
    undefined,
    "help"
  ),
]);

{
  const threadRolloutStatus = new Command(
    "threads",
    "thread_rollout_status",
    (e) => {
      if (e.params) {
        const server = e.params[0];
        const threadRolloutPercentage = 25;

        if (!/\d{18}/.test(server)) {
          e.message.reply(`:x: "${server}" doesn't look like a server ID.`);
        }

        const result =
          hash(`2020-09_threads:${server}`) % 1e4 <
          threadRolloutPercentage * 100;

        // Really wanted to add a film reference here:
        return e.message.reply(
          result
            ? "That server has access to threads :tada:"
            : "That server does not access to threads :pensive:"
        );
      }

      https.get("https://threads-rollout.advaith.workers.dev/", (res) => {
        res.on("data", (data) => {
          e.message.reply(
            `Threads have been rolled out to ${data} of servers!`
          );
        });
      });
    },
    [
      {
        name: "server",
        optional: true,
      },
    ],
    "Gets the percentage of servers that have access to threads",
    `\
Gets the percentage of servers that have access to threads.
Threads are currently (as of 27 July) in early-access mode for selected servers.
If they have community options enabled, they can opt-in to enable threads before they roll out fully on 17 August.
This command lets you easily see how many servers are part of the rollout so far.

**Usage:**
Get rollout percentage: ${prefixedCommand("threads", [], "`")}
Check if a server is enrolled: \
${prefixedCommand("threads", ["<Server ID>"], "`")}

**Credits:**
Thanks to advaith for providing a thread rollout API for us all to use, \
and for cracking the formula to check if a server has been enrolled yet.
${arrowRight} https://advaith.io/`
  );

  registerCommands([threadRolloutStatus]);
}

client.on("ready", () => {
  if (client.user) {
    console.log(`Logged in as ${client.user.tag}`);
    return;
  }
  console.error("There is no user!");
});

client.on("message", async (msg) => {
  // Not a command
  if (!msg.content.match(prefixRegex)) return;

  // Process the message to get `commandName` and `params` out of it
  const splitCmd = msg.content.split(" ");
  const commandName = splitCmd[0].replace(prefixRegex, "").toLowerCase();
  const params = splitCmd.slice(1);

  // If the command the user entered doesn't exist,
  // ignore it.
  const commandId = commandNameCache.get(commandName);
  if (!commandId) return;

  const command = registry.commands.get(commandId);

  // Throw an error if the command isn't in the registry
  if (!command)
    throw new Error("Could not find command with ID of " + commandId);

  let minParams = 0;
  if (command.params) {
    // Check each param
    command.params.forEach((param) => {
      if (!param.optional) {
        minParams++;
      }
    });
  }

  if (params.length < minParams) {
    msg.channel.send(
      `\
:x: **Missing one or more required parameters**
Expected ${minParams} parameter(s) but got ${params.length}.

${arrowRight} Type ${prefixedCommand("help", [command.name], "`")} \
to view command help.`
    );

    return;
  }

  // Execute the callback for the command
  command.callback({ params, message: msg, command });
});

client.login(process.env.DISCORD_TOKEN);
