import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
import customViewsRoutes from './routes/customViews.js';
import loanConditionRiskRoutes from './routes/loan-condition-risk.js';

// === BATCH 05 AUTO-MOUNT imports ===
import collectionCuratorAgentRouter from './routes/collection-curator-agent.js';
import visionArtifactDocRouter from './routes/vision-artifact-doc.js';
import visitorJourneyAgentRouter from './routes/visitor-journey-agent.js';
import conservationAutonomousRouter from './routes/conservation-autonomous.js';
import interMuseumNetworkRouter from './routes/inter-museum-network.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'museum-secret-key-change-in-production';

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
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
app.use('/api/custom-views', authenticateToken, customViewsRoutes);
app.use('/api/loan-condition-risk', authenticateToken, loanConditionRiskRoutes);

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


// === BATCH 05 AUTO-MOUNT (custom feature suggestions) ===
app.use('/api/collection-curator-agent', collectionCuratorAgentRouter);
app.use('/api/vision-artifact-doc', visionArtifactDocRouter);
app.use('/api/visitor-journey-agent', visitorJourneyAgentRouter);
app.use('/api/conservation-autonomous', conservationAutonomousRouter);
app.use('/api/inter-museum-network', interMuseumNetworkRouter);

// === Batch 05 Gaps & Frontend Mounts ===
try { const _gap_ai_visitor_experience_personalize = require('./routes/gap-ai-visitor-experience-personalize'); app.use('/api/gap-ai-visitor-experience-personalize', _gap_ai_visitor_experience_personalize); } catch(e) { console.error('gap mount fail ai-visitor-experience-personalize:', e.message); }
try { const _gap_ai_collection_valuation = require('./routes/gap-ai-collection-valuation'); app.use('/api/gap-ai-collection-valuation', _gap_ai_collection_valuation); } catch(e) { console.error('gap mount fail ai-collection-valuation:', e.message); }
try { const _gap_ai_conservation_priority = require('./routes/gap-ai-conservation-priority'); app.use('/api/gap-ai-conservation-priority', _gap_ai_conservation_priority); } catch(e) { console.error('gap mount fail ai-conservation-priority:', e.message); }
try { const _gap_ai_event_attendance_predict = require('./routes/gap-ai-event-attendance-predict'); app.use('/api/gap-ai-event-attendance-predict', _gap_ai_event_attendance_predict); } catch(e) { console.error('gap mount fail ai-event-attendance-predict:', e.message); }
try { const _gap_visitor = require('./routes/gap-visitor'); app.use('/api/gap-visitor', _gap_visitor); } catch(e) { console.error('gap mount fail visitor:', e.message); }
try { const _gap_virtual = require('./routes/gap-virtual'); app.use('/api/gap-virtual', _gap_virtual); } catch(e) { console.error('gap mount fail virtual:', e.message); }
try { const _gap_teacher = require('./routes/gap-teacher'); app.use('/api/gap-teacher', _gap_teacher); } catch(e) { console.error('gap mount fail teacher:', e.message); }
try { const _gap_donation = require('./routes/gap-donation'); app.use('/api/gap-donation', _gap_donation); } catch(e) { console.error('gap mount fail donation:', e.message); }
try { const _gap_conservation = require('./routes/gap-conservation'); app.use('/api/gap-conservation', _gap_conservation); } catch(e) { console.error('gap mount fail conservation:', e.message); }
try { const _gap_security = require('./routes/gap-security'); app.use('/api/gap-security', _gap_security); } catch(e) { console.error('gap mount fail security:', e.message); }
try { const _gap_mobile = require('./routes/gap-mobile'); app.use('/api/gap-mobile', _gap_mobile); } catch(e) { console.error('gap mount fail mobile:', e.message); }
try { const _gap_authentication = require('./routes/gap-authentication'); app.use('/api/gap-authentication', _gap_authentication); } catch(e) { console.error('gap mount fail authentication:', e.message); }
// === End Batch 05 Mounts ===
