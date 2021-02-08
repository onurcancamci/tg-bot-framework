import * as TelegramBot from "node-telegram-bot-api";
import { Board } from "./Board";
import { Bot } from "./Bot";
export declare class Hook {
    static Check(update: TelegramBot.Update, bot?: Bot, board?: Board): Promise<boolean> | boolean;
    static Execute(update: TelegramBot.Update, bot?: Bot, board?: Board): Promise<boolean> | boolean;
}
