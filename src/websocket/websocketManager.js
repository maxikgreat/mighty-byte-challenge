import { v4 as uuidv4 } from 'uuid';
import WebSocket, { WebSocketServer } from 'ws';

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clientRegistry = new Map();
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection established');

      ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === "connect") {
          this.handleNewClient(ws)
        } else if (data.type === 'reconnect' && data.clientId) {
          this.handleReconnect(ws, data.clientId);
        } else if (data.type === 'acknowledgment' && data.deliveryId) {
          this.handleAcknowledgment(ws, data.deliveryId);
        }
      });

      ws.on('close', () => {
        console.log(`Client ${ws.clientId} disconnected`);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  handleReconnect(ws, clientId) {
    if (this.clientRegistry.has(clientId)) {
      ws.clientId = clientId;
      console.log(`Client ${clientId} reconnected`);
      
      const clientData = this.clientRegistry.get(clientId);
      clientData.connection = ws; 
      
      this.resendUndeliveredMessages(clientData, clientId);
    } else {
      this.handleNewClient(ws);
    }
  }

  handleNewClient(ws) {
    ws.clientId = uuidv4();
    console.log(`New client assigned ID: ${ws.clientId}`);
    
    this.clientRegistry.set(ws.clientId, {
      connection: ws,
      undeliveredMessages: []
    });
    
    ws.send(JSON.stringify({
      type: 'client_id',
      clientId: ws.clientId,
      timestamp: new Date().toISOString()
    }));
  }

  handleAcknowledgment(ws, deliveryId) {
    console.log(`Received acknowledgment for delivery ${deliveryId}`);
    
    if (ws.clientId && this.clientRegistry.has(ws.clientId)) {
      const clientData = this.clientRegistry.get(ws.clientId);
      clientData.undeliveredMessages = clientData.undeliveredMessages.filter(
        msg => msg.deliveryId !== deliveryId
      );
    }
    
    ws.send(JSON.stringify({
      type: 'acknowledgment_received',
      deliveryId,
      timestamp: new Date().toISOString()
    }));
  }

  resendUndeliveredMessages(clientData, clientId) {
    if (clientData.undeliveredMessages.length > 0) {
      console.log(`Resending ${clientData.undeliveredMessages.length} undelivered messages to ${clientId}`);
      
      clientData.undeliveredMessages.forEach(message => {
        clientData.connection.send(JSON.stringify(message));
      });
    }
  }

  async sendShortenedUrl(shortenedUrl, clientId) {
    const message = {
      type: 'shortened_url',
      deliveryId: uuidv4(),
      shortenedURL: shortenedUrl,
      timestamp: new Date().toISOString()
    };
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    if (this.clientRegistry.has(clientId)) {
      const clientData = this.clientRegistry.get(clientId);
      
      if (clientData.connection && clientData.connection.readyState === WebSocket.OPEN) {
        clientData.connection.send(JSON.stringify(message));
        
        const acknowledged = await this.waitForAcknowledgment(clientData.connection, message.deliveryId, 5000);

        if (!acknowledged) {
          clientData.undeliveredMessages.push(message);
          console.log(`Stored undelivered message for client ${clientId}`);
        } else {
          console.log(`Shortened URL delivered successfully: ${shortenedUrl}`);
        }
      } else {
        clientData.undeliveredMessages.push(message);
        console.log(`Client ${clientId} disconnected, stored message for later delivery`);
      }
    } else {
      console.log(`Client ${clientId} not found`);
    }
  }

  async waitForAcknowledgment(targetClient, deliveryId, timeoutMs = 5000) {
    return new Promise((resolve) => {
      const ackListener = (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'acknowledgment' && parsed.deliveryId === deliveryId) {
          clearTimeout(timeoutId);
          targetClient.removeListener('message', ackListener);
          resolve(true);
        }
      };

      const timeoutId = setTimeout(() => {
        targetClient.removeListener('message', ackListener);
        resolve(false);
      }, timeoutMs);

      targetClient.on('message', ackListener);
    });
  }
}

export const webSocketManager = new WebSocketManager();