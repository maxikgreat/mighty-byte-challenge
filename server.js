import express from 'express';
import http from 'http';
import cors from 'cors';
import { router } from './src/routes/urlRoutes.js';
import { webSocketManager } from './src/websocket/websocketManager.js';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

webSocketManager.initialize(server);

app.use('/', router);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
