import {getUrl} from './authorization.js';
import fs from "fs/promises";
import path from 'path';
import {logError, logInfo} from "./log.js";

const filePath = path.join(process.cwd(), "setting.json");
const data = await fs.readFile(filePath);
const jsonData = JSON.parse(data);
const appid = jsonData.llmMain.appid;
const domain = jsonData.llmMain.domain;
const requestUrl = await getUrl();

async function getRequest(header_text_arr) {
    const header = {
        header: {
            "app_id": appid,
            "uid": "12345"
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
                text: header_text_arr
            }
        }
    };
    const savePath = path.join(process.cwd(), "output_save/output_text.json");
    return new Promise((resolve, reject) => {
        try {
            const params = JSON.stringify(header);
            const ws = new WebSocket(requestUrl);
            let ans = {
                text: "",
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
            };

            ws.onopen = () => {
                logInfo('WebSocket connection opened');
                ws.send(params);
            };

            ws.onmessage = async (event) => {
                let jsonData = JSON.parse(event.data);
                if (jsonData.header.code !== 0) {
                    throw Error(`Error! Code:${jsonData.header.code} , Message: ${jsonData.header.message}`);
                }
                let jsonDataPayload = jsonData.payload;
                if (jsonDataPayload && !("invoked" in jsonDataPayload)) {
                    let texts = jsonDataPayload.choices.text;
                    for (let t of texts) {
                        ans.text += t.content;
                    }
                }
                if (jsonDataPayload && "usage" in jsonDataPayload) {
                    ans.prompt_tokens = jsonDataPayload.usage.text.prompt_tokens;
                    ans.completion_tokens = jsonDataPayload.usage.text.completion_tokens;
                    ans.total_tokens = jsonDataPayload.usage.text.total_tokens;
                    const header_text_Json = {
                        text: header_text_arr
                    };
                    let midJson = {
                        "role": "assistant",
                        "content": ans.text
                    };
                    header_text_arr.push(midJson);
                    await fs.writeFile(savePath, JSON.stringify(header_text_Json));
                    logInfo(ans.text);
                    logInfo(`Summary: Cost ${ans.prompt_tokens} tokens in prompt. ${ans.completion_tokens} tokens in completion. ${ans.total_tokens} in total.`);
                    resolve(ans);
                }
            };

            ws.onerror = (error) => {
                logError('WebSocket error: ' + error);
                reject(error);
            };

            ws.onclose = () => {
                logInfo('WebSocket connection closed');
            };
        } catch (error) {
            logError("Error: " + error);
            reject(error);
        }
    });
}

export async function llmSendSingleMessage(inputText) {
    const defaultSetting = [
        { "role": "system", "content": "你是一位擅长旅游及吃喝玩乐的达人,目标任务,根据我的需求提供相关的建议,需求说明,你有着丰富的旅游知识、吃喝玩乐计划，你给的建议贴合我的需求场景，且安排的非常合理、充实,风格设定,轻松愉快" },
        { "role": "user", "content": inputText },
    ]
    return getRequest(defaultSetting);
}

export async function llmSendJsonMessage(jsonPath,input_text) {
    const data = await fs.readFile(jsonPath, 'utf8');
    const jsonData = JSON.parse(data);
    const textArr = jsonData.text;
    textArr.push({
        role: "user",
        content: input_text
    })
    return getRequest(textArr);
}

export async function defaultLLMSendJsonMessage(inputText) {
    return llmSendJsonMessage(path.join(process.cwd(),"output_save/output_text.json"),inputText)
}

export async function resetInputInfo(){
    const filePath = path.join(process.cwd(),"output_save/output_text.json");
    await fs.writeFile(filePath,JSON.stringify({
        text : [
            { "role": "system", "content": "你是一位擅长旅游及吃喝玩乐的达人,目标任务,根据我的需求提供相关的建议,需求说明,你有着丰富的旅游知识、吃喝玩乐计划，你给的建议贴合我的需求场景，且安排的非常合理、充实,风格设定,轻松愉快" }
        ]
    })).catch(error=>{
        logError("Error in reset:" + error);
    })
    logInfo("Clear Input Prompt");
}

llmSendSingleMessage("我喜欢你")
