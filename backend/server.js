import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './db.js';

// Route imports
import collectionsRoutes from './routes/collections.js';
import objectsRoutes from './routes/objects.js';
import loansRoutes from './routes/loans.js';
import exhibitionsRoutes from './routes/exhibitions.js';
import galleriesRoutes from './routes/galleries.js';
import conservationRoutes from './routes/conservation.js';
import environmentRoutes from './routes/environment.js';
import storageRoutes from './routes/storage.js';
import insuranceRoutes from './routes/insurance.js';
import ticketingRoutes from './routes/ticketing.js';
import membershipsRoutes from './routes/memberships.js';
import donorsRoutes from './routes/donors.js';
import giftshopRoutes from './routes/giftshop.js';
import eventsRoutes from './routes/events.js';
import educationRoutes from './routes/education.js';
import volunteersRoutes from './routes/volunteers.js';
import toursRoutes from './routes/tours.js';
import visitorsRoutes from './routes/visitors.js';
import securityRoutes from './routes/security.js';
import maintenanceRoutes from './routes/maintenance.js';
import aiRoutes from './routes/ai.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'museum-secret-key-change-in-production';

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ---------------------------------------------------------------------------
// Public routes
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// Protected routes
// ---------------------------------------------------------------------------
app.use('/api/collections', authenticateToken, collectionsRoutes);
app.use('/api/objects', authenticateToken, objectsRoutes);
app.use('/api/loans', authenticateToken, loansRoutes);
app.use('/api/exhibitions', authenticateToken, exhibitionsRoutes);
app.use('/api/galleries', authenticateToken, galleriesRoutes);
app.use('/api/conservation', authenticateToken, conservationRoutes);
app.use('/api/environment', authenticateToken, environmentRoutes);
app.use('/api/storage', authenticateToken, storageRoutes);
app.use('/api/insurance', authenticateToken, insuranceRoutes);
app.use('/api/ticketing', authenticateToken, ticketingRoutes);
app.use('/api/memberships', authenticateToken, membershipsRoutes);
app.use('/api/donors', authenticateToken, donorsRoutes);
app.use('/api/giftshop', authenticateToken, giftshopRoutes);
app.use('/api/events', authenticateToken, eventsRoutes);
app.use('/api/education', authenticateToken, educationRoutes);
app.use('/api/volunteers', authenticateToken, volunteersRoutes);
app.use('/api/tours', authenticateToken, toursRoutes);
app.use('/api/visitors', authenticateToken, visitorsRoutes);
app.use('/api/security', authenticateToken, securityRoutes);
app.use('/api/maintenance', authenticateToken, maintenanceRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Museum Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
