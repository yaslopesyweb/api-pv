// src/lib/logger.js
const winston = require('winston');

const { combine, timestamp, json, errors } = winston.format;

const logger = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
    ),
    defaultMeta: {
        service: 'api-pv',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        new winston.transports.Console(),
        ...(process.env.NODE_ENV !== 'production' ? [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' })
        ] : [])
    ]
});

module.exports = { logger };