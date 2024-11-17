import fs from 'fs/promises'
import path from 'path'
import {DateTime} from "luxon";


const storageDirectory = path.join(process.cwd(),"output_log/");

async function log(log_info) {
    try{
        await fs.access(storageDirectory);
    } catch {
        await fs.mkdir("output_log");
    }
    console.log(log_info);
    log_info += '\n';
    let now = DateTime.now();
    let fTime = now.toFormat("yyyy-LLL-dd");
    const log_path = path.join(storageDirectory, `${fTime}_log.log`);

    try {
        await fs.access(log_path);
        await fs.appendFile(log_path, log_info);
    } catch {
        await fs.writeFile(log_path, log_info);
    }
}
export async function logInfo(info){
    let now = DateTime.now();
    let fTime = now.toFormat("yyyy-LLL-dd HH:mm:ss");
    let log_info = `[INFO] ${fTime} ${info}`;
    log(log_info);
}

export async function logError(error){
    let now = DateTime.now();
    let fTime = now.toFormat("yyyy-LLL-dd HH:mm:ss")
    let log_info = `[INFO] ${fTime} ${error}`;
    log(log_info);
}

log("a")
