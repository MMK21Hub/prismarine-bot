import { bold, inlineCode } from "@discordjs/builders"
import { ButtonInteraction, Interaction } from "discord.js"
import { stripIndents as $ } from "common-tags"
import { client, customInteractions } from "./index.js"

type interactionSource =
  | "button"
  | "context-menu"
  | "slash-command"
  | "select-menu"
  | "context-menu"

export type customInteraction = customButtonInteraction | customOtherInteraction

export interface customButtonInteraction {
  id: string
  type: "button"
  handler?: (interaction: ButtonInteraction) => void
}
interface customOtherInteraction {
  id: string
  type: interactionSource
  handler?: (interaction: Interaction) => void
}

export function registerCustomInteractions(interactions: customInteraction[]) {
  for (const interaction of interactions) {
    customInteractions.set(interaction.id, interaction)
  }
}

function handleInteraction(i: Interaction) {
  if (i.isButton()) return handleButtonInteraction(i)
}

async function handleButtonInteraction(i: ButtonInteraction) {
  const [actionType, handlerId] = i.customId.split("/")

  if (actionType === "custom") {
    const customInteraction = customInteractions.get(handlerId)

    if (!customInteraction) {
      let interactionSrc = "interaction"
      if (i.isButton()) interactionSrc = "button"
      if (i.isCommand()) interactionSrc = "slash command"
      if (i.isSelectMenu()) interactionSrc = "selection"

      const reason = `Could not find a handler to match this ${interactionSrc}`
      const content = $`
        :x: ${bold("Interaction failed")} (${reason})

        Registered interaction handlers: ${customInteractions.size}
        Interaction ID: ${inlineCode(i.id)}
        Handler ID: ${inlineCode(handlerId)}
      `
      return await i.reply({ content, ephemeral: true })
    }

    // If a handler is present, execute it
    customInteraction.handler?.(i)
  }
}

client.on("interactionCreate", handleInteraction)
