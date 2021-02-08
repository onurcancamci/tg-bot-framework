import * as TelegramBot from "node-telegram-bot-api";
import { Bot } from "./Bot";
export declare class Board<T = any> {
    bot: Bot;
    context: T | null;
    constructor(bot: Bot);
    RunThrough(update: TelegramBot.Update): Promise<boolean>;
    Init(): Promise<void>;
}
