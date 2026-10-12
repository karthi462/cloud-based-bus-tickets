import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { CONFIG } from './config/constants.js';

import authRoutes from './routes/authRoutes.js';
import biometricRoutes from './routes/biometricRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import conductorRoutes from './routes/conductorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allows local dev and CloudFront / S3 static distribution
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check & Cloud Architecture Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'CloudBus - Smart Fingerprint Ticketing & Travel Credit API',
    version: '1.0.0',
    mode: CONFIG.USE_DYNAMODB ? 'AWS_DYNAMODB_CLOUD' : 'LOCAL_DEVELOPMENT_PERSISTENT',
    region: CONFIG.AWS_REGION,
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/biometrics', biometricRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/conductor', conductorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/location', locationRoutes);

// 404 Route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.path} not found on CloudBus server`,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
