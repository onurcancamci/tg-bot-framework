import * as TelegramBot from "node-telegram-bot-api";
import { Board } from "./Board";
import { Bot } from "./Bot";

export class Hook {
  static Check(
    update: TelegramBot.Update,
    bot?: Bot,
    board?: Board
  ): Promise<boolean> | boolean {
    return false;
  }

  static Execute(
    update: TelegramBot.Update,
    bot?: Bot,
    board?: Board
  ): Promise<boolean> | boolean {
    return false;
  }
}
