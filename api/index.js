import app from '../server.js';

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Handler Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal Serverless Handler Error' });
  }
}
