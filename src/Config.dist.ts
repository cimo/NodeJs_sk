import * as Interface from "./Interface";

export const data: Interface.Config = {
    debug: process.env.NODEJS_DEBUG,
    ip: process.env.NODEJS_IP,
    cwd: process.env.HOME,
    env: process.env,
    socketIo: {
        domain: process.env.NODEJS_DOMAIN
    },
    port: {
        http: process.env.NODEJS_PORT_HTTP,
        https: process.env.NODEJS_PORT_HTTPS,
        vue: process.env.NODEJS_PORT_VUE,
        range: process.env.NODEJS_PORT_RANGE
    },
    certificate: {
        key: `/home/${process.env.WWW_USER_NAME}/root/certificate/${process.env.CERTIFICATE_KEY}`,
        cert: `/home/${process.env.WWW_USER_NAME}/root/certificate/${process.env.CERTIFICATE_FILE}`
    },
    digest: {
        realm: "Auth - Digest",
        path: `/home/${process.env.WWW_USER_NAME}/root${process.env.WEB_PATH}`,
        active: process.env.NODEJS_DIGEST
    },
    crypt: {
        key: process.env.NODEJS_CRYPT_KEY
    }
};
