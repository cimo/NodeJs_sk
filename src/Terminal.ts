import * as Os from "os";
import * as Fs from "fs";
import * as Path from "path";
import * as Pty from "node-pty";
import * as ChildProcess from "child_process";
import * as SocketIo from "socket.io";

import * as Interface from "./Interface";
import * as Config from "./Config";
import * as Helper from "./Helper";

const writeStreamEncoding = "utf-8";

const eventPty = (socket: SocketIo.Socket): void => {
    const ptySpawnList = [];

    socket.on("t_pty_start", (dataStart: Interface.Socket) => {
        if (dataStart.tag) {
            Helper.writeLog(`Terminal ${dataStart.tag} start`);

            const shell = Os.platform() === "win32" ? "powershell.exe" : "bash";

            if (dataStart.size) {
                ptySpawnList[dataStart.tag] = Pty.spawn(shell, [], {
                    name: "xterm-color",
                    cols: dataStart.size[0],
                    rows: dataStart.size[1],
                    cwd: Config.data.cwd,
                    env: Config.data.env
                });
            }

            ptySpawnList[dataStart.tag].on("data", (data: Interface.Socket) => {
                Helper.writeLog(`Terminal t_pty_o_${dataStart.tag} => ${data}`);

                socket.emit(`t_pty_o_${dataStart.tag}`, { tag: dataStart.tag, cmd: data });
            });

            ptySpawnList[dataStart.tag].on("exit", () => {
                if (dataStart.tag && ptySpawnList[dataStart.tag]) {
                    Helper.writeLog(`Terminal t_pty_o_${dataStart.tag} => xterm_reset`);

                    socket.emit(`t_pty_o_${dataStart.tag}`, { tag: dataStart.tag, cmd: "xterm_reset" });

                    ptySpawnList[dataStart.tag].destroy();

                    delete ptySpawnList[dataStart.tag];
                }
            });
        }
    });

    socket.on("t_pty_i", (data: Interface.Socket) => {
        if (data.tag && data.cmd && ptySpawnList[data.tag]) {
            Helper.writeLog(`Terminal t_pty_i => ${data.tag} - ${data.cmd}`);

            ptySpawnList[data.tag].write(data.cmd);
        }
    });

    socket.on("t_pty_resize", (data: Interface.Socket) => {
        if (data.tag && data.size && ptySpawnList[data.tag]) {
            Helper.writeLog(`Terminal t_pty_resize => ${data.tag}`);

            ptySpawnList[data.tag].resize(data.size[0], data.size[1]);
        }
    });

    socket.on("t_pty_close", (data: Interface.Socket) => {
        if (data.tag && ptySpawnList[data.tag]) {
            Helper.writeLog(`Terminal t_pty_close => ${data.tag}`);

            ptySpawnList[data.tag].destroy();

            delete ptySpawnList[data.tag];
        }
    });
};

const eventExec = (socket: SocketIo.Socket): void => {
    socket.on("t_exec_i", (dataStart: Interface.Socket) => {
        if (dataStart.tag && dataStart.cmd) {
            Helper.writeLog(`Terminal t_exec_i => ${dataStart.tag} - ${dataStart.cmd}`);

            const execResult = ChildProcess.exec(dataStart.cmd);

            if (execResult && execResult.stdout && execResult.stderr) {
                execResult.stdout.on("data", (data: string) => {
                    Helper.writeLog(`t_exec_o_${dataStart.tag} => stdout: ${data}`);

                    socket.emit(`t_exec_o_${dataStart.tag}`, { out: data });
                });

                execResult.stderr.on("data", (data: string) => {
                    Helper.writeLog(`t_exec_o_${dataStart.tag} => stderr: ${data}`);

                    socket.emit(`t_exec_o_${dataStart.tag}`, { err: data });
                });

                if (dataStart.closeActive) {
                    execResult.on("close", (data: string) => {
                        Helper.writeLog(`t_exec_o_${dataStart.tag} => close: ${data}`);

                        socket.emit(`t_exec_o_${dataStart.tag}`, { close: data });
                    });
                }
            }
        }
    });

    socket.on("t_exec_stream_i", (dataStart: Interface.Socket) => {
        if (dataStart.tag && dataStart.cmd && dataStart.path) {
            Helper.writeLog(`Terminal t_exec_stream_i => ${dataStart.tag} - ${dataStart.cmd} - ${dataStart.path} - ${dataStart.content}`);

            const directory = Path.dirname(dataStart.path);

            if (Fs.existsSync(directory)) {
                if (dataStart.cmd === "write" && dataStart.content) {
                    const stream = Fs.createWriteStream(dataStart.path, { flags: "w", encoding: writeStreamEncoding, mode: 0o0664 });

                    stream.write(dataStart.content);

                    stream.end();

                    stream.on("finish", () => {
                        Helper.writeLog(`Write t_exec_stream_o_${dataStart.tag} => finish`);

                        socket.emit(`t_exec_stream_o_${dataStart.tag}`, { chunk: "end" });
                    });
                } else if (dataStart.cmd === "read") {
                    if (Fs.existsSync(dataStart.path)) {
                        const stream = Fs.createReadStream(dataStart.path, { flags: "r", encoding: writeStreamEncoding });

                        stream.on("data", (data: string) => {
                            const chunk = data.toString();

                            Helper.writeLog(`Read t_exec_stream_o_${dataStart.tag} => ${chunk}`);

                            socket.emit(`t_exec_stream_o_${dataStart.tag}`, { chunk: chunk });
                        });

                        stream.on("close", () => {
                            Helper.writeLog(`Read t_exec_stream_o_${dataStart.tag} => close`);

                            socket.emit(`t_exec_stream_o_${dataStart.tag}`, { chunk: "end" });
                        });
                    }
                }
            }
        }
    });
};

const eventCrypt = (socket: SocketIo.Socket): void => {
    socket.on("t_crypt_encrypt_i", (dataStart: Interface.Socket) => {
        if (dataStart.tag && (dataStart.text === "" || dataStart.text)) {
            Helper.writeLog(`Execute t_crypt_encrypt_i => ${dataStart.tag} - ${dataStart.text}`);

            socket.emit(`t_crypt_encrypt_o_${dataStart.tag}`, { out: Helper.encrypt(dataStart.text) });
        }
    });

    socket.on("t_crypt_decrypt_i", (dataStart: Interface.Socket) => {
        if (dataStart.tag && (dataStart.hex === "" || dataStart.hex)) {
            Helper.writeLog(`Execute t_crypt_decrypt_i => ${dataStart.tag} - ${dataStart.hex}`);

            socket.emit(`t_crypt_decrypt_o_${dataStart.tag}`, { out: Helper.decrypt(dataStart.hex) });
        }
    });
};

export const socketEvent = (socket: SocketIo.Socket, type: string): void => {
    Helper.writeLog(`Terminal listen on ${type}`);

    eventPty(socket);

    eventExec(socket);

    eventCrypt(socket);
};
