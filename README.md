# 1.运行
1. 首先根据下面的指示，填充好settings.json
2. 本地运行需要先下载package.json文件中用到的包，直接输入`npm i`下载即可
3. 输入如`D:\nodejs\node.exe llmMain.js`的shell指令，运行API
4. 本API也支持从别的文件中调用，注意`export`关键字


# 2.settings.json填充
```json
{
  "llmMain": {
    "url": "spark-api.xf-yun.com",
    "getTarget": "/v4.0/chat",
    "secret": "xxx",
    "apikey": "xxx",
    "wssUrl": "wss://spark-api.xf-yun.com/v4.0/chat",
    "appid" : "xxx",
    "domain" : "4.0Ultra"
  }
}
```
在其中填入你在<a href="https://console.xfyun.cn/">讯飞开放平台控制台</a>上面获取的
- "secret":APISecret
- "apiket":APIKey
- "appid":APPID   
注意请根据使用的API版本更换url、getTarget等!
