import * as Path from "path";
import * as Fs from "fs";
import * as HttpAuth from "http-auth";
import * as Crypto from "crypto";

import * as Interface from "./Interface";
import * as Config from "./Config";

const httpAuth = HttpAuth.digest({
    realm: Config.data.digest.realm,
    file: `${Config.data.digest.path}/.digest_htpasswd`
});
const cryptAlgorithm = "aes-256-cbc";
const cryptKey: string = Crypto.createHash("sha256").update(String(Config.data.crypt.key)).digest("base64").substr(0, 32);
const cryptIv: Buffer = Crypto.randomBytes(16);

export const pathStatic = `${Path.dirname(__dirname)}${Config.data.pathStatic}`;

export const writeLog = (message: string): void => {
    if (Config.data.debug === "on") {
        Fs.appendFile(`${pathStatic}/debug.log`, `${message}\n`, () => {
            console.log(`writeLog => ${message}`);
        });
    }
};

export const digestCheck = (callback: Interface.CallbackDigest): Interface.CallbackDigest => {
    if (Config.data.digest.active === "on") {
        return httpAuth.check((req, res) => {
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
