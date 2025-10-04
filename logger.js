/* eslint-env node */

const winston = require('winston');
const crypto = require('crypto');

// ============================================
// CONFIGURATION
// ============================================

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FULL_CODE = process.env.LOG_FULL_CODE === 'true';
const HASH_USER_IDS = process.env.HASH_USER_IDS !== 'false'; // default true for privacy
const MAX_QUESTION_LENGTH = 500;
const MAX_RESPONSE_LENGTH = 200;
const MAX_CODE_LENGTH = 2000;
const MAX_ERROR_LENGTH = 1000;

// ============================================
// LOGGER SETUP
// ============================================

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'kipr-simulator',
    version: require('./package.json').version,
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Log to console (stdout) - Promtail will collect these
    new winston.transports.Console()
  ]
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Hash a string for privacy (one-way hash)
 */
const hashString = (str) => {
  if (!str) return null;
  return crypto.createHash('sha256')
    .update(str)
    .digest('hex')
    .substring(0, 16);
};

/**
 * Truncate a string to max length
 */
const truncate = (str, maxLength) => {
  if (!str) return null;
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
};

/**
 * Classify compilation errors by type
 */
const classifyCompilationError = (stderr) => {
  if (!stderr) return null;
  if (stderr.includes('undefined reference')) return 'linker_error';
  if (stderr.includes('syntax error') || stderr.includes('expected')) return 'syntax_error';
  if (stderr.includes('timeout') || stderr.includes('killed')) return 'timeout';
  if (stderr.includes('permission denied')) return 'permission_error';
  if (stderr.includes('No such file')) return 'file_not_found';
  if (stderr.includes('cannot open')) return 'file_error';
  return 'unknown_error';
};

// ============================================
// STRUCTURED LOGGING FUNCTIONS
// ============================================

/**
 * Log AI assistant request
 */
const logAiRequest = (data) => {
  logger.info('AI request', {
    type: 'ai_request',
    user_id: HASH_USER_IDS && data.userId ? hashString(data.userId) : data.userId,
    session_id: data.sessionId || 'unknown',
    model: data.model || 'unknown',
    language: data.language || 'unknown',
    question: truncate(data.question, MAX_QUESTION_LENGTH),
    code_snippet: data.code ? truncate(data.code, MAX_CODE_LENGTH) : null,
    response_summary: data.response ? truncate(data.response, MAX_RESPONSE_LENGTH) : null,
    duration_ms: data.duration,
    status: data.status,
    tokens_used: data.tokens || null,
    challenge_mentioned: data.challengeMentioned || false
  });
};

/**
 * Log code compilation attempt
 */
const logCompilation = (data) => {
  const logData = {
    type: 'compilation',
    user_id: HASH_USER_IDS && data.userId ? hashString(data.userId) : data.userId,
    session_id: data.sessionId || 'unknown',
    language: data.language || 'C',
    code_size_bytes: data.code ? data.code.length : 0,
    duration_ms: data.duration,
    status: data.status,
    stdout: truncate(data.stdout, MAX_ERROR_LENGTH),
    stderr: truncate(data.stderr, MAX_ERROR_LENGTH),
    error_type: classifyCompilationError(data.stderr)
  };
  
  // Optionally log full code or just hash
  if (LOG_FULL_CODE && data.code) {
    logData.code = truncate(data.code, MAX_CODE_LENGTH);
  } else if (data.code) {
    logData.code_hash = hashString(data.code);
  }
  
  logger.info('Compilation', logData);
};

/**
 * Log authentication attempt
 */
const logAuthAttempt = (data) => {
  logger.info('Auth attempt', {
    type: 'auth_attempt',
    user_id: HASH_USER_IDS && data.userId ? hashString(data.userId) : data.userId,
    ip_address: data.ip ? hashString(data.ip) : null,
    user_agent: truncate(data.userAgent, 200),
    result: data.result,
    failure_reason: data.failureReason || null,
    provider: data.provider || 'firebase',
    duration_ms: data.duration
  });
};

/**
 * Log application error
 */
const logError = (error, context = {}) => {
  logger.error('Application error', {
    type: 'error',
    severity: context.severity || 'error',
    component: context.component || 'unknown',
    message: error.message || String(error),
    stack_trace: error.stack || null,
    user_id: HASH_USER_IDS && context.userId ? hashString(context.userId) : context.userId,
    request_path: context.path,
    request_method: context.method,
    error_code: error.code || null
  });
};

/**
 * Log user feedback
 */
const logFeedback = (data) => {
  const sentimentLabel = data.sentiment === 1 ? 'negative'
    : data.sentiment === 2 ? 'neutral'
      : data.sentiment === 3 ? 'positive'
        : 'unknown';
  
  logger.info('User feedback', {
    type: 'feedback',
    user_id: HASH_USER_IDS && data.userId ? hashString(data.userId) : data.userId,
    sentiment: sentimentLabel,
    feedback_text: truncate(data.feedback, 500),
    email: data.email ? hashString(data.email) : null, // hash email for privacy
    include_anon_data: data.includeAnonData || false
  });
};

/**
 * Log rate limit hit
 */
const logRateLimit = (data) => {
  logger.warn('Rate limit hit', {
    type: 'rate_limit',
    endpoint: data.endpoint,
    ip_address: data.ip ? hashString(data.ip) : null,
    user_id: HASH_USER_IDS && data.userId ? hashString(data.userId) : data.userId
  });
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  logger,
  logAiRequest,
  logCompilation,
  logAuthAttempt,
  logError,
  logFeedback,
  logRateLimit
};

