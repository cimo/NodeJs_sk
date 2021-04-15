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
const cryptKey: string = Crypto.createHash("sha256").update(String(Config.data.encryption.secret)).digest("base64").substr(0, 32);

const encryption = (): Buffer | undefined => {
    if (Config.data.encryption.key) {
        if (!Fs.existsSync(Config.data.encryption.key)) {
            const cryptIv: Buffer = Crypto.randomBytes(16);

            Fs.writeFileSync(Config.data.encryption.key, cryptIv);
        }

        return Fs.readFileSync(Config.data.encryption.key);
    }

    return undefined;
};

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
        const cryptIv = encryption();

        if (cryptIv) {
            const cipher = Crypto.createCipheriv(cryptAlgorithm, cryptKey, cryptIv);
            const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

            return encrypted.toString("hex");
        }
    }

    return "";
};

export const decrypt = (hex: string): string => {
    if (hex !== "") {
        const cryptIv = encryption();

        if (cryptIv) {
            const decipher = Crypto.createDecipheriv(cryptAlgorithm, cryptKey, Buffer.from(cryptIv.toString(), "hex"));
            const decrypted = Buffer.concat([decipher.update(Buffer.from(hex, "hex")), decipher.final()]);

            return decrypted.toString();
        }
    }

    return "";
};
