"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMsg = exports.asyncInterval = exports.streamToBuf = exports.GlobalEvents = exports._GlobalEvents = void 0;
const events_1 = require("events");
class _GlobalEvents extends events_1.EventEmitter {
}
exports._GlobalEvents = _GlobalEvents;
exports.GlobalEvents = new _GlobalEvents();
function streamToBuf(file) {
    const bufs = [];
    let res;
    const P = new Promise((r) => {
        res = r;
    });
    file.on("data", function (d) {
        bufs.push(d);
    });
    file.on("end", function () {
        const buf = Buffer.concat(bufs);
        res(buf);
    });
    return P;
}
exports.streamToBuf = streamToBuf;
function asyncInterval(fn, ms) {
    let stop = false;
    const ifn = () => {
        if (stop)
            return;
        fn().then((r) => setTimeout(ifn, ms));
    };
    setTimeout(ifn, ms);
    return () => {
        stop = true;
    };
}
exports.asyncInterval = asyncInterval;
function extractMsg(update) {
    if (update.message && update.message.text) {
        let msg = update.message.text;
        msg = msg.trim().toLowerCase();
        return msg;
    }
    else {
        return null;
    }
}
exports.extractMsg = extractMsg;
//# sourceMappingURL=Util.js.map