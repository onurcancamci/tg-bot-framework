import { Board } from "../Board";
import { Bot } from "../Bot";
import { asyncInterval } from "../Util";

export interface ISingleConfig {
  type: "single";
  board: typeof Board;
}

export class SingleEntry {
  last_offset: number = 0;
  rootBoard: Board;

  constructor(public config: ISingleConfig, public bot: Bot) {
    this.rootBoard = new config.board(bot);
  }

  async Init() {
    await this.rootBoard.Init();
    asyncInterval(this.CheckUpdates.bind(this), 500);
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
      const result = await this.rootBoard.RunThrough(update);
      if (!result) {
        this.bot.send("Sorry, I couldn't understand");
      }
      this.last_offset = Math.max(this.last_offset, update.update_id);
    }
  }
}
