# Prismarine Bot

<img height="120em" align="left" src="assets/prismarine-bot.svg" alt="Prismarine Bot logo">

## Control Minecraft servers and clients through Discord</h2></div>

Prismarine Bot is a Discord bot that uses [PrismarineJS](https://prismarine.js.org/)
to let you connect to Minecraft servers through Discord.
It is easy to self-host, with the official instance being [Prismarine Bot#1946][1].

## Branches explained

- `master` - This is running in production, and should be mostly stable.
- `staging` - Where new features are worked on before being merged. Intended for development: the bot may function, but a feature may be missing while it's reimplemented etc.
- `wip` - Sometimes used for working on large commits for `staging`. This branch may not function, or even build.

# Self-hosting

Clone the repo and prepare necessary files:
```sh
git clone https://github.com/MMK21Hub/prismarine-bot.git
cd prismarine-bot
npm i         # Installs all the requied dependencies to your local PC
npm run build # Makes sure that all the .js files are the latest build
```

Launch the bot:
```sh
node dist/main.js
```

If you want to contribute, start the TS compliler in watch mode with `npm run watch`

[1]: https://discord.com/oauth2/authorize?client_id=868840188347031622&amp;scope=bot&amp;permissions=2214976576 "Invite link"
