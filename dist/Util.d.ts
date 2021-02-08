/// <reference types="node" />
import { EventEmitter } from "events";
import * as TelegramBot from "node-telegram-bot-api";
import { Readable } from "stream";
export declare interface _GlobalEvents {
    on(event: "forward", listener: (update: TelegramBot.Update, all: boolean) => any): this;
}
export declare class _GlobalEvents extends EventEmitter {
}
export declare const GlobalEvents: _GlobalEvents;
export declare function streamToBuf(file: Readable): Promise<Buffer>;
export declare function asyncInterval(fn: () => Promise<any>, ms: number): () => void;
export declare function extractMsg(update: TelegramBot.Update): string | null;
