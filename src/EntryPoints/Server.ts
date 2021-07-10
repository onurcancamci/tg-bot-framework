import TelegramBot = require("node-telegram-bot-api");
import { Board } from "../Board";
import { Bot } from "../Bot";
import { ISseConfigServer, SseServer } from "../Sse";
import { asyncInterval, extractMsg, GlobalEvents } from "../Util";

const RunOnClientRegexp = /on client \$(?<client>\w+)/g;

export interface IServerConfig {
  type: "server";
  sse: ISseConfigServer;
  board: typeof Board;
}

export class ServerEntry {
  last_offset: number = 0;
  sse!: SseServer;

  rootBoard: Board;

  constructor(public config: IServerConfig, public bot: Bot) {
    this.rootBoard = new config.board(bot);
  }

  async Init() {
    console.log("Init Begin");
    await this.rootBoard.Init();
    this.sse = new SseServer(this.config.sse);
    await this.sse.initDone;
    asyncInterval(this.CheckUpdates.bind(this), 500);
    GlobalEvents.on("forward", async (update, all) => {
      for (const clientName in this.sse.clients) {
        const res = await this.sse.clients[clientName].SendUpdate(update);
        if (res && !all) {
          return true;
        }
      }
    });
  }

  async CheckUpdates() {
    const updates = await this.bot.tg.getUpdates({
      offset: this.last_offset + 1
    });

    for (const update of updates) {
      if (update.message?.chat.id !== this.bot.chatId) {
        this.last_offset = Math.max(this.last_offset, update.update_id);
        continue;
      }
      const result = await this.RunThrough(update);
      if (!result) {
        this.bot.send("Sorry, I couldn't understand");
      }
      this.last_offset = Math.max(this.last_offset, update.update_id);
    }
  }

  async RunThrough(update: TelegramBot.Update) {
    // TODO: ask which client answered
    // TODO: belki hangi clienta gitmesini istedigini mesajda arayabilirim
    try {
      const msg = extractMsg(update);
      if (msg) {
        const match = msg.matchAll(RunOnClientRegexp);
        const m = match.next();
        console.log(m.done, m.value.groups, this.sse.clients);
        if (!m.done && m.value.groups) {
          const clientName = m.value.groups.client;
          if (!this.sse.clients[clientName]) {
            this.bot.send(`Sorry, client ${clientName} is not accessible`);
          } else {
            const res = await this.sse.clients[clientName].SendUpdate(update);
            if (!res) {
              this.bot.send(`Sorry, client ${clientName} didn't understand`);
            }
          }
          return true;
        }
      }
      if (!(await this.rootBoard.RunThrough(update))) {
        // check clients
        for (const clientName in this.sse.clients) {
          const res = await this.sse.clients[clientName].SendUpdate(update);
          if (res) {
            return true;
          }
        }
      } else {
        return true;
      }
    } catch (ex) {
      this.bot.send("Sorry, there was an error");
      console.log(ex);
      return true;
    }
    return false;
  }
}
