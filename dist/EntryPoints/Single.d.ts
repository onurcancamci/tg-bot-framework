import { Board } from "../Board";
import { Bot } from "../Bot";
export interface ISingleConfig {
    type: "single";
    board: typeof Board;
}
export declare class SingleEntry {
    config: ISingleConfig;
    bot: Bot;
    last_offset: number;
    rootBoard: Board;
    constructor(config: ISingleConfig, bot: Bot);
    Init(): Promise<void>;
    CheckUpdates(): Promise<void>;
}
