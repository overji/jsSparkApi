import { DateTime } from 'luxon';
import CryptoJS from 'crypto-js';
import { URLSearchParams } from 'url';
import fs from 'fs/promises';
import path from 'path';

async function readJsonFile() {
    const filePath = path.join(process.cwd(), 'setting.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data).llmMain;
}

function getHTTPTime() {
    const curTime = DateTime.now();
    return curTime.toHTTP();
}

function getAuthorStr(url, getTarget, date) {
    let tmp = "host: " + url + "\n";
    tmp += "date: " + date + "\n";
    tmp += "GET " + getTarget + " HTTP/1.1";
    return tmp;
}

function AuthorizeStr(str, secret) {
    const utf8Str = CryptoJS.enc.Utf8.parse(str);
    const utf8Secret = CryptoJS.enc.Utf8.parse(secret);
    const tmpSign = CryptoJS.HmacSHA256(utf8Str, utf8Secret);
    return CryptoJS.enc.Base64.stringify(tmpSign);
}

function getAuth(url, getTarget, secret, apikey) {
    let time = getHTTPTime();
    let tmp = getAuthorStr(url, getTarget, time);
    let signature = AuthorizeStr(tmp, secret);
    let authorStr = `api_key='${apikey}', algorithm='hmac-sha256', headers='host date request-line', signature='${signature}'`;
    const utf8AuthorStr = CryptoJS.enc.Utf8.parse(authorStr);
    return CryptoJS.enc.Base64.stringify(utf8AuthorStr);
}

export async function getUrl() {
    const { url, getTarget, secret, apikey, wssUrl } = await readJsonFile();
    const my_date = getHTTPTime();
    const my_authorization = getAuth(url, getTarget, secret, apikey);
    const params = new URLSearchParams({
        authorization: my_authorization,
        date: my_date,
        host: url
    });
    return `${wssUrl}?${params.toString()}`;
}