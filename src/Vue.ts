import * as ChildProcess from "child_process";

import * as Config from "./Config";
import * as Helper from "./Helper";

export const startup = (): void => {
    if (Config.data.port.vue) {
        ChildProcess.exec(`vue ui --headless --host ${Config.data.ip} --port ${Config.data.port.vue}`, (error, stdout, stderr) => {
            if (error) {
                Helper.writeLog(`Vue error => ${error}`);
            } else {
                Helper.writeLog(`Vue output => ${stdout} - ${stderr}`);
            }
        });
    }
};
