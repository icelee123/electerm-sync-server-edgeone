const fs = require('fs');
require('dotenv').config();

const KV_NAME = process.env.KV_BIND_VAR;

if (!KV_NAME) {
  console.error('please set KV_BIND_VAR');
  process.exit(1);
}

// 读取并替换
let code = fs.readFileSync('src/sync.js', 'utf8');
code = code.replace(/__KV_BIND_VAR__/g, `${KV_NAME}`);
fs.writeFileSync('edge-functions/api/sync.js', code);

console.log('✅ Build Success!');