const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'clientbase' },
  transports: [
    // Error logs - separate file
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // All logs
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    })
  ],
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Log error function used in routes
function logError(message, error, req, extraContext = {}) {
  const errorMsg = error.message ? error.message.split('\n')[0] : 'Unknown Error';    // Only log the first line of error message (cleaner logs)
  
  logger.error(`${message}: ${errorMsg}`, {
      userId: req.user?.id,
      route: req.route?.path || req.path,
      method: req.method,
      ...extraContext
  });
}

function logInfo(message, meta = {}) {
  logger.info(message, {
    ...meta
  });
}

module.exports = { logError, logInfo };