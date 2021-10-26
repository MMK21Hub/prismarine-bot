# v0.1 Changelog (Codebase)

This is a (very incomplete) list of some of the new features in v0.1.

## Additions

### General

### Utilities

- A few reusable helper functions have been added. See the JSDoc descriptions of the respective functions for more info.
  - `createCache()` takes an array of objects, extracts two properties from each object specified to be 'key' and 'value' properties, and returns a map of the specified keys to the specified values.
  - `validNamespacedId()` checks if a string is a valid namespaced ID.
  - `prefixedCommand()` combines the server's prefix, a command name and any arguments into a single string.
- Added a modular 'registry' system
  - Registries are maps of a namespaced ID to a specific type.
  - You need to specify the value type using a type argument, e.g. `new Registry<Command>()` to create a registry for commands
  - They have a `register()` function used to add to the registry
    - The required parameter is the item to register, or an array of items to register multiple.
    - It accepts one optional parameter (`key`), which specifies the property to be used as the namespaced ID. Its default value is `"id"`.
  - You can also specify a `postRegister` callback when initializing the registry. This is ran after each command is registered, and supplies two parameters: the registry itself, and the items that have just been registered.
  - Registries are currently used in the bot to manage custom interactions and commands
- A `PrismarineClient` class is now available. It extends the D.JS `Client` with a `botOptions` property, which is used to store deployment-specific config. Currently it stores the bot prefix.

### Command handling

A new `Command` class is now available for basic command parsing:

- The constructor takes a single `commandOptions` param. (See JSDoc for property descriptions)
  - Parameter handling is currently very basic, but you can specify parameter names and wether they're optional or not
  - The handler is usually a callback function, unless the command is 'overloaded' (see below)
  - There is a `parent` property, but it does nothing and will probably be removed once subcommands are properly implemented.

#### Overloaded commands

Sometimes, you want to use a different callback function depending on the arguments provided when the command is used. Instead of specifying a single callback function as the command's `handler`, you can specify an array of `StubCommand`s instead. Commands that have an array of stub commands as their handler are referred to as overloaded commands, since they have multiple 'overloads' that could be picked when the command is run.

- Stub commands are like mini commands that the user access as a single command, like multiple commands that use the same name.
- For example, you might want your `tag` command to display a list of tags when ran without arguments, but send the contents of a specific tags when an argument is specified.
- Two properties important when creating a stub command: `arguments` and `handler`. (You also need to specify a unique ID.) Both properties act the same as they do in a normal command.
- When an overloaded command is used, the parser decides which stub command to call based on the number of arguments that the command is used with.
  - Currently, stub commands can only be differentiated by number of arguments, but soon argument types (date, number, text, etc) will be able to be used too.

Overloaded command example:

```typescript
const tagCommand = new Command({
  name: "tag",
  id: "custom_tags:tag",
  // Specifying the params on the base Command object is optional
  params: [
    {
      name: "tag",
      optional: true,
    },
  ],
  handler: [
    // Set two stub commands as the handler
    new StubCommand("custom_tags:list_tags", listTags, []),
    new StubCommand("custom_tags:print_tag", printTags, [
      // Make sure to specify params here
      {
        name: "tag",
      },
    ]),
  ],
})
```
