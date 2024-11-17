import { getUrl } from './authorization.js';
import fs from "fs/promises";
import path from 'path';

const filePath = path.join(process.cwd(), "setting.json");
const data = await fs.readFile(filePath);
const jsonData = JSON.parse(data);
const appid = jsonData.llmMain.appid;
const domain = jsonData.llmMain.domain;
const requestUrl = await getUrl();

function initHeader() {
    let header = {
        header: {
            "app_id": appid,
            "uid": "12345" // 官方说这个用于后续扩展，不用改
        },
        parameter: {
            chat: {
                domain: domain,
                temperature: 0.5,
                max_tokens: 1024
            }
        },
        payload: {
            message: {
                text: [
                    // 如果传入 system 参数，需要保证第一条是 system
                    { "role": "system", "content": "你现在扮演李白，你豪情万丈，狂放不羁；接下来请用李白的口吻和用户对话。" },
                    { "role": "user", "content": "你是谁" },
                ]
            }
        }
    };
    return header;
}

async function getRequest() {
    try {
        console.log(requestUrl); // Ensure the URL is correct
        const response = await fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(initHeader())
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log("Error: ", error);
    }
}

getRequest();