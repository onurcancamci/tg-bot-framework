import { SendMessageOptions } from "node-telegram-bot-api";
import Tgfancy = require("tgfancy");
import { ClientEntry, IClientConfig } from "./EntryPoints/Client";
import { IServerConfig, ServerEntry } from "./EntryPoints/Server";
import { ISingleConfig, SingleEntry } from "./EntryPoints/Single";

export interface IConfigBase {
  chatId: number;
  botId: string;
}

export type IConfig = IConfigBase &
  (IServerConfig | IClientConfig | ISingleConfig);

export class Bot {
  chatId: number;
  tg: Tgfancy;

  static async Create(config: IConfig) {
    const bot = new this(config);
    if (config.type === "server") {
      const server = new ServerEntry(config, bot);
      await server.Init();
    } else if (config.type === "client") {
      const client = new ClientEntry(config, bot);
      await client.Init();
    } else if (config.type === "single") {
      const single = new SingleEntry(config, bot);
      await single.Init();
    }
    return bot;
  }

  constructor(public config: IConfig) {
    this.chatId = config.chatId;
    this.tg = new Tgfancy(config.botId, {});
  }

  send(s: string, options: SendMessageOptions = {}) {
    if (typeof s === "string") {
      return this.tg.sendMessage(this.chatId, s, options);
    }
  }
}
