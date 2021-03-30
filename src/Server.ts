import * as Fs from "fs";
import Express from "express";
import * as Http from "http";
import * as Https from "https";
import * as BodyParser from "body-parser";
import CookieParser from "cookie-parser";
import Cors from "cors";
import Csrf from "csurf";
import * as SocketIo from "socket.io";

import * as Interface from "./Interface";
import * as Config from "./Config";
import * as Helper from "./Helper";
import * as Sio from "./Sio";
import * as Terminal from "./Terminal";
import * as Vue from "./Vue";

const originList = [`http://${Config.data.socketIo.domain}`, `https://${Config.data.socketIo.domain}`, `http://${Config.data.socketIo.domain}:${Config.data.port.http}`, `https://${Config.data.socketIo.domain}:${Config.data.port.https}`];

if (Config.data.port.vue) {
    originList.push(`http://${Config.data.socketIo.domain}:${Config.data.port.vue}`);
}

if (Config.data.port.range) {
    const portRangeSplit = Config.data.port.range.split("-");
    const portRangeCount = parseInt(portRangeSplit[1]) - parseInt(portRangeSplit[0]);

    for (let i = 0; i <= portRangeCount; i++) {
        const port = parseInt(portRangeSplit[0]) + i;

        originList.push(`http://${Config.data.socketIo.domain}:${port}`);
        originList.push(`https://${Config.data.socketIo.domain}:${port}`);
    }
}

const corsOption: Interface.Cors = {
    origin: originList,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    optionsSuccessStatus: 200
};

const app = Express();
app.use(Express.static(Helper.pathStatic));
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
app.use(CookieParser());
app.use(Cors(corsOption));
app.use(Csrf({ cookie: true }));

app.get(
    "/",
    Helper.digestCheck((request, result) => {
        result.send("");
    })
);

const serverHttp = Http.createServer(app);
const serverHttps = Https.createServer(
    {
        key: Fs.readFileSync(Config.data.certificate.key),
        cert: Fs.readFileSync(Config.data.certificate.cert)
    },
    app
);

const socketIoServerHttp = new SocketIo.Server(serverHttp, {
    cors: {
        origin: corsOption.origin,
        methods: corsOption.methods
    },
    transports: ["websocket"],
    pingTimeout: 60000,
    pingInterval: 8000,
    cookie: false
});
const socketIoServerHttps = new SocketIo.Server(serverHttps, {
    cors: {
        origin: corsOption.origin,
        methods: corsOption.methods
    },
    transports: ["websocket"],
    pingTimeout: 60000,
    pingInterval: 8000,
    cookie: false
});

const portHttp = Config.data.port.http ? parseInt(Config.data.port.http) : 0;
const portHttps = Config.data.port.https ? parseInt(Config.data.port.https) : 0;

serverHttp.listen(portHttp, Config.data.ip, 0, () => {
    Helper.writeLog(`Listen on http://${Config.data.ip}:${Config.data.port.http}`);

    Vue.startup();
});
serverHttps.listen(portHttps, Config.data.ip, 0, () => {
    Helper.writeLog(`Listen on https://${Config.data.ip}:${Config.data.port.https}`);
});

// noinspection TypeScriptValidateTypes
socketIoServerHttp.on("connection", (socket: SocketIo.Socket) => {
    Terminal.socketEvent(socket, "http").then(() => {});

    Sio.startup(socketIoServerHttp, socket, "http").then(() => {});
});
// noinspection TypeScriptValidateTypes
socketIoServerHttps.on("connection", (socket: SocketIo.Socket) => {
    Terminal.socketEvent(socket, "https").then(() => {});

    Sio.startup(socketIoServerHttps, socket, "https").then(() => {});
});
