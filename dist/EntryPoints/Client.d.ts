import { Board } from "../Board";
import { Bot } from "../Bot";
import { ISseConfigClient, SseClient } from "../Sse";
export interface IClientConfig {
    type: "client";
    sse: ISseConfigClient;
    board: typeof Board;
}
export declare class ClientEntry {
    config: IClientConfig;
    bot: Bot;
    last_offset: number;
    sse: SseClient;
    rootBoard: Board;
    constructor(config: IClientConfig, bot: Bot);
    Init(): Promise<void>;
}
