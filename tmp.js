import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'setting.json');

async function readJsonFile() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        console.log(jsonData.llmMain.url);
    } catch (err) {
        console.error('Error reading or parsing file:', err);
    }
}

readJsonFile();