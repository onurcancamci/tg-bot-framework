import { EventEmitter } from "events";
import * as TelegramBot from "node-telegram-bot-api";
import { Readable } from "stream";

export declare interface _GlobalEvents {
  on(
    event: "forward",
    listener: (update: TelegramBot.Update, all: boolean) => any
  ): this;
}
export class _GlobalEvents extends EventEmitter {}
export const GlobalEvents = new _GlobalEvents();

export function streamToBuf(file: Readable): Promise<Buffer> {
  const bufs: Buffer[] = [];
  let res: Function;
  const P = new Promise((r) => {
    res = r;
  });
  file.on("data", function (d) {
    bufs.push(d);
  });
  file.on("end", function () {
    const buf = Buffer.concat(bufs);
    res(buf);
  });
  return P as any;
}

export function asyncInterval(fn: () => Promise<any>, ms: number) {
  let stop = false;
  const ifn = () => {
    if (stop) return;
    fn().then((r) => setTimeout(ifn, ms));
  };
  setTimeout(ifn, ms);
  return () => {
    stop = true;
  };
}

export function extractMsg(update: TelegramBot.Update) {
  if (update.message && update.message.text) {
    let msg = update.message.text;
    msg = msg.trim().toLowerCase();
    return msg;
  } else {
    return null;
  }
}
