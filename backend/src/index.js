require('dotenv').config();
const express = require('express');
const mainRouter = require('./routes');

const app = express();

app.use(express.json());

app.use('/api', mainRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`服务器已启动，正在监听 ${PORT} 端口...`);
});