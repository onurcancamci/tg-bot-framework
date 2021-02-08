"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SseClient = exports.SseServer = exports.SseClientHandler = void 0;
const express = require("express");
const bodyParser = require("body-parser");
const https_1 = require("https");
const EventSource = require("eventsource");
const events_1 = require("events");
const node_fetch_1 = require("node-fetch");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
class SseClientHandler {
    constructor(req, res, parent, name) {
        this.req = req;
        this.res = res;
        this.parent = parent;
        this.name = name;
        this.send_error = false;
    }
    Send(msg) {
        try {
            this.res.write(`data: ${JSON.stringify(msg)}\n\n`); // res.write() instead of res.send()
        }
        catch (ex) {
            this.send_error = true;
        }
    }
    SendUpdate(update) {
        return new Promise((res) => {
            this.parent.updateAnswerLock[`${this.name}-${update.update_id}`] = res;
            this.Send({ type: "update", update });
            setTimeout(() => {
                if (this.parent.updateAnswerLock[`${this.name}-${update.update_id}`]) {
                    delete this.parent.updateAnswerLock[`${this.name}-${update.update_id}`];
                    res(false);
                }
            }, 3000);
        });
    }
}
exports.SseClientHandler = SseClientHandler;
class SseServer {
    constructor(config) {
        this.config = config;
        this.clients = {};
        this.updateAnswerLock = {};
        this.app = express();
        this.initDone = this.Init();
    }
    Init() {
        this.app.use(bodyParser.json());
        this.app.get("/", (req, res) => {
            res.end("Operational");
        });
        this.app.all("/updateAnswer", (req, res) => {
            const name = req.headers["x-name"];
            const auth = req.headers["x-auth"];
            if (!name || !auth || typeof name === "object") {
                console.log("X-Name or X-Auth is null");
                res.end();
                return;
            }
            if (auth != this.config.authKey) {
                res.end();
                return;
            }
            const data = req.body;
            const resolve = this.updateAnswerLock[`${name}-${data.updateId}`];
            if (resolve) {
                resolve(data.answer);
                delete this.updateAnswerLock[`${name}-${data.updateId}`];
            }
        });
        this.app.all("/sse", (req, res) => {
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.flushHeaders(); // flush the headers to establish SSE with client
            const name = req.headers["x-name"];
            const auth = req.headers["x-auth"];
            if (!name || !auth || typeof name === "object") {
                console.log("X-Name or X-Auth is null");
                res.end();
                return;
            }
            if (auth != this.config.authKey) {
                res.end();
                return;
            }
            const client = new SseClientHandler(req, res, this, name);
            this.clients[name] = client;
            let interValID = setInterval(() => {
                res.write(`data:\n\n`); // res.write() instead of res.send()
            }, 20000);
            // If client closes connection, stop sending events
            res.on("close", () => {
                clearInterval(interValID);
                res.end();
            });
            console.log(`Client Connected ${name}`);
        });
        return new Promise((resolve) => https_1.createServer({
            //TODO: absolute mu degil mi check et
            key: this.config.key,
            cert: this.config.cert,
            passphrase: this.config.passpharase
        }, this.app).listen(this.config.port, "0.0.0.0", (...args) => {
            //console.log(`SSE Server Listening at ${this.config.port}`);
            resolve(true);
        }));
    }
}
exports.SseServer = SseServer;
class SseClient extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.initDone = this.Init();
    }
    Init() {
        this.eventSource = new EventSource(`https://${this.config.host}:${this.config.port}/sse`, {
            headers: {
                "x-auth": this.config.authKey,
                "x-name": this.config.name
            }
        });
        this.eventSource.onmessage = (evt) => {
            this.emit("message", evt);
            if (evt.data) {
                const data = JSON.parse(evt.data);
                this.emit("data", data);
                if (data.type === "update") {
                    this.emit("update", data.update, (answer) => {
                        //send answer
                        node_fetch_1.default(`https://${this.config.host || "localhost"}:${this.config.port}/updateAnswer`, {
                            headers: {
                                "Content-Type": "application/json",
                                "x-name": this.config.name,
                                "x-auth": this.config.authKey
                            },
                            method: "POST",
                            body: JSON.stringify({
                                answer,
                                updateId: data.update.update_id
                            })
                        });
                    });
                }
            }
        };
        this.eventSource.onerror = (evt) => {
            this.emit("error", evt);
        };
        return new Promise((res) => {
            this.eventSource.onopen = () => {
                res(this);
            };
        });
    }
}
exports.SseClient = SseClient;
//# sourceMappingURL=Sse.js.map