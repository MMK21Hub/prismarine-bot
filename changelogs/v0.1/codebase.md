# v0.1 Changelog (Codebase)

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
