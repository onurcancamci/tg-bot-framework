"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bot = void 0;
const Tgfancy = require("tgfancy");
const Client_1 = require("./EntryPoints/Client");
const Server_1 = require("./EntryPoints/Server");
const Single_1 = require("./EntryPoints/Single");
class Bot {
    constructor(config) {
        this.config = config;
        this.chatId = config.chatId;
        this.tg = new Tgfancy(config.botId, {});
    }
    static async Create(config) {
        const bot = new this(config);
        if (config.type === "server") {
            const server = new Server_1.ServerEntry(config, bot);
            await server.Init();
        }
        else if (config.type === "client") {
            const client = new Client_1.ClientEntry(config, bot);
            await client.Init();
        }
        else if (config.type === "single") {
            const single = new Single_1.SingleEntry(config, bot);
            await single.Init();
        }
        return bot;
    }
    send(s, options = {}) {
        if (typeof s === "string") {
            return this.tg.sendMessage(this.chatId, s, options);
        }
    }
}
exports.Bot = Bot;
//# sourceMappingURL=Bot.js.map