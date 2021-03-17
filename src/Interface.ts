export interface DigestCallback {
    (self: any, [req, res]: any): void;
}

export interface SocketData {
    tag?: string;
    cmd?: string;
    out?: string;
    err?: string;
    close?: string | number;
    chunk?: string;
    size?: number[];
    content?: string;
    path?: string;
    hex?: string;
    text?: string;
    closeEnabled?: boolean;
}

export interface EnvData {
    crypt: {
        key: string;
    };
}

export interface SettingData {
    debug: boolean;
    ip: string;
    cwd: string | undefined;
    env: any | undefined;
    socketIo: {
        domain: string;
    };
    port: {
        http: string;
        https: string;
    };
    certificate: {
        key: string;
        cert: string;
    };
    digest: {
        realm: string;
        path: string;
        enabled: boolean;
    };
}
