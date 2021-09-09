import { bold, inlineCode } from "@discordjs/builders";
import { stripIndents as $ } from "common-tags";
import { client } from "./main.js";
import { Registry } from "./util.js";
export const customInteractions = new Registry();
export function registerCustomInteractions(interactions) {
    for (const interaction of interactions) {
        customInteractions.set(interaction.id, interaction);
    }
}
function handleInteraction(i) {
    if (i.isButton())
        return handleButtonInteraction(i);
}
async function handleButtonInteraction(i) {
    const [actionType, handlerId] = i.customId.split("/");
    if (actionType === "custom") {
        const customInteraction = customInteractions.get(handlerId);
        if (!customInteraction) {
            let interactionSrc = "interaction";
            if (i.isButton())
                interactionSrc = "button";
            if (i.isCommand())
                interactionSrc = "slash command";
            if (i.isSelectMenu())
                interactionSrc = "selection";
            const reason = `Could not find a handler to match this ${interactionSrc}`;
            const content = $ `
        :x: ${bold("Interaction failed")} (${reason})

        Registered interaction handlers: ${customInteractions.size}
        Interaction ID: ${inlineCode(i.id)}
        Handler ID: ${inlineCode(handlerId)}
      `;
            return await i.reply({ content, ephemeral: true });
        }
        customInteraction.handler?.(i);
    }
}
client.on("interactionCreate", handleInteraction);
//# sourceMappingURL=interaction.js.map