import { Board } from "../Board";
import { Bot } from "../Bot";
import { ISseConfigClient, SseClient } from "../Sse";

export interface IClientConfig {
  type: "client";
  sse: ISseConfigClient;
  board: typeof Board;
}

export class ClientEntry {
  last_offset: number = 0;
  sse!: SseClient;

  rootBoard: Board;

  constructor(public config: IClientConfig, public bot: Bot) {
    this.rootBoard = new config.board(bot);
  }

  async Init() {
    await this.rootBoard.Init();
    this.sse = new SseClient(this.config.sse);
    await this.sse.initDone;
    this.sse.on("update", async (update, answerFn) => {
      try {
        const ans = await this.rootBoard.RunThrough(update);
        answerFn(ans);
      } catch (ex) {
        this.bot.send(`Sorry, error happend on client ${this.config.sse.name}`);
        console.log(ex);
        answerFn(false);
      }
    });
  }
}
