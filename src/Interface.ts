export interface Config {
    debug: string | undefined;
    ip: string | undefined;
    pathStatic: string | undefined;
    cwd: string | undefined;
    env: any | undefined;
    socketIo: {
        domain: string | undefined;
    };
    port: {
        http: string | undefined;
        https: string | undefined;
        vue: string | undefined;
        range: string | undefined;
    };
    certificate: {
        key: string;
        cert: string;
    };
    digest: {
        realm: string;
        path: string;
        active: string | undefined;
    };
    encryption: {
        secret: string | undefined;
        key: string | undefined;
    };
}

export interface Socket {
    tag?: string;
    cmd?: string;
    out?: string;
    err?: string;
    close?: string | number;
    chunk?: string;
    sizeList?: number[];
    content?: string;
    path?: string;
    hex?: string;
    text?: string;
    closeActive?: boolean;
}

export interface Cors {
    originList: string[];
    methodList: string[];
    optionsSuccessStatus: number;
}

export interface CallbackDigest {
    (self: any, [req, res]: any): void;
}
