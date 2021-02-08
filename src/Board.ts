import * as TelegramBot from "node-telegram-bot-api";
import { Bot } from "./Bot";

export class Board<T = any> {
  context: T | null = null;

  constructor(public bot: Bot) {}

  async RunThrough(update: TelegramBot.Update): Promise<boolean> {
    return false;
  }

  async Init(): Promise<void> {}
}
