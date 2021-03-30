import * as SocketIo from "socket.io";

import * as Helper from "./Helper";

let connectionCount = 0;

const serverTime = (socket: SocketIo.Socket): void => {
    const currentDate = new Date();

    let month = currentDate.getMonth() + 1;
    month = parseInt(month < 10 ? `0${month}` : `${month}`);

    let day = currentDate.getDate();
    day = parseInt(day < 10 ? `0${day}` : `${day}`);

    const date = `${currentDate.getFullYear()}/${month}/${day}`;

    let minute = currentDate.getMinutes();
    minute = parseInt(minute < 10 ? `0${minute}` : `${minute}`);

    const time = `${currentDate.getHours()}:${minute}`;

    socket.emit("serverTime", `${date} ${time}`);
};

export const startup = async (server: SocketIo.Server, socket: SocketIo.Socket, type: string): Promise<void> => {
    const address = JSON.stringify(socket.handshake.address);

    Helper.writeLog(`${address} connected to ${type} server.`);

    connectionCount++;

    server.emit("broadcast", `${connectionCount} clients connected to ${type} server.` as any);

    const intervalEvent = setInterval(() => {
        serverTime(socket);
    }, 1000);

    socket.emit("message", `Connected to ${type} server.`);

    socket.on("disconnect", () => {
        Helper.writeLog(`${address} disconnected from ${type} client.`);

        connectionCount--;

        server.emit("broadcast", `${connectionCount} clients disconnected from ${type} server.` as any);

        if (connectionCount === 0) {
            clearInterval(intervalEvent);
        }

        socket.emit("message", `Disconnected from ${type} server.`);
    });
};
