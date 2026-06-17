const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/authRoutes');
const scanRoutes = require('./routes/scanRoutes');
const resultRoutes = require('./routes/resultRoutes');
const docRoutes = require('./routes/docRoutes');
const securityRoutes = require('./routes/securityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import middlewares and schemas
const protect = require('./middleware/authMiddleware');
const validate = require('./middleware/validationMiddleware');
const { authLimiter, globalLimiter } = require('./middleware/rateLimiter');
const { registerSchema, loginSchema, scanSchema } = require('./validators/schemas');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Disable x-powered-by header
app.disable('x-powered-by');

// 1. helmet()
app.use(helmet());

// 2. express.json({ limit: '10kb' })
app.use(express.json({ limit: '10kb' }));

// 3. rate limiter (global) (Skip auth routes to keep authLimiter separate)
app.use(/^\/api\/(?!auth).*/, globalLimiter);

// 4. morgan logger
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 5 & 6. Routes and Route-level middleware (validation + auth)
// Public Routes
app.use('/api/auth/register', authLimiter, validate(registerSchema), authRoutes);
app.use('/api/auth/login', authLimiter, validate(loginSchema), authRoutes);
app.use('/api/auth', authRoutes); // Fallback router mapping

// Protected Routes (require Bearer Token)
app.use('/api/scan', protect, validate(scanSchema), scanRoutes);
app.use('/api/results', protect, resultRoutes);
app.use('/api/docs', protect, docRoutes);
app.use('/api/security', protect, securityRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);

// Fallback for API routes specifically (unmatched /api/ routes return JSON 404)
app.all('/api/*', notFoundHandler);

// Serve frontend static assets (from /mern-server/client)
const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));

// SPA Fallback: Serve index.html for any other non-API routes (supporting React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// 7. Global API Error middleware
app.use(errorHandler);

module.exports = app;
