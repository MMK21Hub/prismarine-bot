import { ButtonInteraction, Interaction } from "discord.js";
import { Registry } from "./util.js";
export declare const customInteractions: Registry<customInteraction>;
declare type interactionSource = "button" | "context-menu" | "slash-command" | "select-menu" | "context-menu";
export declare type customInteraction = customButtonInteraction | customOtherInteraction;
export interface customButtonInteraction {
    id: string;
    type: "button";
    handler?: (interaction: ButtonInteraction) => void;
}
interface customOtherInteraction {
    id: string;
    type: interactionSource;
    handler?: (interaction: Interaction) => void;
}
export declare function registerCustomInteractions(interactions: customInteraction[]): void;
export {};
