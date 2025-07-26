import express, { Express } from 'express';
import cors from 'cors';
import 'dotenv/config';
import mainRouter from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import './database/database';
import { startBackgroundJobs } from './services/cron.service';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    optionsSuccessStatus: 200,
    credentials: true
}));

app.use(express.json());
app.use('/api', mainRouter);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`✅ 服务器已成功启动，正在监听端口: ${PORT}`);
    console.log(`👉 API 入口地址: http://localhost:${PORT}/api`);
    startBackgroundJobs();
});