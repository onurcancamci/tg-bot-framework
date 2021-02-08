"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerEntry = void 0;
const Sse_1 = require("../Sse");
const Util_1 = require("../Util");
const RunOnClientRegexp = /on client \$(?<client>\w+)/g;
class ServerEntry {
    constructor(config, bot) {
        this.config = config;
        this.bot = bot;
        this.last_offset = 0;
        this.rootBoard = new config.board(bot);
    }
    async Init() {
        await this.rootBoard.Init();
        this.sse = new Sse_1.SseServer(this.config.sse);
        await this.sse.initDone;
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
            const result = await this.RunThrough(update);
            if (!result) {
                this.bot.send("Sorry, I couldn't understand");
            }
            this.last_offset = Math.max(this.last_offset, update.update_id);
        }
    }
    async RunThrough(update) {
        // TODO: ask which client answered
        // TODO: belki hangi clienta gitmesini istedigini mesajda arayabilirim
        try {
            const msg = Util_1.extractMsg(update);
            if (msg) {
                const match = msg.matchAll(RunOnClientRegexp);
                const m = match.next();
                if (!m.done && m.value.groups) {
                    const clientName = m.value.groups.client;
                    if (!this.sse.clients[clientName]) {
                        this.bot.send(`Sorry, client ${clientName} is not accessible`);
                    }
                    else {
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
            }
            else {
                return true;
            }
        }
        catch (ex) {
            this.bot.send("Sorry, there was an error");
            console.log(ex);
            return true;
        }
        return false;
    }
}
exports.ServerEntry = ServerEntry;
//# sourceMappingURL=Server.js.map