/* eslint-env node */

const promClient = require('prom-client');

// Use the default registry
const register = promClient.register;

// Add default Node.js metrics (memory, CPU, event loop, etc.)
promClient.collectDefaultMetrics({ 
  register,
  prefix: 'nodejs_'
});

// We'll create a simple middleware instead of using promBundle
// HTTP request metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

// Simple middleware to track HTTP requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const path = req.route ? req.route.path : req.path;
    httpRequestDuration.observe({
      method: req.method,
      path: path,
      status_code: res.statusCode
    }, duration);
  });
  
  next();
};

// ============================================
// CUSTOM APPLICATION METRICS
// ============================================

// Compilation Metrics
const compilationCounter = new promClient.Counter({
  name: 'simulator_compilation_requests_total',
  help: 'Total number of code compilation requests',
  labelNames: ['status', 'language'],
  registers: [register]
});

const compilationDuration = new promClient.Histogram({
  name: 'simulator_compilation_duration_seconds',
  help: 'Duration of code compilations',
  labelNames: ['status', 'language'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register]
});

const compilationCodeSize = new promClient.Histogram({
  name: 'simulator_compilation_code_size_bytes',
  help: 'Size of code being compiled',
  labelNames: ['language'],
  buckets: [100, 500, 1000, 5000, 10000, 50000],
  registers: [register]
});

// AI Assistant Metrics
const aiRequestCounter = new promClient.Counter({
  name: 'simulator_ai_requests_total',
  help: 'Total number of AI completion requests',
  labelNames: ['model', 'status', 'language'],
  registers: [register]
});

const aiDuration = new promClient.Histogram({
  name: 'simulator_ai_response_duration_seconds',
  help: 'Duration of AI API responses',
  labelNames: ['model', 'status'],
  buckets: [0.5, 1, 2, 5, 10, 20, 30],
  registers: [register]
});

const aiTokens = new promClient.Histogram({
  name: 'simulator_ai_tokens_used',
  help: 'Number of tokens used per AI request',
  labelNames: ['model'],
  buckets: [10, 50, 100, 200, 500, 1000, 2000],
  registers: [register]
});

const aiChallengeMentions = new promClient.Counter({
  name: 'simulator_ai_challenge_mentions_total',
  help: 'Number of AI requests mentioning challenges',
  labelNames: ['model'],
  registers: [register]
});

// Authentication Metrics
const authCounter = new promClient.Counter({
  name: 'simulator_auth_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['result', 'provider'],
  registers: [register]
});

const authDuration = new promClient.Histogram({
  name: 'simulator_auth_duration_seconds',
  help: 'Duration of authentication attempts',
  labelNames: ['result', 'provider'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Rate Limiting Metrics
const rateLimitHits = new promClient.Counter({
  name: 'simulator_rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['endpoint'],
  registers: [register]
});

// Feedback Metrics
const feedbackCounter = new promClient.Counter({
  name: 'simulator_feedback_submissions_total',
  help: 'Total feedback submissions',
  labelNames: ['sentiment'],
  registers: [register]
});

// Build metrics object for export
const metrics = {
  register,
  metricsMiddleware,
  
  compilation: {
    counter: compilationCounter,
    duration: compilationDuration,
    codeSize: compilationCodeSize
  },
  
  ai: {
    counter: aiRequestCounter,
    duration: aiDuration,
    tokens: aiTokens,
    challengeMentions: aiChallengeMentions
  },
  
  auth: {
    counter: authCounter,
    duration: authDuration
  },
  
  rateLimit: {
    hits: rateLimitHits
  },
  
  feedback: {
    counter: feedbackCounter
  }
};

module.exports = metrics;

