const fs = require('fs');
require('dotenv').config();

// 从 npm 继承环境变量
const KV_NAME = process.env.KV_BIND_VAR;

if (!KV_NAME) {
  console.error('请设置 KV_BIND_VAR 环境变量');
  process.exit(1);
}

// 读取并替换
let code = fs.readFileSync('src/sync.js', 'utf8');
code = code.replace(/__KV_BIND_VAR__/g, `${KV_NAME}`);
fs.writeFileSync('edge-functions/api/sync.js', code);

console.log('✅ 编译完成！最终代码');