import express from 'express';
import { generateShortCode } from '../utils/shortCodeGenerator.js';
import { urlStorage } from '../storage/urlStorage.js';
import { webSocketManager } from '../websocket/websocketManager.js';
import { normalizeUrl } from '../utils/normalizeUrl.js';

const router = express.Router();

router.post('/url', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
      normalizeUrl(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const shortCode = generateShortCode();
    const normalizedUrl = normalizeUrl(url);
    
    await urlStorage.save(shortCode, normalizedUrl);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const shortenedUrl = `${baseUrl}/${shortCode}`;
    
    console.log(`URL shortened: ${normalizedUrl} -> ${shortenedUrl}`);
    
    const clientId = req.headers['x-client-id'];
    
    res.status(200).json({ 
      message: 'URL processing started',
    });

    webSocketManager.sendShortenedUrl(shortenedUrl, clientId)
  } catch (error) {
    console.error('Error in POST /url:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    if (!shortCode || shortCode.length !== 5) {
      return res.status(400).json({ error: 'Invalid short code format' });
    }

    const originalUrl = await urlStorage.get(shortCode);
    
    if (!originalUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    return res.json({ url: originalUrl });
  } catch (error) {
    console.error('Error in GET /:shortCode:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router };
