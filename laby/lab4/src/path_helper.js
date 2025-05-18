import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("/////");
console.log(path.basename(__filename));
console.log(path.basename(__dirname));

console.log("/////");
console.log(path.extname(__filename));
console.log(path.extname(__dirname));


console.log("/////");
console.log(path.parse(__filename));

console.log("/////");
console.log(path.format(path.parse(__filename)));


console.log("/////");
console.log(path.isAbsolute(path.basename(__filename)));


console.log(path.join("/folder1", "folder2", "../index.html"));

console.log("/////");
console.log(path.join(__dirname, "folder2", "index.html"));

console.log("/////////////");
console.log(path.resolve("/folder1", "folder2", "index.html"));

console.log("/////");
console.log(path.resolve(__dirname, "folder2", "index.html"));