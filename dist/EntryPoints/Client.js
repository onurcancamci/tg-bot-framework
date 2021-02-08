"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientEntry = void 0;
const Sse_1 = require("../Sse");
class ClientEntry {
    constructor(config, bot) {
        this.config = config;
        this.bot = bot;
        this.last_offset = 0;
        this.rootBoard = new config.board(bot);
    }
    async Init() {
        await this.rootBoard.Init();
        this.sse = new Sse_1.SseClient(this.config.sse);
        await this.sse.Init();
        this.sse.on("update", async (update, answerFn) => {
            try {
                const ans = await this.rootBoard.RunThrough(update);
                answerFn(ans);
            }
            catch (ex) {
                this.bot.send(`Sorry, error happend on client ${this.config.sse.name}`);
                console.log(ex);
                answerFn(false);
            }
        });
    }
}
exports.ClientEntry = ClientEntry;
//# sourceMappingURL=Client.js.map