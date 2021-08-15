const ping = {
    metadata: {
        enabledByDefault: true,
        scopes: ["script"],
        pluginFormat: 1,
    },
    events: {
        load: () => {
            registerCommands([
                new Command({
                    name: "ping",
                    id: "ping",
                    handler: async (e) => {
                        const { bold } = await import("@discordjs/builders");
                        const { stripIndents: $ } = await import("common-tags");
                        e.message
                            .reply({
                            content: $ `
                  :ping_pong: ${bold("Pong!")}
                  Websocket heartbeat: ${client.ws.ping}ms
                `,
                        })
                            .then((msg) => {
                            const roundtrip = msg.createdTimestamp - e.message.createdTimestamp;
                            msg.edit($ `
                    ${msg.content}
                    API roundtrip: ${roundtrip}ms
                  `);
                        });
                    },
                }),
            ]);
        },
    },
};
export default ping;
//# sourceMappingURL=ping.js.map