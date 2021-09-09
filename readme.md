# Prismarine Bot

<img height="120em" align="left" src="assets/prismarine-bot.svg" alt="Prismarine Bot logo">

## Control Minecraft servers and clients through Discord</h2></div>

Prismarine Bot is a Discord bot that uses [PrismarineJS](https://prismarine.js.org/)
to let you connect to Minecraft servers through Discord.
It is easy to self-host, with the official instance being [Prismarine Bot#1946][1].

## Branches explained

- **`master`** - Features arrive here once they're 'released'. Intended for production: the bot will be (relatively) stable and bug-free.
- **`staging`** - Where new features go before being merged. Intended for testing: the bot should function, but a feature may be missing while it's reimplemented etc.
- **Feature branches** - New features that are being worked on. Intended for develpment: the bot could be completely borked while somebody's working on it.

## Self-hosting

Clone the repo and prepare necessary files:
```sh
git clone https://github.com/MMK21Hub/prismarine-bot.git
cd prismarine-bot
npm i         # Installs all the requied dependencies to your local PC
npm run build # Makes sure that all the .js files are the latest build
touch .env    # Creates a file to put your environment variables in
```

Fill out the `.env` file:
```properties
DISCORD_TOKEN = BOT.TOKEN.HERE
```

Launch the bot:
```sh
node dist/main.js
```

If you want to contribute, start the TS compliler in watch mode with `npm run watch`

[1]: https://discord.com/oauth2/authorize?client_id=868840188347031622&amp;scope=bot&amp;permissions=2214976576 "Invite link"
