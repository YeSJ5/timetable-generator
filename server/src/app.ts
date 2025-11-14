import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import teachersRouter from './routes/teachers';
import subjectsRouter from './routes/subjects';
import sectionsRouter from './routes/sections';
import roomsRouter from './routes/rooms';
import labsRouter from './routes/labs';
import mappingsRouter from './routes/mappings';
import timetableRouter from './routes/timetable';
import adminRouter from './routes/admin';
import preferencesRouter from './routes/preferences';
import regenerationRouter from './routes/regeneration';
import healthRouter from './routes/health';
import openapiRouter from './routes/openapi';
import debugRouter from './routes/debug';
import { initializeConstraintEngine } from './engine/constraints';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { rateLimit, RATE_LIMITS } from './middleware/rateLimit';

const app = express();

// Initialize constraint engine on startup
initializeConstraintEngine();

// Security: Limit JSON payload size (10MB max)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers (production only)
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Request logging (dev mode only)
app.use(requestLogger);

// Rate limiting for read-only endpoints
app.use(rateLimit(RATE_LIMITS.READ_ONLY));

// Routes
app.use('/teachers', teachersRouter);
app.use('/subjects', subjectsRouter);
app.use('/sections', sectionsRouter);
app.use('/rooms', roomsRouter);
app.use('/labs', labsRouter);
app.use('/mappings', mappingsRouter);
app.use('/timetable', timetableRouter);
app.use('/admin', adminRouter);
app.use('/preferences', preferencesRouter);
app.use('/regenerate', regenerationRouter);
app.use('/health', healthRouter);
app.use('/', openapiRouter);
app.use('/debug', debugRouter);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;

