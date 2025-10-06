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

// Session Metrics
const sessionInteractions = new promClient.Counter({
  name: 'simulator_session_interactions_total',
  help: 'Total interactions per session',
  labelNames: ['session_id', 'interaction_type'],
  registers: [register]
});

const sessionFirstInteraction = new promClient.Gauge({
  name: 'simulator_session_first_interaction_timestamp',
  help: 'Timestamp of first interaction in session (Unix epoch seconds)',
  labelNames: ['session_id'],
  registers: [register]
});

const sessionLastInteraction = new promClient.Gauge({
  name: 'simulator_session_last_interaction_timestamp',
  help: 'Timestamp of last interaction in session (Unix epoch seconds)',
  labelNames: ['session_id'],
  registers: [register]
});

const sessionInteractionSequence = new promClient.Counter({
  name: 'simulator_session_interaction_sequence_total',
  help: 'Count of interaction sequences (from -> to)',
  labelNames: ['session_id', 'from_interaction', 'to_interaction'],
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
  },
  
  session: {
    interactions: sessionInteractions,
    firstInteraction: sessionFirstInteraction,
    lastInteraction: sessionLastInteraction,
    interactionSequence: sessionInteractionSequence
  }
};

// Helper function to track session interactions
// Stores last interaction type per session (in-memory, stateless per pod)
const sessionLastInteractionMap = new Map();

// Clean up old sessions periodically (older than 30 minutes)
setInterval(() => {
  const now = Date.now();
  const thirtyMinutes = 30 * 60 * 1000;
  
  for (const [sessionId, data] of sessionLastInteractionMap.entries()) {
    if (now - data.timestamp > thirtyMinutes) {
      sessionLastInteractionMap.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

/**
 * Track a session interaction
 * @param {string} sessionId - Session identifier
 * @param {string} interactionType - Type of interaction (compile, ai_query, feedback, api_call)
 */
function trackSessionInteraction(sessionId, interactionType) {
  if (!sessionId || sessionId === 'unknown') return;
  
  const now = Date.now() / 1000; // Convert to seconds for Prometheus
  
  // Track the interaction
  metrics.session.interactions.inc({ session_id: sessionId, interaction_type: interactionType });
  
  // Update timestamps
  const labels = { session_id: sessionId };
  
  // Check if this is the first interaction
  const existing = sessionLastInteractionMap.get(sessionId);
  if (!existing) {
    metrics.session.firstInteraction.set(labels, now);
  }
  
  // Always update last interaction
  metrics.session.lastInteraction.set(labels, now);
  
  // Track interaction sequence (from -> to)
  if (existing && existing.interactionType !== interactionType) {
    metrics.session.interactionSequence.inc({
      session_id: sessionId,
      from_interaction: existing.interactionType,
      to_interaction: interactionType
    });
  }
  
  // Update the last interaction tracking
  sessionLastInteractionMap.set(sessionId, {
    interactionType,
    timestamp: Date.now()
  });
}

metrics.trackSessionInteraction = trackSessionInteraction;

module.exports = metrics;

