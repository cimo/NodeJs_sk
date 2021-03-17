"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var Fs = _interopRequireWildcard(require("fs"));

var Path = _interopRequireWildcard(require("path"));

var _express = _interopRequireDefault(require("express"));

var Http = _interopRequireWildcard(require("http"));

var Https = _interopRequireWildcard(require("https"));

var BodyParser = _interopRequireWildcard(require("body-parser"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var HttpAuth = _interopRequireWildcard(require("http-auth"));

var _cors = _interopRequireDefault(require("cors"));

var _csurf = _interopRequireDefault(require("csurf"));

var _socket = require("socket.io");

var Config = _interopRequireWildcard(require("./Config"));

var Helper = _interopRequireWildcard(require("./Helper"));

var Sio = _interopRequireWildcard(require("./Sio"));

var Terminal = _interopRequireWildcard(require("./Terminal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var urlRoot = "".concat(Path.dirname(__dirname), "/dist");
var certificate = {
  key: Fs.readFileSync(Config.setting.certificate.key),
  cert: Fs.readFileSync(Config.setting.certificate.cert)
};
var httpAuthOption = HttpAuth.digest({
  realm: Config.setting.digest.realm,
  file: "".concat(Config.setting.digest.path, "/.digest_htpasswd")
});
var corsOption = {
  origin: ["http://".concat(Config.setting.socketIo.domain)],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  optionsSuccessStatus: 200
};
var app = (0, _express["default"])();
app.use(_express["default"]["static"](urlRoot));
app.use(BodyParser.urlencoded({
  extended: false
}));
app.use(BodyParser.json());
app.use((0, _cookieParser["default"])());
app.use((0, _cors["default"])(corsOption));
app.use((0, _csurf["default"])({
  cookie: true
}));
var serverHttp = Http.createServer(app);
var serverHttps = Https.createServer(certificate, app);
var socketIoServerHttp = new _socket.Server(serverHttp, {
  cors: {
    origin: ["http://".concat(Config.setting.socketIo.domain)],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
  },
  cookie: false
});
var socketIoServerHttps = new _socket.Server(serverHttps, {
  cors: {
    origin: ["https://".concat(Config.setting.socketIo.domain)],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"]
  },
  cookie: false
});
app.get("/", Helper.digestCheck(httpAuthOption, function (request, result) {
  result.send("");
}));
var portHttp = Config.setting.port.http ? parseInt(Config.setting.port.http) : 0;
var portHttps = Config.setting.port.https ? parseInt(Config.setting.port.https) : 0;
serverHttp.listen(portHttp, Config.setting.ip, 0, function () {
  Helper.writeLog("Listen on http://".concat(Config.setting.ip, ":").concat(Config.setting.port.http));
});
serverHttps.listen(portHttps, Config.setting.ip, 0, function () {
  Helper.writeLog("Listen on https://".concat(Config.setting.ip, ":").concat(Config.setting.port.https));
});
socketIoServerHttp.on("connection", function (socket) {
  Sio.startup(socketIoServerHttp, socket, "http");
  Terminal.socketEvent(socket, "http");
});
socketIoServerHttps.on("connection", function (socket) {
  Sio.startup(socketIoServerHttps, socket, "https");
  Terminal.socketEvent(socket, "https");
});