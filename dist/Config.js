"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setting = void 0;
var setting = {
  debug: false,
  ip: "0.0.0.0",
  cwd: process.env.HOME,
  env: process.env,
  socketIo: {
    domain: "localhost"
  },
  port: {
    http: "1111",
    https: "1112"
  },
  certificate: {
    key: "/home/user_1/root/certificate/selfsign/Encrypted.key",
    cert: "/home/user_1/root/certificate/selfsign/Encrypted.crt"
  },
  digest: {
    realm: "Auth - Digest",
    path: "/home/user_1/root/project",
    enabled: false
  }
};
exports.setting = setting;