import { SendMessageOptions } from "node-telegram-bot-api";
import Tgfancy = require("tgfancy");
import { IClientConfig } from "./EntryPoints/Client";
import { IServerConfig } from "./EntryPoints/Server";
import { ISingleConfig } from "./EntryPoints/Single";
export interface IConfigBase {
    chatId: number;
    botId: string;
}
export declare type IConfig = IConfigBase & (IServerConfig | IClientConfig | ISingleConfig);
export declare class Bot {
    config: IConfig;
    chatId: number;
    tg: Tgfancy;
    static Create(config: IConfig): Promise<Bot>;
    constructor(config: IConfig);
    send(s: string, options?: SendMessageOptions): Promise<import("node-telegram-bot-api").Message> | undefined;
}
