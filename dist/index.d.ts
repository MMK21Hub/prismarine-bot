import { Client, Interaction, ButtonInteraction } from "discord.js";
export declare const client: Client;
declare type interactionSource = "button" | "context-menu" | "slash-command" | "select-menu" | "context-menu";
declare type customInteraction = customButtonInteraction | customOtherInteraction;
export interface customButtonInteraction {
    id: string;
    type: "button";
    handler: (interaction: ButtonInteraction) => void;
}
interface customOtherInteraction {
    id: string;
    type: interactionSource;
    handler: (interaction: Interaction) => void;
}
export declare function registerCustomInteractions(interactions: customInteraction[]): void;
export {};
