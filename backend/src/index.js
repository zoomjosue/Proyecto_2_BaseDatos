require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const session = require('express-session');

const routes           = require('./routes');
const { seedDemoVentas } = require('./controllers/authController');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || true,
  credentials: true,
}));
app.use(express.json());
app.use(session({
  name: 'tienda.sid',
  secret: process.env.SESSION_SECRET || 'dev_session_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

// API
app.use('/api', routes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Error handler global
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, async () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
  try {
    await seedDemoVentas();
  } catch (e) {
    console.warn('Seed demo postponed:', e.message);
  }
});
