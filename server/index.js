const express = require('express');
const path = require('path');
const http = require('http');
const { WebSocketServer } = require('ws');
const { listModels, generateWebsite } = require('./ollama');
const { createZip } = require('./generator');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Serve static files from the 'web' and 'preview' directories
app.use(express.static(path.join(__dirname, '../web')));
app.use('/preview', express.static(path.join(__dirname, '../preview')));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// API endpoint to get the list of available Ollama models
app.get('/api/models', async (req, res) => {
  try {
    const models = await listModels();
    res.json(models);
  } catch (error) {
    console.error('Failed to fetch models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// API endpoint to generate the website
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt || !model) {
      return res.status(400).json({ error: 'Prompt and model are required.' });
    }
    await generateWebsite(prompt, model, (progress) => {
        broadcast({ type: 'progress', data: progress });
    });
    broadcast({ type: 'generationComplete', data: '/preview/index.html' });
    res.json({ success: true, message: 'Website generated successfully.' });
  } catch (error) {
    console.error('Error during website generation:', error);
    broadcast({ type: 'error', data: 'Failed to generate website.' });
    res.status(500).json({ error: 'Failed to generate website.' });
  }
});

// API endpoint to download the website as a ZIP file
app.get('/api/download', async (req, res) => {
    try {
        const zip = await createZip();
        res.setHeader('Content-Disposition', 'attachment; filename=website.zip');
        res.setHeader('Content-Type', 'application/zip');
        res.send(zip);
    } catch (error) {
        console.error('Failed to create ZIP:', error);
        res.status(500).send('Failed to create ZIP');
    }
});

// Function to open the browser
const openBrowser = (url) => {
    const start = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
    exec(start + ' ' + url);
}

// Start the server
server.listen(port, () => {
    // Clear console and show banner
    console.clear();
    console.log('\x1b[36m%s\x1b[0m', `
██████╗  ██████╗ ██████╗  ██████╗██╗      ██████╗ ██╗   ██╗██████╗ 
██╔══██╗██╔═══██╗██╔══██╗██╔════╝██║     ██╔═══██╗██║   ██║██╔══██╗
██████╔╝██║   ██║██████╔╝██║     ██║     ██║   ██║██║   ██║██║  ██║
██╔═══╝ ██║   ██║██╔══██╗██║     ██║     ██║   ██║██║   ██║██║  ██║
██║     ╚██████╔╝██║  ██║╚██████╗███████╗╚██████╔╝╚██████╔╝██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ 
    `);
    console.log('\x1b[32m%s\x1b[0m', 'Mobclowd – AI Website Builder');
    console.log(`\nServer running at http://localhost:${port}`);
    openBrowser(`http://localhost:${port}`);
});
