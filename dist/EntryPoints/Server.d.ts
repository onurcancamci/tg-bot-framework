import TelegramBot = require("node-telegram-bot-api");
import { Board } from "../Board";
import { Bot } from "../Bot";
import { ISseConfigServer, SseServer } from "../Sse";
export interface IServerConfig {
    type: "server";
    sse: ISseConfigServer;
    board: typeof Board;
}
export declare class ServerEntry {
    config: IServerConfig;
    bot: Bot;
    last_offset: number;
    sse: SseServer;
    rootBoard: Board;
    constructor(config: IServerConfig, bot: Bot);
    Init(): Promise<void>;
    CheckUpdates(): Promise<void>;
    RunThrough(update: TelegramBot.Update): Promise<boolean>;
}
