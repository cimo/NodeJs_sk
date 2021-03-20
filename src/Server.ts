import * as Fs from "fs";
import Express from "express";
import * as Http from "http";
import * as Https from "https";
import * as BodyParser from "body-parser";
import CookieParser from "cookie-parser";
import * as HttpAuth from "http-auth";
import Cors from "cors";
import Csrf from "csurf";
import { Server as ServerIo, Socket as SocketIo } from "socket.io";

import * as Config from "./Config";
import * as Helper from "./Helper";
import * as Sio from "./Sio";
import * as Terminal from "./Terminal";
import * as Vue from "./Vue";

const certificate = {
    key: Fs.readFileSync(Config.data.certificate.key),
    cert: Fs.readFileSync(Config.data.certificate.cert)
};

const httpAuthOption = HttpAuth.digest({
    realm: Config.data.digest.realm,
    file: `${Config.data.digest.path}/.digest_htpasswd`
});

const originList = [`http://${Config.data.socketIo.domain}:${Config.data.port.http}`, `https://${Config.data.socketIo.domain}:${Config.data.port.https}`];

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

const corsOption = {
    origin: originList,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    optionsSuccessStatus: 200
};

const app = Express();

app.use(Express.static(Helper.urlRoot));
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
app.use(CookieParser());
app.use(Cors(corsOption));
app.use(Csrf({ cookie: true }));

const serverHttp = Http.createServer(app);
const serverHttps = Https.createServer(certificate, app);

const socketIoServerHttp = new ServerIo(serverHttp, {
    cors: {
        origin: corsOption.origin,
        methods: corsOption.methods
    },
    cookie: false
});
const socketIoServerHttps = new ServerIo(serverHttps, {
    cors: {
        origin: corsOption.origin,
        methods: corsOption.methods
    },
    cookie: false
});

app.get(
    "/",
    Helper.digestCheck(httpAuthOption, (request, result) => {
        result.send("");
    })
);

const portHttp = Config.data.port.http ? parseInt(Config.data.port.http) : 0;
const portHttps = Config.data.port.https ? parseInt(Config.data.port.https) : 0;

serverHttp.listen(portHttp, Config.data.ip, 0, () => {
    Helper.writeLog(`Listen on http://${Config.data.ip}:${Config.data.port.http}`);

    Vue.startup();
});
serverHttps.listen(portHttps, Config.data.ip, 0, () => {
    Helper.writeLog(`Listen on https://${Config.data.ip}:${Config.data.port.https}`);
});

socketIoServerHttp.on("connection", (socket: SocketIo) => {
    Sio.startup(socketIoServerHttp, socket, "http");

    Terminal.socketEvent(socket, "http");
});
socketIoServerHttps.on("connection", (socket: SocketIo) => {
    Sio.startup(socketIoServerHttps, socket, "https");

    Terminal.socketEvent(socket, "https");
});
