/// <reference types="node" />
import * as express from "express";
import * as EventSource from "eventsource";
import { EventEmitter } from "events";
import TelegramBot = require("node-telegram-bot-api");
export interface ISseConfigClient extends ISseConfigBase {
    host: string;
    name: string;
}
export interface ISseConfigServer extends ISseConfigBase {
    key: string;
    cert: string;
    passpharase: string;
}
export interface ISseConfigBase {
    authKey: string;
    port: number;
}
export declare type SseData = SseDataUpdate;
export interface SseDataUpdate {
    type: "update";
    update: TelegramBot.Update;
}
export declare class SseClientHandler {
    req: express.Request;
    res: express.Response;
    parent: SseServer;
    name: string;
    constructor(req: express.Request, res: express.Response, parent: SseServer, name: string);
    send_error: boolean;
    Send(msg: SseData): void;
    SendUpdate(update: TelegramBot.Update): Promise<unknown>;
}
export declare class SseServer {
    config: ISseConfigServer;
    initDone: Promise<any>;
    clients: Record<string, SseClientHandler>;
    app: express.Application;
    updateAnswerLock: Record<string, Function>;
    constructor(config: ISseConfigServer);
    Init(): Promise<unknown>;
}
export declare interface SseClient {
    on(event: "update", listener: (update: TelegramBot.Update, ans: (answer: boolean) => void) => any): this;
    on(event: "message", listener: (evt: MessageEvent) => any): this;
    on(event: "data", listener: (evt: SseData) => any): this;
}
export declare class SseClient extends EventEmitter {
    config: ISseConfigClient;
    eventSource?: EventSource;
    initDone: Promise<any>;
    constructor(config: ISseConfigClient);
    Init(): Promise<unknown>;
}
