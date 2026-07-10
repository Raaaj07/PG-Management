import './dns-setup.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import syncRouter from './routes/syncRoute.js';
import authRouter from './routes/authRoute.js';
import dataRouter from './routes/dataRoute.js';

// Trigger restart to load updated .env credentials (attempt 4)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large payloads since syncing sends entire collections
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let isConnected = false;
let dbError = null;

const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pg-management';
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  try {
    await mongoose.connect(mongoUri);
    isConnected = true;
    dbError = null;
    console.log('Successfully connected to MongoDB.');
  } catch (error) {
    isConnected = false;
    dbError = error.message;
    console.error('Failed to connect to MongoDB:', error.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDb, 5000);
  }
};

// Middleware to check database connection status
app.use((req, res, next) => {
  if (!isConnected && req.path.startsWith('/api/sync')) {
    return res.status(503).json({
      success: false,
      error: `Database is offline. Detail: ${dbError || 'Establishing connection...'}`
    });
  }
  next();
});

// Routes
app.use('/api/sync', syncRouter);
app.use('/api/auth', authRouter);
app.use('/api', dataRouter);

app.get('/health', (req, res) => {
  res.json({ 
    status: isConnected ? 'UP' : 'DEGRADED', 
    database: isConnected ? 'CONNECTED' : 'DISCONNECTED',
    error: dbError,
    timestamp: new Date() 
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  connectDb();
});
