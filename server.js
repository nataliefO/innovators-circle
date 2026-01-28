import 'dotenv/config';
import http from 'http';
import handler from './api/slack.js';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // Add Express-like helpers for compatibility with Vercel handler
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };

  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };

  res.send = (data) => {
    res.end(data);
    return res;
  };

  // Route to handler
  if (req.url === '/api/slack' && req.method === 'POST') {
    handler(req, res);
  } else {
    res.statusCode = 200;
    res.end('Opie is running. POST to /api/slack');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Slack endpoint: http://localhost:${PORT}/api/slack`);
});
