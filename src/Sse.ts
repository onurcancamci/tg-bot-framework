import * as express from "express";
import * as bodyParser from "body-parser";
import { createServer } from "https";
import * as EventSource from "eventsource";
import { EventEmitter } from "events";
import TelegramBot = require("node-telegram-bot-api");
import { default as fetch } from "node-fetch";

export interface ISseConfigClient extends ISseConfigBase {
  host: string;
  name: string;
}
export interface ISseConfigServer extends ISseConfigBase {
  key: string;
  cert: string;
  passpharase: string;
}
export interface ISseConfigBase {
  authKey: string;
  port: number;
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export type SseData = SseDataUpdate;

export interface SseDataUpdate {
  type: "update";
  update: TelegramBot.Update;
}

export class SseClientHandler {
  constructor(
    public req: express.Request,
    public res: express.Response,
    public parent: SseServer,
    public name: string
  ) {}

  send_error = false;

  Send(msg: SseData) {
    try {
      this.res.write(`data: ${JSON.stringify(msg)}\n\n`); // res.write() instead of res.send()
    } catch (ex) {
      this.send_error = true;
    }
  }

  SendUpdate(update: TelegramBot.Update) {
    return new Promise((res) => {
      this.parent.updateAnswerLock[`${this.name}-${update.update_id}`] = res;
      this.Send({ type: "update", update });
      setTimeout(() => {
        if (this.parent.updateAnswerLock[`${this.name}-${update.update_id}`]) {
          delete this.parent.updateAnswerLock[
            `${this.name}-${update.update_id}`
          ];
          res(false);
        }
      }, 3000);
    });
  }
}

export class SseServer {
  initDone: Promise<any>;
  clients: Record<string, SseClientHandler> = {};
  app: express.Application;
  updateAnswerLock: Record<string, Function> = {};

  constructor(public config: ISseConfigServer) {
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
      const data: { answer: boolean; updateId: number } = req.body;
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
    return new Promise((resolve) =>
      createServer(
        {
          //TODO: absolute mu degil mi check et
          key: this.config.key,
          cert: this.config.cert,
          passphrase: this.config.passpharase
        },
        this.app
      ).listen(this.config.port, "0.0.0.0", (...args: any[]) => {
        //console.log(`SSE Server Listening at ${this.config.port}`);
        resolve(true);
      })
    );
  }
}

export declare interface SseClient {
  on(
    event: "update",
    listener: (
      update: TelegramBot.Update,
      ans: (answer: boolean) => void
    ) => any
  ): this;
  on(event: "message", listener: (evt: MessageEvent) => any): this;
  on(event: "data", listener: (evt: SseData) => any): this;
}

export class SseClient extends EventEmitter {
  eventSource?: EventSource;
  initDone: Promise<any>;

  constructor(public config: ISseConfigClient) {
    super();
    this.initDone = this.Init();
  }
  Init() {
    this.eventSource = new EventSource(
      `https://${this.config.host}:${this.config.port}/sse`,
      {
        headers: {
          "x-auth": this.config.authKey,
          "x-name": this.config.name
        }
      }
    );
    this.eventSource.onmessage = (evt) => {
      this.emit("message", evt);
      if (evt.data) {
        const data: SseData = JSON.parse(evt.data);
        this.emit("data", data);
        if (data.type === "update") {
          this.emit("update", data.update, (answer: boolean) => {
            //send answer
            fetch(
              `https://${this.config.host || "localhost"}:${
                this.config.port
              }/updateAnswer`,
              {
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
              }
            );
          });
        }
      }
    };
    this.eventSource.onerror = (evt) => {
      this.emit("error", evt);
    };
    return new Promise((res) => {
      this.eventSource!.onopen = () => {
        res(this);
      };
    });
  }
}
