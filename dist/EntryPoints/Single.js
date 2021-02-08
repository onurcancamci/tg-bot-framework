"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingleEntry = void 0;
const Util_1 = require("../Util");
class SingleEntry {
    constructor(config, bot) {
        this.config = config;
        this.bot = bot;
        this.last_offset = 0;
        this.rootBoard = new config.board(bot);
    }
    async Init() {
        await this.rootBoard.Init();
        Util_1.asyncInterval(this.CheckUpdates.bind(this), 500);
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
exports.SingleEntry = SingleEntry;
//# sourceMappingURL=Single.js.map