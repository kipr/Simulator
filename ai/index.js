/* eslint-env node */
/* global fetch */

const express = require('express');
const RateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');



/**
 * Creates a router for Ai integration
 * @param {Object} config Application configuration
 * @param {Object} firebaseTokenManager Firebase token manager for authentication
 * @returns {express.Router} Router for Ai endpoints
 */
function createAiRouter(firebaseTokenManager, config) {
  const headers = config.claude.prompt.headers.map(headerPath => {
    const headerContent = fs.readFileSync(headerPath, 'utf8');
    return headerContent;
  }).join('\n');

  const systemPromptPath = path.join(__dirname, 'systemPrompt.md');
  const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8')
    .replace('{{headers}}', headers);

  const router = express.Router();

  // Rate limiter: 20 requests per minute per user
  const aiRateLimiter = RateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // 20 requests per window per user
    standardHeaders: true,
    message: { error: 'Too many requests, please try again later.' },
    keyGenerator: (req) => {
      // Use the user's UID from the Firebase token for per-user rate limiting
      return req.user?.uid || req.ip; // Fallback to IP if no user (shouldn't happen after auth)
    }
  });

  // Apply rate limiter to all routes
  router.use(aiRateLimiter);

  // Authentication middleware
  router.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the Firebase token
      const decodedToken = await firebaseTokenManager.verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  });

  // Claude completion endpoint
  router.post('/completion', async (req, res) => {
    const {
      messages,
      code,
      language,
      console: consoleText,
      robot,
      model = 'claude-sonnet-4-20250514'
    } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Bad request: messages array is required' });
    }

    if (!config.claude || !config.claude.apiKey) {
      return res.status(500).json({ error: 'Server configuration error: Claude API key not configured' });
    }

    try {
      const system = systemPrompt
        .replace('{{code}}', code ?? 'Unknown')
        .replace('{{language}}', language ?? 'Unknown')
        .replace('{{console}}', consoleText ?? 'Unknown')
        .replace('{{robot}}', JSON.stringify(robot) ?? 'Unknown');

      console.log('https://api.anthropic.com/v1/messages', {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.claude.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          system,
          messages,
          max_tokens: 1024,
        })
      });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.claude.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          system,
          messages,
          max_tokens: 1024,
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { status: response.status, data };
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Error calling Claude API:', error.data || error.message);
      
      // Forward Claude API errors, or return generic error
      if (error.status && error.data) {
        return res.status(error.status).json(error.data);
      }
      
      return res.status(500).json({ error: 'Error calling Claude API' });
    }
  });

  return router;
}

module.exports = createAiRouter; 