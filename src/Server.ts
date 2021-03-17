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

const certificate = {
    key: Fs.readFileSync(Config.setting.certificate.key),
    cert: Fs.readFileSync(Config.setting.certificate.cert)
};

const httpAuthOption = HttpAuth.digest({
    realm: Config.setting.digest.realm,
    file: `${Config.setting.digest.path}/.digest_htpasswd`
});

const corsOption = {
    origin: [`http://${Config.setting.socketIo.domain}`],
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
        origin: [`http://${Config.setting.socketIo.domain}`],
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
    },
    cookie: false
});
const socketIoServerHttps = new ServerIo(serverHttps, {
    cors: {
        origin: [`https://${Config.setting.socketIo.domain}`],
        methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
    },
    cookie: false
});

app.get(
    "/",
    Helper.digestCheck(httpAuthOption, (request, result) => {
        result.send("");
    })
);

const portHttp = Config.setting.port.http ? parseInt(Config.setting.port.http) : 0;
const portHttps = Config.setting.port.https ? parseInt(Config.setting.port.https) : 0;

serverHttp.listen(portHttp, Config.setting.ip, 0, () => {
    Helper.writeLog(`Listen on http://${Config.setting.ip}:${Config.setting.port.http}`);
});
serverHttps.listen(portHttps, Config.setting.ip, 0, () => {
    Helper.writeLog(`Listen on https://${Config.setting.ip}:${Config.setting.port.https}`);
});

socketIoServerHttp.on("connection", (socket: SocketIo) => {
    Sio.startup(socketIoServerHttp, socket, "http");

    Terminal.socketEvent(socket, "http");
});
socketIoServerHttps.on("connection", (socket: SocketIo) => {
    Sio.startup(socketIoServerHttps, socket, "https");

    Terminal.socketEvent(socket, "https");
});
