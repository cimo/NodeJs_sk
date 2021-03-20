import * as Path from "path";
import * as Fs from "fs";
import * as Crypto from "crypto";

import * as Interface from "./Interface";
import * as Config from "./Config";

const cryptAlgorithm = "aes-256-cbc";
const cryptKey = Crypto.createHash("sha256").update(String(Config.data.crypt.key)).digest("base64").substr(0, 32);
const cryptIv = Crypto.randomBytes(16);

export const urlRoot = `${Path.dirname(__dirname)}/dist`;

export const writeLog = (message: string): void => {
    if (Config.data.debug === "on") {
        Fs.appendFile(`${urlRoot}/debug.log`, `${message}\n`, () => {
            console.log(`writeLog => ${message}`);
        });
    }
};

export const digestCheck = (digest, callback: Interface.CallbackDigest): Interface.CallbackDigest => {
    if (Config.data.digest.active === "on") {
        return digest.check((req, res) => {
            callback.apply(this, [req, res]);
        });
    } else {
        return (req, res) => {
            callback.apply(this, [req, res]);
        };
    }
};

export const encrypt = (text: string): string => {
    if (text !== "") {
        const cipher = Crypto.createCipheriv(cryptAlgorithm, cryptKey, cryptIv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

        return cryptIv.toString("hex") + ":" + encrypted.toString("hex");
    }

    return "";
};

export const decrypt = (hex: string): string => {
    const hexSplit = hex.split(":");

    if (hexSplit.length == 2) {
        try {
            const decipher = Crypto.createDecipheriv(cryptAlgorithm, cryptKey, Buffer.from(hexSplit[0], "hex"));
            const decrypted = Buffer.concat([decipher.update(Buffer.from(hexSplit[1], "hex")), decipher.final()]);

            return decrypted.toString();
        } catch (error) {
            return "";
        }
    }

    return "";
};
