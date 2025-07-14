const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mainRouter = require('./src/routes');

const app = express();

app.use(express.json());

app.use('/api', mainRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器已启动，正在监听 ${PORT} 端口...`);
});